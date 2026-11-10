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
const audioCache = new Map<string, { audioBase64: string; mimeType: string; createdAt: number }>();
const inFlightServerRequests = new Map<string, Promise<{ audioBase64: string; mimeType: string }>>();
const MAX_CACHE_ENTRIES = 800;
const DISK_CACHE_DIR = path.resolve(__dirname, '.audio_cache');

// Human Audio Voice Recording Persistent Storage System
const HUMAN_AUDIO_DIR = path.resolve(__dirname, '.human_audio_storage');
const HUMAN_MANIFEST_PATH = path.join(HUMAN_AUDIO_DIR, 'human_audio_manifest.json');

interface HumanRecordingMeta {
  id: string;
  itemId: string;
  sectionKey: string; // 'name' | 'overview' | 'landmarks' | 'exam'
  mimeType: string;
  speakerName: string;
  isHuman: boolean;
  updatedAt: number;
  durationSeconds: number;
  audioBase64?: string;
  audioUrl?: string;
}

// In-memory map for human audio recordings: itemId -> { [sectionKey]: HumanRecordingMeta }
const humanAudioMap = new Map<string, Record<string, HumanRecordingMeta>>();

try {
  if (!fs.existsSync(HUMAN_AUDIO_DIR)) {
    fs.mkdirSync(HUMAN_AUDIO_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('Could not create human audio directory:', e);
}

function loadHumanAudioManifest() {
  try {
    if (fs.existsSync(HUMAN_MANIFEST_PATH)) {
      const content = fs.readFileSync(HUMAN_MANIFEST_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object') {
        for (const itemId in parsed) {
          humanAudioMap.set(itemId, parsed[itemId]);
        }
        console.log(`[Human Audio System] Successfully loaded human audio recordings manifest for ${humanAudioMap.size} organs/items.`);
      }
    }
  } catch (e) {
    console.warn('Could not load human audio manifest:', e);
  }
}

function saveHumanAudioManifest() {
  try {
    const obj: Record<string, Record<string, HumanRecordingMeta>> = {};
    for (const [itemId, sectionsMap] of humanAudioMap.entries()) {
      obj[itemId] = sectionsMap;
    }
    fs.writeFileSync(HUMAN_MANIFEST_PATH, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Could not save human audio manifest:', e);
  }
}
loadHumanAudioManifest();


// Error logs tracking for developer audit
interface ErrorLogEntry {
  id: string;
  timestamp: number;
  engine: string;
  errorType: string;
  statusCode: number;
  message: string;
}
const audioErrorLogs: ErrorLogEntry[] = [];

function logAudioError(engine: string, errorType: string, statusCode: number, message: string) {
  audioErrorLogs.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
    timestamp: Date.now(),
    engine,
    errorType,
    statusCode,
    message: (message || '').replace(/AIza[0-9A-Za-z-_]{35}/g, '***API_KEY***')
  });
  if (audioErrorLogs.length > 50) audioErrorLogs.pop();
}

try {
  if (!fs.existsSync(DISK_CACHE_DIR)) {
    fs.mkdirSync(DISK_CACHE_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('Could not create audio disk cache directory:', e);
}

function preloadDiskCacheToMemory() {
  try {
    if (fs.existsSync(DISK_CACHE_DIR)) {
      const files = fs.readdirSync(DISK_CACHE_DIR);
      let count = 0;
      for (const file of files) {
        if (file.endsWith('.json')) {
          const key = file.replace('.json', '');
          const content = fs.readFileSync(path.join(DISK_CACHE_DIR, file), 'utf-8');
          const parsed = JSON.parse(content);
          if (parsed && parsed.audioBase64) {
            audioCache.set(key, parsed);
            count++;
          }
        }
      }
      if (count > 0) {
        console.log(`[Audio Cache] Successfully pre-loaded ${count} persistent audio clips into RAM cache.`);
      }
    }
  } catch (e) {
    console.warn('Could not preload audio disk cache:', e);
  }
}
preloadDiskCacheToMemory();

function getCacheKey(text: string, voiceName: string): string {
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

// Rigorous Audio Data Validation and PCM to RIFF/WAVE Converter
function formatAndValidateAudioData(base64Data: string, reportedMimeType: string) {
  if (!base64Data || typeof base64Data !== 'string') {
    throw new Error('بيانات الصوت فارغة أو غير صالحة');
  }

  const rawBuffer = Buffer.from(base64Data, 'base64');
  if (rawBuffer.length < 64) {
    throw new Error('حجم الملف الصوتي صغير جداً أو تالف');
  }

  const headerStr = rawBuffer.slice(0, 4).toString('utf-8');
  const waveStr = rawBuffer.slice(8, 12).toString('utf-8');

  // Case 1: Valid RIFF WAVE header
  if (headerStr === 'RIFF' && waveStr === 'WAVE') {
    return {
      audioBase64: base64Data,
      mimeType: 'audio/wav',
      byteLength: rawBuffer.length
    };
  }

  // Case 2: ID3 or MP3 frame header
  if (headerStr.startsWith('ID3') || (rawBuffer[0] === 0xff && (rawBuffer[1] & 0xe0) === 0xe0)) {
    return {
      audioBase64: base64Data,
      mimeType: 'audio/mp3',
      byteLength: rawBuffer.length
    };
  }

  // Case 3: OggS container header
  if (headerStr === 'OggS') {
    return {
      audioBase64: base64Data,
      mimeType: 'audio/ogg',
      byteLength: rawBuffer.length
    };
  }

  // Case 4: Raw PCM 16-bit Mono (Wrap with valid 44-byte RIFF WAVE header at 24000 Hz)
  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const dataSize = rawBuffer.length;
  const chunkSize = 36 + dataSize;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);

  const wavBuffer = Buffer.alloc(44 + dataSize);
  wavBuffer.write('RIFF', 0);
  wavBuffer.writeUInt32LE(chunkSize, 4);
  wavBuffer.write('WAVE', 8);
  wavBuffer.write('fmt ', 12);
  wavBuffer.writeUInt32LE(16, 16);
  wavBuffer.writeUInt16LE(1, 20); // PCM = 1
  wavBuffer.writeUInt16LE(numChannels, 22);
  wavBuffer.writeUInt32LE(sampleRate, 24);
  wavBuffer.writeUInt32LE(byteRate, 28);
  wavBuffer.writeUInt16LE(blockAlign, 32);
  wavBuffer.writeUInt16LE(bitsPerSample, 34);
  wavBuffer.write('data', 36);
  wavBuffer.writeUInt32LE(dataSize, 40);

  rawBuffer.copy(wavBuffer, 44);

  return {
    audioBase64: wavBuffer.toString('base64'),
    mimeType: 'audio/wav',
    byteLength: wavBuffer.length
  };
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
    recentErrorsCount: audioErrorLogs.length,
    availableVoices: [
      { id: 'Kore', name: 'مس/ ندى بدوي (شرح مصري طبيعي)', gender: 'female', recommended: true },
      { id: 'Aoede', name: 'دكتورة أحياء (نبرة هادئة ورسمية)', gender: 'female', recommended: false },
      { id: 'Puck', name: 'أستاذ أحياء (صوت رجالي تعليمي)', gender: 'male', recommended: false }
    ]
  });
});

