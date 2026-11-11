// =========================================================================
// مشغل الشرح الصوتي البشري العصري (Human & Neural Audio Player)
// أولوية للتسجيلات البشرية الحقيقية (مس / ندى بدوي)، تشغيل سلس، وبدون تقطيع
// =========================================================================
(function () {
  'use strict';

  // إدارة التخزين المؤقت للمقاطع الصوتية
  const MAX_BLOB_CACHE = 300;
  const audioBlobCache = new Map();
  const inFlightFetches = new Map();

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

  function getCacheKey(text, voiceId) {
    return `${voiceId || 'Kore'}_${(text || '').trim()}`;
  }

  // استرجاع التفضيلات
  const savedSpeed = parseFloat(localStorage.getItem('bio_speed_pref') || '1.0');
  const validSpeed = !isNaN(savedSpeed) && savedSpeed >= 0.7 && savedSpeed <= 2.1 ? savedSpeed : 1.0;
  const savedVol = parseFloat(localStorage.getItem('bio_vol_pref') || '1.0');
  const validVol = !isNaN(savedVol) && savedVol >= 0 && savedVol <= 1 ? savedVol : 1.0;

  // إعدادات المشغل والحالة
  const state = {
    currentItem: null,
    currentMeta: { sectionName: '', systemName: '' },
    segments: [],
    currentSegmentIndex: 0,
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    speed: validSpeed,
    volume: validVol,
    isMuted: false,
    voiceId: localStorage.getItem('bio_voice_pref') || 'Kore',
    audioEngine: 'human', // 'human' | 'neural'
    speakerName: 'مس / ندى بدوي (شرح مصري)',
    audioElement: null,
    pauseTimeout: null,
    isAutoPlayEnabled: false,
    sessionId: 0
  };

  // تهيئة عنصر الصوت الرئيسي
  function initAudioElement() {
    if (!state.audioElement) {
      state.audioElement = new Audio();
      state.audioElement.preload = 'auto';
      state.audioElement.addEventListener('ended', onSegmentEnded);
      state.audioElement.addEventListener('error', onAudioError);
      state.audioElement.addEventListener('play', () => updateVisualizer(true));
      state.audioElement.addEventListener('pause', () => {
        if (!state.isLoading) updateVisualizer(false);
      });
      state.audioElement.addEventListener('timeupdate', onTimeUpdate);
    }
  }

  function onTimeUpdate() {
    const audio = state.audioElement;
    if (!audio || !audio.duration) return;
    const progressFill = document.getElementById('audio-progress-fill');
    const timeCurrent = document.getElementById('audio-time-current');
    const timeTotal = document.getElementById('audio-time-total');

    if (progressFill) {
      const pct = (audio.currentTime / audio.duration) * 100;
      progressFill.style.width = `${pct}%`;
    }
    if (timeCurrent) {
      timeCurrent.innerText = formatTime(audio.currentTime);
    }
    if (timeTotal) {
      timeTotal.innerText = formatTime(audio.duration);
    }
  }

  function seekToPercent(pct) {
    const audio = state.audioElement;
    if (!audio || !audio.duration) return;
    const clampedPct = Math.max(0, Math.min(100, pct));
    audio.currentTime = (clampedPct / 100) * audio.duration;
  }

  function formatTime(sec) {
    if (isNaN(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  // جلب الصوت التوليدي في حالة عدم وجود تسجيل بشري لهذا العضو
  async function fetchNeuralAudioWithRetry(text, voiceId, retries = 2) {
    const key = getCacheKey(text, voiceId);
    if (audioBlobCache.has(key)) return audioBlobCache.get(key);
    if (inFlightFetches.has(key)) return inFlightFetches.get(key);

    const fetchPromise = (async () => {
      let lastErr = null;
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000);

          const res = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, voiceName: voiceId || 'Kore' }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          const data = await res.json().catch(() => ({}));
          if (data.quotaExceeded || !data.audioBase64 || !res.ok) {
            const customErr = new Error(data.message || 'QUOTA_EXCEEDED');
            customErr.quotaExceeded = Boolean(data.quotaExceeded);
            throw customErr;
          }

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
          if (err.statusCode === 429 || err.statusCode === 404) break;
          if (attempt < retries) await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
        }
      }
      throw lastErr || new Error('فشل جلب الشرح الصوتي');
    })();

    inFlightFetches.set(key, fetchPromise);
    try {
      return await fetchPromise;
    } finally {
      inFlightFetches.delete(key);
    }
  }

  // إلغاء جميع مشغلات الصوت والنطق المباشر لمنع التداخل
  function cancelAllActiveAudio() {
    clearTimeout(state.pauseTimeout);
    state.sessionId++;
    if (state.audioElement) {
      try {
        state.audioElement.pause();
        state.audioElement.currentTime = 0;
      } catch (_) {}
    }
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
  }

  // تشغيل النطق التلقائي التفاعلي المدمج عبر SpeechSynthesis عند تعذر استجابة السيرفر
  function playSpeechSynthesisFallback(segment, currentSession) {
    if (!('speechSynthesis' in window)) {
      state.isPlaying = false;
      state.isLoading = false;
      updateUI();
      return;
    }

    try {
      window.speechSynthesis.cancel();
    } catch (_) {}

    state.audioEngine = 'speech';
    state.speakerName = 'شرح صوتي مدمج (معلمة الأحياء)';
    state.isLoading = false;
    state.isPlaying = true;
    updateUI();

    const utterance = new SpeechSynthesisUtterance(segment.spokenText);
    utterance.lang = 'ar-EG';
    utterance.rate = Math.max(0.75, Math.min(1.8, state.speed));
    utterance.volume = state.isMuted ? 0 : state.volume;
    utterance.pitch = 1.08;

    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      // تفضيل الصوت المصري (ar-EG) والأنثوي
      const egVoice = voices.find((v) => (v.lang === 'ar-EG' || v.lang === 'ar_EG') && (v.name.toLowerCase().includes('female') || v.name.includes('سلمى') || v.name.includes('هدى') || v.name.includes('ليلى')));
      const anyEgVoice = voices.find((v) => v.lang === 'ar-EG' || v.lang === 'ar_EG');
      const anyArVoice = voices.find((v) => (v.lang && v.lang.toLowerCase().startsWith('ar')) || (v.name && v.name.toLowerCase().includes('arabic')));
      
      const chosenVoice = egVoice || anyEgVoice || anyArVoice;
      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }
    }

    utterance.onend = function () {
      if (state.sessionId !== currentSession || !state.isPlaying) return;
      onSegmentEnded();
    };

    utterance.onerror = function (e) {
      console.warn('SpeechSynthesis error:', e);
      if (state.sessionId !== currentSession || !state.isPlaying) return;
      onSegmentEnded();
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis speak error:', e);
      onSegmentEnded();
    }
  }

  // تشغيل الجملة/القسم الحالي بسلاسة وبشكل تلقائي لجميع الأعضاء بدون طلب تسجيل يدوية
  async function playCurrentSegment() {
    clearTimeout(state.pauseTimeout);

    if (state.currentSegmentIndex < 0 || state.currentSegmentIndex >= state.segments.length) {
      finishPlayback();
      return;
    }

    const currentSession = ++state.sessionId;
    const segment = state.segments[state.currentSegmentIndex];
    const itemId = state.currentItem ? state.currentItem.id : '';
    const sectionKey = segment.type || 'overview';

    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (_) {}
    }

    state.isPlaying = true;
    state.isPaused = false;

    // 1. الفحص الأول: هل يوجد تسجيل بشري مسجل لهذا القسم؟
    let humanRec = null;
    if (window.BioHumanAudioEngine) {
      humanRec = window.BioHumanAudioEngine.getHumanRecording(itemId, sectionKey);
    }

    initAudioElement();
    const audio = state.audioElement;

    if (humanRec) {
      state.audioEngine = 'human';
      state.speakerName = humanRec.speakerName || 'مس / ندى بدوي (شرح بشري حقيقي)';
      state.isLoading = false;

      const audioUrl = humanRec.audioUrl || `/api/human-audio/recording/${itemId}/${sectionKey}`;
      if (audio.src !== audioUrl) {
        audio.src = audioUrl;
      }

      audio.playbackRate = state.speed;
      audio.volume = state.isMuted ? 0 : state.volume;

      try {
        await audio.play();
        if (state.sessionId !== currentSession) return;
        updateUI();
        return;
      } catch (err) {
        console.warn('Human audio play failed, falling back to auto TTS...', err);
      }
    }

    // 2. الفحص الثاني: جلب الصوت التوليدي المصري من السيرفر أو الذاكرة
    state.audioEngine = 'neural';
    state.speakerName = 'مس / ندى بدوي (توليد مصري طبيعي)';
    state.isLoading = true;
    updateUI();

    try {
      const audioUrl = await fetchNeuralAudioWithRetry(segment.spokenText, state.voiceId, 1);
      if (state.sessionId !== currentSession || !state.isPlaying) return;

      state.isLoading = false;
      if (audio.src !== audioUrl) audio.src = audioUrl;

      audio.playbackRate = state.speed;
      audio.volume = state.isMuted ? 0 : state.volume;

      await audio.play();
      if (state.sessionId !== currentSession) return;
      updateUI();
    } catch (err) {
      if (state.sessionId !== currentSession || !state.isPlaying) return;

      // 3. التبديل التلقائي الصامت لمحرك النطق المدمج فوراً بدون أي رسائل طلب تسجيل
      playSpeechSynthesisFallback(segment, currentSession);
    }
  }

  function onSegmentEnded() {
    if (!state.isPlaying || state.isPaused) return;

    if (state.currentSegmentIndex + 1 < state.segments.length) {
      state.currentSegmentIndex++;
      updateUI();

      state.pauseTimeout = setTimeout(() => {
        playCurrentSegment();
      }, 120);
    } else {
      finishPlayback();
    }
  }

  function onAudioError(e) {
    console.warn('Audio element error:', e);
    if (state.isPlaying) {
      onSegmentEnded();
    }
  }

  function finishPlayback() {
    cancelAllActiveAudio();
    state.isPlaying = false;
    state.isPaused = false;
    state.isLoading = false;
    state.currentSegmentIndex = 0;
    updateUI();
  }

  // التحكم العام
  function loadItem(item, sectionName, systemName, autoStart = false) {
    if (!item) return;

    if (state.currentItem && state.currentItem.id === item.id && (state.isPlaying || state.isLoading)) {
      return;
    }

    stop();
    state.currentItem = item;
    state.currentMeta = { sectionName: sectionName || '', systemName: systemName || '' };
    state.segments = window.BioAudioDictionary
      ? window.BioAudioDictionary.parseAnatomicalSentences(item)
      : [];
    state.currentSegmentIndex = 0;

    renderTranscriptInCard();
    updateUI();

    if (autoStart || state.isAutoPlayEnabled) {
      play();
    }
  }

  function play() {
    if (!state.segments.length && state.currentItem) {
      state.segments = window.BioAudioDictionary.parseAnatomicalSentences(state.currentItem);
    }
    if (!state.segments.length) return;

    initAudioElement();

    if (state.isPaused) {
      state.isPaused = false;
      state.isPlaying = true;
      if (state.audioEngine === 'speech') {
        const cur = state.segments[state.currentSegmentIndex];
        if (cur) playSpeechSynthesisFallback(cur, state.sessionId);
        return;
      }
      if (state.audioElement && state.audioElement.src) {
        state.audioElement.play().catch(() => playCurrentSegment());
        updateUI();
        return;
      }
    }

    playCurrentSegment();
  }

  function pause() {
    cancelAllActiveAudio();
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

  function stop() {
    cancelAllActiveAudio();
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

  function setSpeed(rate) {
    const val = parseFloat(rate);
    if (!isNaN(val) && val >= 0.74 && val <= 2.05) {
      state.speed = val;
      localStorage.setItem('bio_speed_pref', val.toString());

      // تطبيق السرعة فوراً على المقطع الصوتي الحالي دون توقف أو تشويش
      if (state.audioElement) {
        state.audioElement.playbackRate = val;
      }

      updateSpeedUI();
      closeSpeedMenu();
      showAudioToast(`تم ضبط سرعة الشرح: ${formatSpeedLabel(val)}`, 'info');
    }
  }

  function formatSpeedLabel(val) {
    const num = parseFloat(val);
    if (Math.abs(num - 1) < 0.01) return '1x';
    return `${num}x`;
  }

  function toggleSpeedMenu(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    const menu = document.getElementById('audio-speed-menu');
    if (!menu) return;
    const isHidden = menu.classList.contains('hidden');
    if (isHidden) {
      openSpeedMenu();
    } else {
      closeSpeedMenu();
    }
  }

  function openSpeedMenu() {
    const menu = document.getElementById('audio-speed-menu');
    const btn = document.getElementById('btn-audio-speed');
    if (!menu) return;
    menu.classList.remove('hidden');
    if (btn) btn.setAttribute('aria-expanded', 'true');
    updateSpeedUI();
  }

  function closeSpeedMenu() {
    const menu = document.getElementById('audio-speed-menu');
    const btn = document.getElementById('btn-audio-speed');
    if (menu) menu.classList.add('hidden');
    if (btn) btn.setAttribute('aria-expanded', 'false');
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
      state.isAutoPlayEnabled ? 'تم تفعيل القراءة التلقائية عند اختيار أي عضو' : 'تم إيقاف القراءة التلقائية',
      'info'
    );
  }

  function renderTranscriptInCard() {
    const funcEl = document.getElementById('card-function');
    const landEl = document.getElementById('card-landmarks-text');
    const examEl = document.getElementById('card-exam-note');

    if (funcEl && state.currentItem) {
      funcEl.innerHTML = '';
      const overviewSegs = state.segments.filter((s) => s.type === 'overview' || s.type === 'name');
      if (overviewSegs.length > 0) {
        overviewSegs.forEach((seg) => {
          const span = document.createElement('span');
          span.id = `transcript-${seg.id}`;
          span.className = 'transcript-sentence cursor-pointer hover:bg-sky-500/15 rounded px-1 transition-all inline';
          span.innerText = seg.rawText + ' ';
          span.onclick = () => {
            const idx = state.segments.findIndex((s) => s.id === seg.id);
            if (idx !== -1) jumpToSegment(idx);
          };
          funcEl.appendChild(span);
        });
      } else {
        funcEl.innerText = state.currentItem.functionDesc || state.currentItem.role || 'الوظيفة الحيوية والتكامل التشريحي.';
      }
    }

    if (landEl && state.currentItem) {
      landEl.innerHTML = '';
      const landSegs = state.segments.filter((s) => s.type === 'landmarks');
      if (landSegs.length > 0) {
        landSegs.forEach((seg) => {
          const span = document.createElement('span');
          span.id = `transcript-${seg.id}`;
          span.className = 'transcript-sentence cursor-pointer hover:bg-sky-500/15 rounded px-1 transition-all inline';
          span.innerText = seg.rawText + ' ';
          span.onclick = () => {
            const idx = state.segments.findIndex((s) => s.id === seg.id);
            if (idx !== -1) jumpToSegment(idx);
          };
          landEl.appendChild(span);
        });
      } else {
        landEl.innerText = state.currentItem.landmarks || state.currentItem.structure || 'المعالم والتراكيب التشريحية الحيوية.';
      }
    }

    if (examEl && state.currentItem) {
      examEl.innerHTML = '';
      const examSegs = state.segments.filter((s) => s.type === 'exam');
      if (examSegs.length > 0) {
        examSegs.forEach((seg) => {
          const span = document.createElement('span');
          span.id = `transcript-${seg.id}`;
          span.className = 'transcript-sentence cursor-pointer hover:bg-cyan-500/20 rounded px-1 transition-all inline';
          span.innerText = seg.rawText + ' ';
          span.onclick = () => {
            const idx = state.segments.findIndex((s) => s.id === seg.id);
            if (idx !== -1) jumpToSegment(idx);
          };
          examEl.appendChild(span);
        });
      } else {
        examEl.innerText = state.currentItem.examNote || 'راجع تفاصيل المنهج.';
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

          if (window.setCardTab) {
            if (curSeg.type === 'overview' || curSeg.type === 'name') window.setCardTab('overview');
            else if (curSeg.type === 'landmarks') window.setCardTab('landmarks');
            else if (curSeg.type === 'exam') window.setCardTab('exam');
          }
        }
      }
    }
  }

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
      if (state.audioEngine === 'human') {
        engineBadge.innerText = '🎙️ شرح ندى بدوي (مصري)';
        engineBadge.className = 'text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40';
      } else if (state.audioEngine === 'neural') {
        engineBadge.innerText = '🎙️ شرح ندى بدوي (مصري طبيعي)';
        engineBadge.className = 'text-[9px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30';
      } else {
        engineBadge.innerText = '🎙️ معلمة الأحياء (مصري ar-EG)';
        engineBadge.className = 'text-[9px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30';
      }
    }

    if (prevBtn) prevBtn.disabled = state.currentSegmentIndex <= 0;
    if (nextBtn) nextBtn.disabled = state.currentSegmentIndex >= state.segments.length - 1;
    if (prevBtn) prevBtn.classList.toggle('hidden', !prevBtn); // Simple check
    if (nextBtn) nextBtn.classList.toggle('hidden', !nextBtn);

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

  function updateSpeedUI() {
    const curSpeed = state.speed;
    const label = formatSpeedLabel(curSpeed);
    const badgeEl = document.getElementById('speed-current-val');
    if (badgeEl) {
      badgeEl.innerText = `${label} ▼`;
    }

    document.querySelectorAll('[data-audio-speed]').forEach((b) => {
      const spd = parseFloat(b.getAttribute('data-audio-speed'));
      const matches = Math.abs(spd - curSpeed) < 0.04;
      const checkIcon = b.querySelector('.speed-check-icon');
      
      b.classList.toggle('bg-sky-500/20', matches);
      b.classList.toggle('text-white', matches);
      b.classList.toggle('border', matches);
      b.classList.toggle('border-sky-400/40', matches);
      b.classList.toggle('text-slate-200', !matches);

      if (checkIcon) {
        checkIcon.style.opacity = matches ? '1' : '0';
      }
    });
  }

  function updateSpeedButtonsUI() {
    updateSpeedUI();
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

  let toastTimer = null;
  function showAudioToast(msg, type = 'info') {
    const toast = document.getElementById('audio-toast');
    if (!toast) return;

    toast.innerText = msg;
    toast.className = `fixed bottom-16 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-xl med-glass-strong text-xs font-bold transition-all shadow-xl pointer-events-none ${
      type === 'error'
        ? 'text-rose-200 border-rose-500/40'
        : type === 'warn'
        ? 'text-amber-200 border-amber-500/40'
        : 'text-sky-200 border-sky-400/40'
    }`;
    toast.classList.remove('hidden');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2800);
  }

  // إغلاق قائمة السرعة عند النقر في أي مكان خارجها
  document.addEventListener('click', (e) => {
    const speedContainer = document.getElementById('audio-speed-container');
    if (speedContainer && !speedContainer.contains(e.target)) {
      closeSpeedMenu();
    }
  });

  // التصدير
  window.BioNeuralPlayer = {
    loadItem,
    play,
    pause,
    togglePlay,
    stop,
    replayCurrentSegment,
    nextSegment,
    prevSegment,
    jumpToSegment,
    seek: seekToPercent,
    setSpeed,
    toggleSpeedMenu,
    openSpeedMenu,
    closeSpeedMenu,
    setVolume,
    toggleMute,
    toggleAutoSpeech,
    getState: () => Object.assign({}, state)
  };

  window.speakAnatomicalCard = function (item) {
    if (!item) return;
    loadItem(item, '', '', true);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      updateSpeedUI();
      updateVolumeUI();
    });
  } else {
    updateSpeedUI();
    updateVolumeUI();
  }
})();
