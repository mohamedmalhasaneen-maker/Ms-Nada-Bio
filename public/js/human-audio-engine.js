// =========================================================================
// محرك واستوديو التسجيلات الصوتية البشرية الحقيقية (Human Audio Engine & Studio)
// التسجيل المباشر بالميكروفون، رفع واستبدال التسجيلات البشريّة، والتشغيل النقي
// =========================================================================
(function () {
  'use strict';

  let humanManifest = {};
  let mediaRecorder = null;
  let audioChunks = [];
  let recordingStartTime = 0;
  let recordingTimerInterval = null;
  let currentRecordingBlob = null;
  let currentRecordingBase64 = '';
  let currentRecordingMime = 'audio/webm';
  let audioContext = null;
  let analyser = null;

  // 1. جلب فهرس التسجيلات البشرية الحالية من السيرفر
  async function fetchHumanAudioManifest() {
    try {
      const resp = await fetch('/api/human-audio/manifest');
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.manifest) {
          humanManifest = data.manifest;
        }
      }
    } catch (e) {
      console.warn('Could not load human audio manifest:', e);
    }
    return humanManifest;
  }

  function getHumanRecording(itemId, sectionKey) {
    if (!humanManifest[itemId]) return null;
    return humanManifest[itemId][sectionKey] || null;
  }

  function hasHumanRecording(itemId, sectionKey) {
    return Boolean(getHumanRecording(itemId, sectionKey));
  }

  function getItemHumanCoverage(itemId, segments) {
    if (!segments || segments.length === 0) return { total: 0, recorded: 0, pct: 0 };
    let count = 0;
    const itemMap = humanManifest[itemId] || {};

    segments.forEach(seg => {
      const secKey = seg.type || 'overview';
      if (itemMap[secKey]) count++;
    });

    return {
      total: segments.length,
      recorded: count,
      pct: segments.length > 0 ? Math.round((count / segments.length) * 100) : 0
    };
  }

  // 2. بدء التسجيل المباشر بالميكروفون داخل الاستوديو
  async function startLiveMicrophoneRecording(onTimerTick, onError) {
    try {
      audioChunks = [];
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // تحديد نوع الترميز المتوافق مع المتصفح
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/wav'
      ];
      let selectedMime = 'audio/webm';
      for (const m of mimeTypes) {
        if (MediaRecorder.isTypeSupported(m)) {
          selectedMime = m;
          break;
        }
      }
      currentRecordingMime = selectedMime;

      mediaRecorder = new MediaRecorder(stream, { mimeType: selectedMime });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      recordingStartTime = Date.now();
      if (recordingTimerInterval) clearInterval(recordingTimerInterval);
      recordingTimerInterval = setInterval(() => {
        const elapsedSec = Math.floor((Date.now() - recordingStartTime) / 1000);
        if (onTimerTick) onTimerTick(elapsedSec);
      }, 500);

      mediaRecorder.start(250); // تجميع كل 250ms
      return true;
    } catch (err) {
      console.error('Microphone access error:', err);
      if (onError) onError('تعذر الوصول إلى الميكروفون. يرجى التأكد من منح الصلاحية.');
      return false;
    }
  }

  // 3. إيقاف التسجيل واستخراج ملف الصوت Base64
  function stopLiveMicrophoneRecording() {
    return new Promise((resolve) => {
      if (recordingTimerInterval) {
        clearInterval(recordingTimerInterval);
        recordingTimerInterval = null;
      }

      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }

      const durationSec = Math.round((Date.now() - recordingStartTime) / 1000);

      mediaRecorder.onstop = async () => {
        // إيقاف مسارات الميكروفون لتحرير العتاد
        if (mediaRecorder.stream) {
          mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }

        const blob = new Blob(audioChunks, { type: currentRecordingMime });
        currentRecordingBlob = blob;

        const reader = new FileReader();
        reader.onloadend = () => {
          const resultStr = reader.result;
          const base64Data = resultStr.split(',')[1] || resultStr;
          currentRecordingBase64 = base64Data;

          resolve({
            blob,
            base64Data,
            mimeType: currentRecordingMime,
            durationSeconds: durationSec,
            audioUrl: URL.createObjectURL(blob)
          });
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.stop();
    });
  }

  // 4. قراءة ملف صوتي مرفوع من جهاز الكمبيوتر/الهاتف
  function readUploadedAudioFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('لم يتم تحديد ملف'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const resultStr = e.target.result;
        const base64Data = resultStr.split(',')[1] || resultStr;
        const mimeType = file.type || 'audio/mp3';

        // حساب المدة التقريبية أو إنشاؤها عبر عنصر Audio
        const audio = new Audio();
        audio.src = URL.createObjectURL(file);
        audio.onloadedmetadata = () => {
          resolve({
            file,
            base64Data,
            mimeType,
            durationSeconds: Math.round(audio.duration || 0),
            audioUrl: audio.src
          });
        };
        audio.onerror = () => {
          resolve({
            file,
            base64Data,
            mimeType,
            durationSeconds: 15,
            audioUrl: URL.createObjectURL(file)
          });
        };
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  // 5. حفظ ونشر التسجيل الصوتي البشري المباشر للسيرفر
  async function publishHumanVoiceRecording(itemId, sectionKey, audioBase64, mimeType, durationSeconds, speakerName) {
    try {
      const resp = await fetch('/api/human-audio/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          sectionKey,
          audioBase64,
          mimeType: mimeType || 'audio/webm',
          durationSeconds: durationSeconds || 0,
          speakerName: speakerName || 'مس / ندى بدوي (تسجيل بشري حقيقي)'
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        await fetchHumanAudioManifest();
        return { success: true, data };
      } else {
        const errData = await resp.json();
        return { success: false, error: errData.message || 'فشل رفع التسجيل' };
      }
    } catch (err) {
      console.error('Error publishing human voice recording:', err);
      return { success: false, error: 'حدث خطأ في الاتصال أثناء حفظ التسجيل' };
    }
  }

  // 6. حذف تسجيل بشري لعضو وقسم معين
  async function deleteHumanVoiceRecording(itemId, sectionKey) {
    try {
      const resp = await fetch('/api/human-audio/recording', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, sectionKey })
      });

      if (resp.ok) {
        await fetchHumanAudioManifest();
        return true;
      }
    } catch (e) {
      console.warn('Error deleting recording:', e);
    }
    return false;
  }

  // التهيئة التلقائية
  document.addEventListener('DOMContentLoaded', () => {
    fetchHumanAudioManifest();
  });

  window.BioHumanAudioEngine = {
    fetchHumanAudioManifest,
    getHumanRecording,
    hasHumanRecording,
    getItemHumanCoverage,
    startLiveMicrophoneRecording,
    stopLiveMicrophoneRecording,
    readUploadedAudioFile,
    publishHumanVoiceRecording,
    deleteHumanVoiceRecording
  };
})();