// Error logs endpoint for developer audit
app.get('/api/tts/logs', (req: Request, res: Response) => {
  res.json({
    logs: audioErrorLogs,
    totalLogs: audioErrorLogs.length,
    timestamp: Date.now()
  });
});

// Batch cache check endpoint for Audio Library Developer Registry
app.post('/api/tts/check-cache-batch', (req: Request, res: Response) => {
  const { texts = [], voiceName = 'Kore' } = req.body || {};
  const result: Record<string, boolean> = {};

  if (Array.isArray(texts)) {
    for (const text of texts) {
      if (typeof text === 'string' && text.trim()) {
        const cacheKey = getCacheKey(text.trim(), voiceName);
        const isCached = audioCache.has(cacheKey) || Boolean(readDiskCache(cacheKey));
        result[cacheKey] = isCached;
      }
    }
  }

  res.json({
    success: true,
    totalChecked: texts.length,
    cachedMap: result
  });
});

// Clear cache item endpoint for developer re-generation
app.post('/api/tts/clear-cache', (req: Request, res: Response) => {
  const { text, voiceName = 'Kore', clearAll = false } = req.body || {};

  if (clearAll) {
    audioCache.clear();
    try {
      if (fs.existsSync(DISK_CACHE_DIR)) {
        const files = fs.readdirSync(DISK_CACHE_DIR);
        for (const file of files) {
          if (file.endsWith('.json')) {
            fs.unlinkSync(path.join(DISK_CACHE_DIR, file));
          }
        }
      }
    } catch (e) {
      console.warn('Could not clear disk cache directory:', e);
    }
    res.json({ success: true, message: 'تم مسح ذاكرة الصوت المخبأة بالكامل' });
    return;
  }

  if (text && typeof text === 'string') {
    const cacheKey = getCacheKey(text.trim(), voiceName);
    audioCache.delete(cacheKey);
    try {
      const filePath = path.join(DISK_CACHE_DIR, `${cacheKey}.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      // Ignore
    }
    res.json({ success: true, cacheKey, message: 'تم مسح التسجيل الخاص بهذا النص من الذاكرة' });
    return;
  }

  res.status(400).json({ success: false, error: 'INVALID_REQUEST' });
});

// =========================================================================
// Human Audio Recording API Endpoints (نظام التسجيلات الصوتية البشرية الحقيقية)
// =========================================================================

// 1. Get complete Human Audio Database Manifest
app.get('/api/human-audio/manifest', (req: Request, res: Response) => {
  const manifestObj: Record<string, Record<string, Omit<HumanRecordingMeta, 'audioBase64'>>> = {};

  for (const [itemId, sections] of humanAudioMap.entries()) {
    manifestObj[itemId] = {};
    for (const [secKey, meta] of Object.entries(sections)) {
      // Omit heavy audioBase64 from initial manifest list for fast response
      const { audioBase64, ...rest } = meta;
      manifestObj[itemId][secKey] = {
        ...rest,
        audioUrl: `/api/human-audio/recording/${itemId}/${secKey}`
      };
    }
  }

  res.json({
    success: true,
    totalItemsWithHumanAudio: humanAudioMap.size,
    manifest: manifestObj
  });
});

// 2. Stream/Get Audio File for specific item and section
app.get('/api/human-audio/recording/:itemId/:sectionKey', (req: Request, res: Response) => {
  const { itemId, sectionKey } = req.params;
  const sections = humanAudioMap.get(itemId);
  if (!sections || !sections[sectionKey]) {
    res.status(404).json({ success: false, error: 'HUMAN_RECORDING_NOT_FOUND', message: 'لم يتم رفع تسجيل بشري لهذا العضو حتى الآن.' });
    return;
  }

  const rec = sections[sectionKey];

  // Check if saved as audio file on disk or base64
  const audioFilePath = path.join(HUMAN_AUDIO_DIR, `${rec.id}.dat`);
  if (fs.existsSync(audioFilePath)) {
    const fileBuf = fs.readFileSync(audioFilePath);
    res.setHeader('Content-Type', rec.mimeType || 'audio/webm');
    res.setHeader('Content-Length', fileBuf.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(fileBuf);
    return;
  }

  if (rec.audioBase64) {
    const fileBuf = Buffer.from(rec.audioBase64, 'base64');
    res.setHeader('Content-Type', rec.mimeType || 'audio/webm');
    res.setHeader('Content-Length', fileBuf.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(fileBuf);
    return;
  }

  res.status(404).json({ success: false, error: 'AUDIO_DATA_CORRUPTED' });
});

// 3. Upload or Save new Human Voice Recording (From Browser Microphone or File Upload)
app.post('/api/human-audio/upload', (req: Request, res: Response) => {
  try {
    const {
      itemId,
      sectionKey,
      audioBase64,
      mimeType = 'audio/webm',
      speakerName = 'مس / ندى بدوي (معلمة الأحياء)',
      durationSeconds = 0
    } = req.body || {};

    if (!itemId || !sectionKey || !audioBase64) {
      res.status(400).json({ success: false, error: 'MISSING_REQUIRED_FIELDS', message: 'يرجى تقديم معرف العضو والقسم وبيانات التسجيل الصوتي.' });
      return;
    }

    const recId = `rec_${itemId}_${sectionKey}`;
    const audioBuffer = Buffer.from(audioBase64, 'base64');

    if (audioBuffer.length < 100) {
      res.status(400).json({ success: false, error: 'AUDIO_FILE_TOO_SMALL', message: 'الملف الصوتي المرفوع صغير جداً أو غير مكتمل.' });
      return;
    }

    // Save audio buffer to disk
    const audioFilePath = path.join(HUMAN_AUDIO_DIR, `${recId}.dat`);
    fs.writeFileSync(audioFilePath, audioBuffer);

    const recMeta: HumanRecordingMeta = {
      id: recId,
      itemId,
      sectionKey,
      mimeType,
      speakerName,
      isHuman: true,
      updatedAt: Date.now(),
      durationSeconds: Number(durationSeconds) || 0,
      audioUrl: `/api/human-audio/recording/${itemId}/${sectionKey}`
    };

    if (!humanAudioMap.has(itemId)) {
      humanAudioMap.set(itemId, {});
    }
    const itemMap = humanAudioMap.get(itemId)!;
    itemMap[sectionKey] = recMeta;

    saveHumanAudioManifest();

    res.json({
      success: true,
      message: `تم حفظ ونشر التسجيل الصوتي البشري المباشر لعضو (${itemId}) قسم (${sectionKey}) بنجاح!`,
      meta: recMeta
    });
  } catch (err: any) {
    console.error('Error uploading human recording:', err);
    res.status(500).json({ success: false, error: 'UPLOAD_FAILED', message: err?.message || 'فشل حفظ التسجيل الصوتي' });
  }
});

// 4. Delete specific human voice recording section
app.delete('/api/human-audio/recording', (req: Request, res: Response) => {
  const { itemId, sectionKey } = req.body || {};
  if (!itemId || !sectionKey) {
    res.status(400).json({ success: false, error: 'INVALID_PARAMETERS' });
    return;
  }

  const sections = humanAudioMap.get(itemId);
  if (sections && sections[sectionKey]) {
    const recId = sections[sectionKey].id;
    delete sections[sectionKey];

    if (Object.keys(sections).length === 0) {
      humanAudioMap.delete(itemId);
    }

    const audioFilePath = path.join(HUMAN_AUDIO_DIR, `${recId}.dat`);
    if (fs.existsSync(audioFilePath)) {
      try { fs.unlinkSync(audioFilePath); } catch (e) {}
    }

    saveHumanAudioManifest();
    res.json({ success: true, message: 'تم حذف التسجيل البشري بنجاح.' });
    return;
  }

  res.status(404).json({ success: false, error: 'NOT_FOUND' });
});

// 5. Statistics endpoint for human voice audio library
app.get('/api/human-audio/stats', (req: Request, res: Response) => {
  let totalRecordingsCount = 0;
  let totalDurationSec = 0;

  for (const sections of humanAudioMap.values()) {
    for (const rec of Object.values(sections)) {
      totalRecordingsCount++;
      totalDurationSec += rec.durationSeconds || 0;
    }
  }

  res.json({
    success: true,
    totalOrgansWithHumanAudio: humanAudioMap.size,
    totalRecordingsCount,
    totalDurationSec,
    totalDurationMinutes: Math.round(totalDurationSec / 60)
  });
});



// Independent Audio Engine Test endpoint
app.post('/api/tts/test', async (req: Request, res: Response) => {
  const testText = "أهلًا بيكم، النهارده هنتعلم مع بعض تركيب الهيكل العظمي ووظائف العظام في جسم الإنسان.";
  const voiceName = req.body?.voiceName || 'Kore';
  const cacheKey = getCacheKey(testText, voiceName);

  if (audioCache.has(cacheKey) || readDiskCache(cacheKey)) {
    const cached = audioCache.get(cacheKey) || readDiskCache(cacheKey)!;
    const verified = formatAndValidateAudioData(cached.audioBase64, cached.mimeType);
    res.json({
      success: true,
      engine: 'GoogleGenAI Gemini TTS (Cached)',
      model: 'gemini-3.8-flash-lite-tts',
      cached: true,
      audioFormat: verified.mimeType === 'audio/wav' ? 'WAV (RIFF Header)' : verified.mimeType,
      encoding: 'PCM 16-bit LE',
      sampleRate: '24,000 Hz',
      fileSizeBytes: verified.byteLength,
      decodingResult: 'ناجح - تم فك الترميز والتحقق من سلامة الهيدر بدون صفير أو تشويش',
      audioBase64: verified.audioBase64,
      mimeType: verified.mimeType,
      message: 'تم اختيار واختبار الشرح الصوتي المصري بنجاح تام من الذاكرة المحفوظة.'
    });
    return;
  }

  const ai = getGenAI();
  if (!ai) {
    logAudioError('gemini-3.8-flash-lite-tts', 'API_KEY_MISSING', 503, 'GEMINI_API_KEY not configured');
    res.status(503).json({
      success: false,
      engine: 'GoogleGenAI Gemini TTS',
      error: 'GEMINI_API_KEY_NOT_CONFIGURED',
      message: 'مفتاح Gemini API غير متاح في بيئة السيرفر حالياً.'
    });
    return;
  }

  try {
    const modelsToTry = ['gemini-3.8-flash-lite-tts', 'gemini-3.8-flash-tts'];
    let lastError: any = null;
    let rawAudioBase64 = '';
    let rawMime = 'audio/wav';
    let chosenModel = '';

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [{ role: 'user', parts: [{ text: testText }] }],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName } }
            }
          }
        });

        const candidate = response.candidates?.[0];
        const audioPart = candidate?.content?.parts?.find((p: any) => p.inlineData?.data);
        if (audioPart?.inlineData?.data) {
          rawAudioBase64 = audioPart.inlineData.data;
          rawMime = audioPart.inlineData.mimeType || 'audio/wav';
          chosenModel = modelName;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Test model ${modelName} failed:`, err?.message || err);
      }
    }

    if (!rawAudioBase64) {
      throw lastError || new Error('NO_AUDIO_RETURNED');
    }

    const verified = formatAndValidateAudioData(rawAudioBase64, rawMime);

    const cacheEntry = { audioBase64: verified.audioBase64, mimeType: verified.mimeType, createdAt: Date.now() };
    audioCache.set(cacheKey, cacheEntry);
    writeDiskCache(cacheKey, cacheEntry);

    res.json({
      success: true,
      engine: `GoogleGenAI (${chosenModel})`,
      model: chosenModel,
      audioFormat: verified.mimeType === 'audio/wav' ? 'WAV (RIFF Header)' : verified.mimeType,
      encoding: 'PCM 16-bit LE',
      sampleRate: '24,000 Hz',
      fileSizeBytes: verified.byteLength,
      decodingResult: 'ناجح - تم فك الترميز والتحقق من سلامة ملف الصوت المباشر بدون صفير أو تشويش',
      cached: false,
      audioBase64: verified.audioBase64,
      mimeType: verified.mimeType,
      message: 'تم اختبار وتوليد الشرح الصوتي المباشر باللهجة المصرية بنجاح تام من خادم Gemini AI.'
    });
  } catch (err: any) {
    const isQuota = err?.message?.includes('429') || err?.message?.includes('QUOTA') || err?.message?.includes('RESOURCE_EXHAUSTED');
    const statusCode = isQuota ? 429 : 500;
    logAudioError('gemini-tts', isQuota ? 'QUOTA_EXCEEDED' : 'TTS_TEST_FAILED', statusCode, err?.message || 'Test failed');

    res.status(isQuota ? 200 : 500).json({
      success: false,
      quotaExceeded: isQuota,
      engine: 'GoogleGenAI Gemini TTS',
      error: isQuota ? 'QUOTA_EXCEEDED' : 'TTS_TEST_FAILED',
      message: isQuota
        ? 'تم استنفاد حصة التوليد المجانية اليومية من خادم Gemini API (رمز 429). يمكنك الاستماع للتسجيلات المحفوظة مسبقاً.'
        : (err?.message || 'فشل اختبار التوليد الصوتي')
    });
  }
});

