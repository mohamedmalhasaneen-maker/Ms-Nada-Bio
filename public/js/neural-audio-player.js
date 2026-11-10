// =========================================================================
// مشغل الصوت العصري المتطور (Neural Biology Audio Player)
// محرك فائق السرعة، تخزين مؤقت ذكي، تشغيل متسلسل بدون تقطيع، وتحكم احترافي
// =========================================================================
(function () {
  'use strict';

  // 1. إدارة التخزين المؤقت للمقاطع الصوتية المتولدة لمنع تكرار الطلبات وتسرب الذاكرة
  const MAX_BLOB_CACHE = 250;
  const audioBlobCache = new Map(); // key -> blobUrl
  const inFlightFetches = new Map(); // key -> Promise<string>
  let serverFallbackActiveUntil = 0;
  let cachedBrowserVoices = [];

  function updateBrowserVoices() {
    if ('speechSynthesis' in window) {
      cachedBrowserVoices = window.speechSynthesis.getVoices() || [];
    }
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    updateBrowserVoices();
    window.speechSynthesis.onvoiceschanged = updateBrowserVoices;
  }

  function evictOldestBlobIfFull() {
    if (audioBlobCache.size >= MAX_BLOB_CACHE) {
      const oldestKey = audioBlobCache.keys().next().value;
      if (oldestKey) {
        const oldUrl = audioBlobCache.get(oldestKey);
        try {
          if (oldUrl && oldUrl.startsWith('blob:')) {
            URL.revokeObjectURL(oldUrl);
          }
        } catch (_) {}
        audioBlobCache.delete(oldestKey);
      }
    }
  }

  // مفتاح التخزين المؤقت المستقل عن السرعة (لأن السرعة يتم التحكم بها في المتصفح عبر playbackRate)
  function getCacheKey(text, voiceId) {
    return `${voiceId || 'Kore'}_${(text || '').trim()}`;
  }

  // استرجاع تفضيلات الطالب المحفوظة محلياً
  const savedSpeed = parseFloat(localStorage.getItem('bio_speed_pref') || '1.10');
  const validSpeed = !isNaN(savedSpeed) && savedSpeed >= 0.75 && savedSpeed <= 1.6 ? savedSpeed : 1.10;
  const savedVol = parseFloat(localStorage.getItem('bio_vol_pref') || '1.0');
  const validVol = !isNaN(savedVol) && savedVol >= 0 && savedVol <= 1 ? savedVol : 1.0;

  // إعدادات المشغل والحالة التشغيلية
  const state = {
    currentItem: null,
    currentMeta: { sectionName: '', systemName: '' },
    segments: [],
    currentSegmentIndex: 0,
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    speed: validSpeed, // سرعة افتراضية ممتازة 1.10x
    volume: validVol,
    isMuted: false,
    voiceId: localStorage.getItem('bio_voice_pref') || 'Kore',
    audioEngine: 'neural', // 'neural' | 'browser_fallback'
    audioElement: null,
    preloadedNextAudio: null,
    nextPreloadedIndex: -1,
    pauseTimeout: null,
    prewarmQueue: [],
    isAutoPlayEnabled: false,
    sessionId: 0 // لتتبع الجلسات وإلغاء الطلبات القديمة فوراً
  };

  // تهيئة عناصر الصوت مع التحميل المسبق المزدوج لمنع أي فراغ زمني
  function initAudioElements() {
    if (!state.audioElement) {
      state.audioElement = new Audio();
      state.audioElement.preload = 'auto';
      state.audioElement.addEventListener('ended', onSegmentEnded);
      state.audioElement.addEventListener('error', onAudioError);
      state.audioElement.addEventListener('play', () => updateVisualizer(true));
      state.audioElement.addEventListener('pause', () => {
        if (!state.isLoading) updateVisualizer(false);
      });
    }

    if (!state.preloadedNextAudio) {
      state.preloadedNextAudio = new Audio();
      state.preloadedNextAudio.preload = 'auto';
    }
  }

  // جلب المقطع الصوتي من السيرفر أو الكاش مع منع تكرار الطلبات المتزامنة
  async function fetchNeuralAudioWithRetry(text, voiceId, retries = 1) {
    const key = getCacheKey(text, voiceId);

    // 1. فحص الكاش الفوري
    if (audioBlobCache.has(key)) {
      return audioBlobCache.get(key);
    }

    // فحص ما إذا كان السيرفر في وضع التحويل التلقائي المؤقت (مثل انتهاء الحصة) لتفادي انتظار الطلبات
    if (Date.now() < serverFallbackActiveUntil) {
      throw new Error('SERVER_FALLBACK_ACTIVE');
    }

    // 2. إذا كان هناك طلب جارٍ لنفس النص، انتظر نفس الـ Promise ولا ترسل طلباً مكرراً
    if (inFlightFetches.has(key)) {
      return inFlightFetches.get(key);
    }

    const fetchPromise = (async () => {
      let lastErr = null;
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const res = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: text,
              voiceName: voiceId || 'Kore'
            }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            const err = new Error(errJson.message || `HTTP ${res.status}`);
            if (errJson.fallbackToBrowser || res.status === 429 || res.status === 503) {
              err.fallbackToBrowser = true;
              serverFallbackActiveUntil = Date.now() + 60000; // تفعيل البديل الفوري لمدة دقيقة لتوفير السرعة القصوى
              throw err;
            }
            throw err;
          }

          const data = await res.json();
          if (!data.audioBase64) {
            throw new Error('لم يتم استلام مقطع صوتي.');
          }

          // تحويل Base64 WAV إلى Blob URL سريع
          const byteChars = atob(data.audioBase64);
          const byteNumbers = new Array(byteChars.length);
          for (let i = 0; i < byteChars.length; i++) {
            byteNumbers[i] = byteChars.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: data.mimeType || 'audio/wav' });
          const blobUrl = URL.createObjectURL(blob);

          evictOldestBlobIfFull();
          audioBlobCache.set(key, blobUrl);
          return blobUrl;
        } catch (err) {
          lastErr = err;
          if (err.fallbackToBrowser) {
            break; // التحويل الفوري دون إضاعة وقت الطالب في إعادة محاولة
          }
          if (attempt < retries) {
            await new Promise((r) => setTimeout(r, 400));
          }
        }
      }
      throw lastErr || new Error('فشل جلب الصوت العصبي');
    })();

    inFlightFetches.set(key, fetchPromise);
    try {
      const url = await fetchPromise;
      return url;
    } finally {
      inFlightFetches.delete(key);
    }
  }

  // التجهيز الصامت والتحميل المسبق في الخلفية لأول مقطع أو مقطع محدد
  function prewarmSegment(index) {
    if (index < 0 || index >= state.segments.length) return;
    const seg = state.segments[index];
    if (!seg || !seg.spokenText) return;

    const key = getCacheKey(seg.spokenText, state.voiceId);
    if (!audioBlobCache.has(key) && !inFlightFetches.has(key)) {
      fetchNeuralAudioWithRetry(seg.spokenText, state.voiceId, 1).catch(() => {
        // التحميل المسبق في الخلفية صامت ولا يظهر أخطاء للمستخدم
      });
    }
  }

  // التحميل المسبق الذكي للجملة التالية مع التغذية المباشرة في عنصر الصوت الاحتياطي
  function prefetchNextSegment() {
    const nextIdx = state.currentSegmentIndex + 1;
    if (nextIdx < state.segments.length) {
      const nextSeg = state.segments[nextIdx];
      fetchNeuralAudioWithRetry(nextSeg.spokenText, state.voiceId, 1)
        .then((blobUrl) => {
          if (state.preloadedNextAudio && nextIdx === state.currentSegmentIndex + 1) {
            state.preloadedNextAudio.src = blobUrl;
            state.nextPreloadedIndex = nextIdx;
          }
        })
        .catch(() => {});
    }
  }

  // تشغيل الجملة الحالية مع انتقال متصل وسريع
  async function playCurrentSegment() {
    clearTimeout(state.pauseTimeout);

    if (state.currentSegmentIndex < 0 || state.currentSegmentIndex >= state.segments.length) {
      finishPlayback();
      return;
    }

    const currentSession = ++state.sessionId;
    const segment = state.segments[state.currentSegmentIndex];

    state.isPlaying = true;
    state.isPaused = false;

    // فحص ما إذا كان المقطع التالي مجهزاً بالفعل مسبقاً في الذاكرة
    const key = getCacheKey(segment.spokenText, state.voiceId);
    const isAlreadyCached = audioBlobCache.has(key);

    if (!isAlreadyCached) {
      state.isLoading = true;
      updateUI();
    }

    try {
      const audioUrl = await fetchNeuralAudioWithRetry(segment.spokenText, state.voiceId, 1);

      // التأكد من أن جلسة التشغيل لم تتغير أثناء انتظار الشبكة (مثلاً ضغط المستخدم Stop أو التالي)
      if (state.sessionId !== currentSession || !state.isPlaying) {
        return;
      }

      state.audioEngine = 'neural';
      state.isLoading = false;

      initAudioElements();
      const audio = state.audioElement;

      // إذا كان المقطع قد تم تحميله مسبقاً في عنصر الصوت، نستخدمه فوراً
      if (audio.src !== audioUrl) {
        audio.src = audioUrl;
      }

      audio.playbackRate = state.speed;
      audio.volume = state.isMuted ? 0 : state.volume;

      await audio.play();

      if (state.sessionId !== currentSession) return;
      updateUI();

      // تحضير الجملة التالية فور بدء تشغيل الجملة الحالية
      prefetchNextSegment();
    } catch (err) {
      if (state.sessionId !== currentSession || !state.isPlaying) return;

      console.warn('Neural TTS quota or error:', err?.message || err);
      state.isLoading = false;
      state.isPlaying = false;
      updateUI();
      const isQuota = err?.message?.includes('429') || err?.message?.includes('الحصة') || err?.message?.includes('SERVER_FALLBACK_ACTIVE');
      const toastMsg = isQuota
        ? 'تم استنفاد حصة التوليد المجانية اليومية. يمكنك تصفح البطاقات وقراءة المعلومات العلمية مباشرة.'
        : 'تعذر توليد الشرح الصوتي. يرجى المحاولة لاحقاً.';
      showAudioToast(toastMsg, 'error');
    }
  }

  // بديل المتصفح الموثوق عند انقطاع الإنترنت أو عدم توفر المفتاح
  function playBrowserFallback(text) {
    if (!('speechSynthesis' in window)) {
      state.isLoading = false;
      state.isPlaying = false;
      updateUI();
      showAudioToast('محرك الصوت غير مدعوم في هذا المتصفح', 'error');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-EG';
    utterance.rate = Math.max(0.85, Math.min(1.4, state.speed * 1.02));
    utterance.pitch = 1.05;
    utterance.volume = state.isMuted ? 0 : state.volume;

    const voices =
      cachedBrowserVoices && cachedBrowserVoices.length > 0
        ? cachedBrowserVoices
        : window.speechSynthesis.getVoices() || [];

    const egFemaleVoice = voices.find(
      (v) =>
        v.lang &&
        (v.lang === 'ar-EG' || v.lang.startsWith('ar_EG') || v.lang === 'ar') &&
        (v.name.toLowerCase().includes('female') ||
          v.name.includes('سلمى') ||
          v.name.includes('مريم') ||
          v.name.includes('هدى') ||
          v.name.toLowerCase().includes('salma') ||
          v.name.toLowerCase().includes('natural'))
    );
    const anyArabic = voices.find((v) => v.lang && (v.lang.startsWith('ar') || v.lang.includes('AR')));
    const chosen = egFemaleVoice || anyArabic;
    if (chosen) {
      utterance.voice = chosen;
      utterance.lang = chosen.lang || 'ar-EG';
    }

    utterance.onstart = () => {
      state.isLoading = false;
      state.isPlaying = true;
      state.isPaused = false;
      updateVisualizer(true);
      updateUI();
    };

    utterance.onend = () => {
      updateVisualizer(false);
      onSegmentEnded();
    };

    utterance.onerror = (e) => {
      updateVisualizer(false);
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('Speech synthesis error:', e);
      }
      finishPlayback();
    };

    window.speechSynthesis.speak(utterance);
  }

  // انتهاء الجملة -> انتقال فوري للجملة التالية مع وقفة بشرية طبيعية مريحة (190ms)
  function onSegmentEnded() {
    if (!state.isPlaying || state.isPaused) return;

    if (state.currentSegmentIndex + 1 < state.segments.length) {
      state.currentSegmentIndex++;
      updateUI();

      // وقفة نفسية طبيعية خفيفة بين الجمل (190 مللي ثانية) بدون أي تأخير شبكة
      state.pauseTimeout = setTimeout(() => {
        playCurrentSegment();
      }, 190);
    } else {
      finishPlayback();
    }
  }

  function onAudioError(e) {
    console.warn('Audio playback error, falling back:', e);
    if (state.isPlaying && state.segments[state.currentSegmentIndex]) {
      state.audioEngine = 'browser_fallback';
      playBrowserFallback(state.segments[state.currentSegmentIndex].spokenText);
    }
  }

  function finishPlayback() {
    state.isPlaying = false;
    state.isPaused = false;
    state.isLoading = false;
    state.currentSegmentIndex = 0;
    clearTimeout(state.pauseTimeout);

    if (state.audioElement) {
      state.audioElement.pause();
      state.audioElement.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    updateUI();
  }

  // =========================================================================
  // دوال التحكم العامة (Play / Pause / Stop / Next / Prev / Speed / Volume)
  // =========================================================================

  function loadItem(item, sectionName, systemName, autoStart = false) {
    stop();
    state.currentItem = item;
    state.currentMeta = { sectionName: sectionName || '', systemName: systemName || '' };
    state.segments = window.BioAudioDictionary
      ? window.BioAudioDictionary.parseAnatomicalSentences(item, sectionName, systemName)
      : [];
    state.currentSegmentIndex = 0;

    renderTranscriptInCard();
    updateUI();

    // التحضير المسبق الصامت لأول جملة في الخلفية بحيث يبدأ الصوت فوراً عند الضغط (0ms تأخير)
    if (state.segments.length > 0 && !autoStart && !state.isAutoPlayEnabled) {
      prewarmSegment(0);
    }

    if (autoStart || state.isAutoPlayEnabled) {
      play();
    }
  }

  function play() {
    if (!state.segments.length && state.currentItem) {
      state.segments = window.BioAudioDictionary.parseAnatomicalSentences(
        state.currentItem,
        state.currentMeta.sectionName,
        state.currentMeta.systemName
      );
    }
    if (!state.segments.length) return;

    initAudioElements();

    // استكمال القراءة من موضع الـ Pause بالضبط
    if (state.isPaused) {
      state.isPaused = false;
      state.isPlaying = true;
      if (state.audioEngine === 'neural' && state.audioElement && state.audioElement.src) {
        state.audioElement.play().catch(() => {
          playCurrentSegment();
        });
        updateUI();
        return;
      }
      if (state.audioEngine === 'browser_fallback' && 'speechSynthesis' in window) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
          updateUI();
          return;
        }
      }
    }

    playCurrentSegment();
  }

  // الإيقاف المؤقت (Pause): يحتفظ بموضع القراءة والجملة الحالية
  function pause() {
    clearTimeout(state.pauseTimeout);
    state.sessionId++; // إيقاف أي طلب شبكة معلق

    if (state.audioElement && state.audioEngine === 'neural') {
      state.audioElement.pause();
    }
    if ('speechSynthesis' in window && state.audioEngine === 'browser_fallback') {
      window.speechSynthesis.pause();
    }

    state.isPaused = true;
    state.isPlaying = false;
    state.isLoading = false;
    updateUI();
  }

  function togglePlay() {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }

  // الإيقاف النهائي (Stop): ينهي الجلسة بالكامل ويلغي القائمة ويعود للبداية
  function stop() {
    clearTimeout(state.pauseTimeout);
    state.sessionId++; // إلغاء أي مهام سابقة

    if (state.audioElement) {
      state.audioElement.pause();
      state.audioElement.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    state.isPlaying = false;
    state.isPaused = false;
    state.isLoading = false;
    state.currentSegmentIndex = 0;
    updateUI();
  }

  function replayCurrentSegment() {
    if (!state.segments.length) return;
    if (state.audioElement) {
      state.audioElement.pause();
      state.audioElement.currentTime = 0;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    playCurrentSegment();
  }

  function nextSegment() {
    if (state.currentSegmentIndex + 1 < state.segments.length) {
      state.currentSegmentIndex++;
      if (state.isPlaying) {
        playCurrentSegment();
      } else {
        updateUI();
      }
    }
  }

  function prevSegment() {
    if (state.currentSegmentIndex > 0) {
      state.currentSegmentIndex--;
      if (state.isPlaying) {
        playCurrentSegment();
      } else {
        updateUI();
      }
    }
  }

  function jumpToSegment(index) {
    if (index >= 0 && index < state.segments.length) {
      state.currentSegmentIndex = index;
      playCurrentSegment();
    }
  }

  // تغيير سرعة القراءة فورياً أثناء التشغيل دون إعادة توليد الصوت
  function setSpeed(rate) {
    const val = parseFloat(rate);
    if (!isNaN(val) && val >= 0.75 && val <= 1.6) {
      state.speed = val;
      localStorage.setItem('bio_speed_pref', val.toString());

      if (state.audioElement) {
        state.audioElement.playbackRate = val;
      }
      if (state.preloadedNextAudio) {
        state.preloadedNextAudio.playbackRate = val;
      }

      updateSpeedButtonsUI();
      showAudioToast(`سرعة القراءة: ${val.toFixed(2).replace(/\.00$/, '')}x`, 'info');
    }
  }

  function setVolume(vol) {
    const v = Math.max(0, Math.min(1, parseFloat(vol)));
    state.volume = v;
    state.isMuted = v === 0;
    localStorage.setItem('bio_vol_pref', v.toString());

    if (state.audioElement) {
      state.audioElement.volume = state.isMuted ? 0 : v;
    }
    updateVolumeUI();
  }

  function toggleMute() {
    state.isMuted = !state.isMuted;
    if (state.audioElement) {
      state.audioElement.volume = state.isMuted ? 0 : state.volume;
    }
    updateVolumeUI();
  }

  function setVoice(voiceId) {
    state.voiceId = voiceId;
    localStorage.setItem('bio_voice_pref', voiceId);
    updateVoiceUI();
    const voiceLabel =
      voiceId === 'Kore' ? 'مس/ ندى بدوي (شرح مصري طبيعي)' : 'دكتورة أحياء (نبرة هادئة ورسمية)';
    showAudioToast(`تم اختيار: ${voiceLabel}`, 'info');

    // إعادة تحميل أول مقطع بالصوت الجديد
    if (state.isPlaying) {
      replayCurrentSegment();
    } else {
      prewarmSegment(state.currentSegmentIndex);
    }
  }

  function toggleAutoSpeech() {
    state.isAutoPlayEnabled = !state.isAutoPlayEnabled;
    const btn = document.getElementById('btn-auto-speech');
    if (btn) {
      btn.classList.toggle('text-sky-300', state.isAutoPlayEnabled);
      btn.classList.toggle('border-sky-500/40', state.isAutoPlayEnabled);
      btn.classList.toggle('text-slate-500', !state.isAutoPlayEnabled);
      btn.innerText = state.isAutoPlayEnabled ? 'قراءة تلقائية: مفعلة' : 'قراءة تلقائية: متوقفة';
    }
    showAudioToast(
      state.isAutoPlayEnabled
        ? 'تم تفعيل القراءة التلقائية عند اختيار أي عنصر'
        : 'تم إيقاف القراءة التلقائية',
      'info'
    );
  }

  // تمييز النص التفاعلي (Karaoke Transcript)
  function renderTranscriptInCard() {
    const funcEl = document.getElementById('card-function');
    const examEl = document.getElementById('card-exam-note');

    if (funcEl && state.currentItem) {
      funcEl.innerHTML = '';
      const funcSegments = state.segments.filter((s) => s.type === 'function');
      if (funcSegments.length > 0) {
        funcSegments.forEach((seg) => {
          const span = document.createElement('span');
          span.id = `transcript-${seg.id}`;
          span.className =
            'transcript-sentence cursor-pointer hover:bg-sky-500/15 rounded px-1 transition-all inline';
          span.innerText = seg.rawText + ' ';
          span.onclick = () => {
            const idx = state.segments.findIndex((s) => s.id === seg.id);
            if (idx !== -1) jumpToSegment(idx);
          };
          funcEl.appendChild(span);
        });
      } else {
        funcEl.innerText = state.currentItem.functionDesc || 'الوظيفة الحيوية والتكامل التشريحي وفق منهج الأحياء.';
      }
    }

    if (examEl && state.currentItem) {
      examEl.innerHTML = '';
      const examSegments = state.segments.filter((s) => s.type === 'exam');
      if (examSegments.length > 0) {
        examSegments.forEach((seg) => {
          const span = document.createElement('span');
          span.id = `transcript-${seg.id}`;
          span.className =
            'transcript-sentence cursor-pointer hover:bg-cyan-500/20 rounded px-1 transition-all inline';
          span.innerText = seg.rawText + ' ';
          span.onclick = () => {
            const idx = state.segments.findIndex((s) => s.id === seg.id);
            if (idx !== -1) jumpToSegment(idx);
          };
          examEl.appendChild(span);
        });
      } else {
        examEl.innerText =
          state.currentItem.examNote || 'راجع تفاصيل الاتصال والتمفصل وتنسيق السيالات العصبية في المنهج.';
      }
    }
  }

  function highlightActiveTranscriptSentence() {
    document.querySelectorAll('.transcript-sentence').forEach((el) => {
      el.classList.remove('active-sentence', 'bg-sky-400/25', 'text-sky-100', 'ring-1', 'ring-sky-400/50');
    });

    if (state.isPlaying || state.isPaused) {
      const curSeg = state.segments[state.currentSegmentIndex];
      if (curSeg) {
        const activeEl = document.getElementById(`transcript-${curSeg.id}`);
        if (activeEl) {
          activeEl.classList.add('active-sentence', 'bg-sky-400/25', 'text-sky-100', 'ring-1', 'ring-sky-400/50');
          activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }
  }

  // تحديث واجهة المستخدم وأزرار المشغل
  function updateUI() {
    const playBtn = document.getElementById('btn-speak-card');
    const playIcon = document.getElementById('icon-speaker-idle');
    const pauseIcon = document.getElementById('icon-speaker-playing');
    const statusText = document.getElementById('speech-status-text');
    const progressText = document.getElementById('audio-progress-counter');
    const segmentLabel = document.getElementById('audio-current-label');
    const engineBadge = document.getElementById('audio-engine-badge');
    const prevBtn = document.getElementById('btn-audio-prev');
    const nextBtn = document.getElementById('btn-audio-next');

    const isRunning = state.isPlaying;

    if (playIcon) playIcon.classList.toggle('hidden', isRunning);
    if (pauseIcon) pauseIcon.classList.toggle('hidden', !isRunning);

    if (statusText) {
      if (state.isLoading) {
        statusText.innerText = 'تجهيز الصوت...';
      } else if (state.isPlaying) {
        statusText.innerText = 'إيقاف مؤقت';
      } else if (state.isPaused) {
        statusText.innerText = 'استكمال الشرح';
      } else {
        statusText.innerText = 'استماع للشرح الطبيعي';
      }
    }

    if (playBtn) {
      playBtn.classList.toggle('is-speaking', isRunning);
      playBtn.classList.toggle('is-loading', state.isLoading);
    }

    if (progressText && state.segments.length > 0) {
      progressText.innerText = `${state.currentSegmentIndex + 1} / ${state.segments.length}`;
    }

    if (segmentLabel) {
      const cur = state.segments[state.currentSegmentIndex];
      segmentLabel.innerText = cur ? cur.label : 'الشرح الصوتي';
    }

    if (engineBadge) {
      if (state.audioEngine === 'neural') {
        engineBadge.innerText = 'Neural TTS • صوت مصري طبيعي';
        engineBadge.className =
          'text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-400/30';
      } else {
        engineBadge.innerText = 'صوت المتصفح البديل';
        engineBadge.className =
          'text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-400/30';
      }
    }

    if (prevBtn) prevBtn.disabled = state.currentSegmentIndex <= 0;
    if (nextBtn) nextBtn.disabled = state.currentSegmentIndex >= state.segments.length - 1;

    highlightActiveTranscriptSentence();
    updateVisualizer(isRunning);
    updateSpeedButtonsUI();
  }

  function updateVisualizer(active) {
    const waves = document.querySelectorAll('.audio-wave-bar');
    waves.forEach((w) => {
      w.classList.toggle('wave-anim', active);
    });
  }

  function updateSpeedButtonsUI() {
    document.querySelectorAll('[data-audio-speed]').forEach((b) => {
      const spd = parseFloat(b.getAttribute('data-audio-speed'));
      const matches = Math.abs(spd - state.speed) < 0.04;
      b.classList.toggle('is-active', matches);
    });
  }

  function updateVolumeUI() {
    const volIconMuted = document.getElementById('icon-vol-muted');
    const volIconHigh = document.getElementById('icon-vol-high');
    const volSlider = document.getElementById('audio-volume-slider');

    if (volIconMuted && volIconHigh) {
      volIconMuted.classList.toggle('hidden', !state.isMuted);
      volIconHigh.classList.toggle('hidden', state.isMuted);
    }
    if (volSlider) {
      volSlider.value = state.isMuted ? '0' : String(state.volume);
    }
  }

  function updateVoiceUI() {
    const voiceSelector = document.getElementById('audio-voice-select');
    if (voiceSelector) {
      voiceSelector.value = state.voiceId;
    }
  }

  let toastTimer = null;
  function showAudioToast(msg, type = 'info') {
    const toast = document.getElementById('audio-toast');
    if (!toast) return;

    toast.innerText = msg;
    toast.className = `fixed bottom-16 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-xl med-glass-strong text-xs font-bold transition-all shadow-xl pointer-events-none ${
      type === 'error'
        ? 'text-rose-200 border-rose-500/40'
        : 'text-sky-200 border-sky-400/40'
    }`;
    toast.classList.remove('hidden');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2200);
  }

  // إتاحة الكائن للنطاق العام
  window.BioNeuralPlayer = {
    loadItem: loadItem,
    play: play,
    pause: pause,
    togglePlay: togglePlay,
    stop: stop,
    replayCurrentSegment: replayCurrentSegment,
    nextSegment: nextSegment,
    prevSegment: prevSegment,
    jumpToSegment: jumpToSegment,
    setSpeed: setSpeed,
    setVolume: setVolume,
    toggleMute: toggleMute,
    setVoice: setVoice,
    toggleAutoSpeech: toggleAutoSpeech,
    prewarmSegment: prewarmSegment,
    getState: function () {
      return Object.assign({}, state);
    }
  };

  // تهيئة الواجهة عند اكتمال تحميل الصفحة
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      updateSpeedButtonsUI();
      updateVolumeUI();
      updateVoiceUI();
    });
  } else {
    updateSpeedButtonsUI();
    updateVolumeUI();
    updateVoiceUI();
  }
})();
