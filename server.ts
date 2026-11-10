import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// In-memory and persistent disk audio cache
// Stores: hash -> { audioBase64: string, mimeType: string, createdAt: number }
const audioCache = new Map<string, { audioBase64: string; mimeType: string; createdAt: number }>();
const inFlightServerRequests = new Map<string, Promise<{ audioBase64: string; mimeType: string }>>();
const MAX_CACHE_ENTRIES = 800;
const DISK_CACHE_DIR = path.resolve(__dirname, '.audio_cache');

try {
  if (!fs.existsSync(DISK_CACHE_DIR)) {
    fs.mkdirSync(DISK_CACHE_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('Could not create audio disk cache directory:', e);
}

function getCacheKey(text: string, voiceName: string): string {
  // Speed is excluded intentionally: client HTML5 Audio controls playbackRate natively
  return crypto.createHash('sha256').update(`${text.trim()}_${voiceName}`).digest('hex');
}

function readDiskCache(key: string): { audioBase64: string; mimeType: string; createdAt: number } | null {
  try {
    const filePath = path.join(DISK_CACHE_DIR, `${key}.json`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    // Ignore read errors
  }
  return null;
}

function writeDiskCache(key: string, data: { audioBase64: string; mimeType: string; createdAt: number }) {
  try {
    const filePath = path.join(DISK_CACHE_DIR, `${key}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data), 'utf-8');
  } catch (err) {
    // Ignore disk write errors
  }
}

let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        apiVersion: 'v1alpha',
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health & Status endpoint
app.get('/api/tts/status', (req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'ok',
    neuralTtsAvailable: hasKey,
    cachedItems: audioCache.size,
    defaultVoice: 'Kore',
    availableVoices: [
      { id: 'Kore', name: 'مس/ ندى بدوي (شرح مصري طبيعي)', gender: 'female', recommended: true },
      { id: 'Aoede', name: 'دكتورة أحياء (نبرة هادئة ورسمية)', gender: 'female', recommended: false },
      { id: 'Puck', name: 'أستاذ أحياء (صوت رجالي تعليمي)', gender: 'male', recommended: false }
    ]
  });
});

// Primary Neural TTS generation endpoint
app.post('/api/tts', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text, voiceName = 'Kore' } = req.body || {};

    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    const trimmedText = text.trim();
    const cacheKey = getCacheKey(trimmedText, voiceName);

    // 1. Check in-memory LRU cache
    if (audioCache.has(cacheKey)) {
      const cached = audioCache.get(cacheKey)!;
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
      res.json({
        audioBase64: cached.audioBase64,
        mimeType: cached.mimeType,
        cached: true,
      });
      return;
    }

    // 2. Check disk cache
    const diskCached = readDiskCache(cacheKey);
    if (diskCached) {
      audioCache.set(cacheKey, diskCached);
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
      res.json({
        audioBase64: diskCached.audioBase64,
        mimeType: diskCached.mimeType,
        cached: true,
      });
      return;
    }

    const ai = getGenAI();
    if (!ai) {
      res.status(503).json({
        error: 'GEMINI_API_KEY_NOT_CONFIGURED',
        message: 'مفتاح Gemini API غير متاح في بيئة السيرفر حالياً.',
        fallbackToBrowser: true,
      });
      return;
    }

    // 3. Deduplicate concurrent requests for the exact same text and voice
    let requestPromise = inFlightServerRequests.get(cacheKey);
    if (!requestPromise) {
      requestPromise = (async () => {
        // Enforce 10s maximum timeout to prevent hanging the client
        const modelsToTry = ['gemini-3.8-flash-lite-tts', 'gemini-3.8-flash-tts'];
        let lastError: any = null;

        for (const modelName of modelsToTry) {
          try {
            const ttsPromise = ai.models.generateContent({
              model: modelName,
              contents: [
                {
                  role: 'user',
                  parts: [{ text: trimmedText }],
                },
              ],
              config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: {
                      voiceName: voiceName || 'Kore',
                    },
                  },
                },
              },
            });

            const timeoutPromise = new Promise<never>((_, reject) => {
              setTimeout(() => reject(new Error('TTS_REQUEST_TIMEOUT')), 10000);
            });

            const response: any = await Promise.race([ttsPromise, timeoutPromise]);
            const candidate = response.candidates?.[0];
            const audioPart = candidate?.content?.parts?.find((p: any) => p.inlineData?.data);
            const audioBase64 = audioPart?.inlineData?.data;
            const mimeType = audioPart?.inlineData?.mimeType || 'audio/wav';

            if (audioBase64) {
              return { audioBase64, mimeType };
            }
          } catch (err: any) {
            lastError = err;
            console.warn(`Model ${modelName} failed:`, err?.message || err);
            // If it's a quota or rate-limit error, try next model immediately
            continue;
          }
        }

        throw lastError || new Error('NO_AUDIO_RETURNED');
      })();

      inFlightServerRequests.set(cacheKey, requestPromise);
    }

    const result = await requestPromise.finally(() => {
      inFlightServerRequests.delete(cacheKey);
    });

    // Cache the generated audio
    if (audioCache.size >= MAX_CACHE_ENTRIES) {
      const firstKey = audioCache.keys().next().value;
      if (firstKey) audioCache.delete(firstKey);
    }

    const cacheEntry = {
      audioBase64: result.audioBase64,
      mimeType: result.mimeType,
      createdAt: Date.now(),
    };
    audioCache.set(cacheKey, cacheEntry);
    writeDiskCache(cacheKey, cacheEntry);

    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    res.json({
      audioBase64: result.audioBase64,
      mimeType: result.mimeType,
      cached: false,
    });
  } catch (err: any) {
    console.error('Error generating Neural TTS:', err?.message || err);
    const isQuota = err?.message?.includes('429') || err?.message?.includes('QUOTA') || err?.message?.includes('RESOURCE_EXHAUSTED');
    res.status(isQuota ? 429 : 500).json({
      error: isQuota ? 'QUOTA_EXCEEDED' : 'TTS_GENERATION_FAILED',
      message: isQuota ? 'تم استنفاد حصة التوليد المجانية اليومية للذكاء الاصطناعي. يرجى تجربة العناصر المخزنة مسبقاً أو تفعيل الباقة.' : (err?.message || 'فشل في توليد الصوت العصبي.'),
      fallbackToBrowser: true,
      quotaExceeded: isQuota,
    });
  }
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BioAnatomy 3D Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