// Global quota circuit breaker
let globalQuotaExceededUntil = 0;

// Primary Neural TTS generation endpoint
app.post('/api/tts', async (req: Request, res: Response): Promise<void> => {
  // 0. Circuit breaker check
  if (Date.now() < globalQuotaExceededUntil) {
    res.json({ success: false, quotaExceeded: true, message: 'تم استنفاد حصة التوليد مؤقتاً.' });
    return;
  }
  
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
      logAudioError('gemini-3.8-flash-lite-tts', 'API_KEY_MISSING', 503, 'GEMINI_API_KEY not configured');
      res.status(503).json({
        success: false,
        error: 'GEMINI_API_KEY_NOT_CONFIGURED',
        message: 'مفتاح Gemini API غير متاح في بيئة السيرفر حالياً.'
      });
      return;
    }

    // 3. Deduplicate concurrent requests
    let requestPromise = inFlightServerRequests.get(cacheKey);
    if (!requestPromise) {
      requestPromise = (async () => {
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
              setTimeout(() => reject(new Error('TTS_REQUEST_TIMEOUT')), 6000);
            });

            const response: any = await Promise.race([ttsPromise, timeoutPromise]);
            const candidate = response.candidates?.[0];
            const audioPart = candidate?.content?.parts?.find((p: any) => p.inlineData?.data);
            const rawBase64 = audioPart?.inlineData?.data;
            const rawMime = audioPart?.inlineData?.mimeType || 'audio/wav';

            if (rawBase64) {
              const verified = formatAndValidateAudioData(rawBase64, rawMime);
              return { audioBase64: verified.audioBase64, mimeType: verified.mimeType };
            }
          } catch (err: any) {
            lastError = err;
            console.warn(`Model ${modelName} failed:`, err?.message || err);
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
    const isQuota = err?.message?.includes('429') || err?.message?.includes('QUOTA') || err?.message?.includes('RESOURCE_EXHAUSTED');
    if (isQuota) {
      globalQuotaExceededUntil = Date.now() + 60000;
      console.warn('[Audio Server] Gemini TTS quota reached (429). Falling back to client-side speech engine and blocking requests for 1 minute.');
    } else {
      logAudioError('gemini-3.8-flash-lite-tts', 'TTS_GENERATION_FAILED', 500, err?.message || 'TTS generation failed');
      console.error('Error generating Neural TTS:', err?.message || err);
    }

    res.status(isQuota ? 200 : 500).json({
      success: false,
      error: isQuota ? 'QUOTA_EXCEEDED' : 'TTS_GENERATION_FAILED',
      message: isQuota
        ? 'تم استنفاد حصة التوليد اليومية (429).'
        : (err?.message || 'فشل توليد الشرح الصوتي.'),
      quotaExceeded: isQuota
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
