// =========================================================================
// نظام إدارة التطبيق التقدمي PWA والعمل دون إنترنت (Offline-First Manager)
// =========================================================================
(function () {
  const OFFLINE_CACHE_NAME = 'bio-atlas-offline-v5';
  const CRITICAL_OFFLINE_ASSETS = [
    '/',
    '/index.html',
    '/manifest.webmanifest',
    '/manifest.json',
    '/favicon.ico?v=2',
    '/favicon-16x16.png?v=2',
    '/favicon-32x32.png?v=2',
    '/apple-touch-icon.png?v=2',
    '/pwa-192x192.png?v=2',
    '/pwa-512x512.png?v=2',
    '/pwa-maskable-512x512.png?v=2',
    '/logo-atlas.png?v=2',
    '/js/curriculum-data.js',
    '/js/encyclopedic-systems.js',
    '/js/anatomical-registry.js',
    '/js/bone-studio.js',
    '/js/atlas-engine.js',
    '/js/pwa-manager.js',
    '/models/skeleton.glb',
    '/models/skeletal_system.glb',
    '/models/muscles.glb',
    '/models/muscular_system.glb',
    '/models/nerves.glb',
    '/models/nervous_system.glb',
    '/models/brain.glb',
    '/models/brain_standalone.glb',
    '/models/organs.glb'
  ];

  // Register Service Worker reliably
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          console.log('[BioAtlas PWA] Service Worker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('[BioAtlas PWA] Service Worker registration error:', err);
        });
    });
  }

  let deferredPrompt = window.__deferredPWAPrompt || null;

  function isStandaloneMode() {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    );
  }

  function isIOSDevice() {
    const ua = window.navigator.userAgent.toLowerCase();
    const isAppleTouch = /iphone|ipad|ipod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    return isAppleTouch;
  }

  function updateInstallButtonState() {
    const btn = document.getElementById('btn-pwa-install');
    const installedBadge = document.getElementById('pwa-installed-badge');
    if (!btn) return;

    if (isStandaloneMode()) {
      btn.classList.add('hidden');
      if (installedBadge) installedBadge.classList.remove('hidden');
    } else {
      btn.classList.remove('hidden');
      if (installedBadge) installedBadge.classList.add('hidden');
    }
  }

  function updateOfflineBadge() {
    const badge = document.getElementById('offline-status-pill');
    if (!badge) return;
    if (navigator.onLine) {
      badge.classList.add('hidden');
    } else {
      badge.classList.remove('hidden');
    }
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    window.__deferredPWAPrompt = e;
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    window.__deferredPWAPrompt = null;
    updateInstallButtonState();
    closePWAInstallModal();
  });

  window.addEventListener('online', updateOfflineBadge);
  window.addEventListener('offline', updateOfflineBadge);

  function openPWAInstallModal(mode) {
    const modal = document.getElementById('pwa-install-modal');
    const titleEl = document.getElementById('pwa-modal-title');
    const subtitleEl = document.getElementById('pwa-modal-subtitle');
    const iosBox = document.getElementById('pwa-guide-ios');
    const androidBox = document.getElementById('pwa-guide-android');
    if (!modal) return;

    if (mode === 'ios') {
      if (titleEl) titleEl.innerText = 'تثبيت التطبيق على iPhone و iPad';
      if (subtitleEl) subtitleEl.innerText = 'أضف أطلس الأحياء التفاعلي 3D إلى شاشتك الرئيسية';
      if (iosBox) iosBox.classList.remove('hidden');
      if (androidBox) androidBox.classList.add('hidden');
    } else {
      if (titleEl) titleEl.innerText = 'تنزيل وتثبيت أطلس الأحياء 3D';
      if (subtitleEl) subtitleEl.innerText = 'استخدام كامل دون إنترنت وبشاشة مستقلة';
      if (iosBox) iosBox.classList.add('hidden');
      if (androidBox) androidBox.classList.remove('hidden');
    }

    modal.classList.remove('hidden');
    refreshOfflineCacheSummary();
  }

  function closePWAInstallModal() {
    const modal = document.getElementById('pwa-install-modal');
    if (modal) modal.classList.add('hidden');
  }
  window.closePWAInstallModal = closePWAInstallModal;

  async function handlePWAInstallClick() {
    if (isStandaloneMode()) {
      updateInstallButtonState();
      return;
    }

    const activePrompt = deferredPrompt || window.__deferredPWAPrompt;
    if (activePrompt && !isIOSDevice()) {
      try {
        await activePrompt.prompt();
        const choice = await activePrompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          deferredPrompt = null;
          window.__deferredPWAPrompt = null;
          updateInstallButtonState();
          return;
        }
      } catch (err) {
        console.warn('[BioAtlas PWA] Install prompt error:', err);
      }
    }

    openPWAInstallModal(isIOSDevice() ? 'ios' : 'android');
  }
  window.handlePWAInstallClick = handlePWAInstallClick;

  async function refreshOfflineCacheSummary() {
    const statusText = document.getElementById('pwa-offline-status-text');
    const bar = document.getElementById('pwa-offline-progress-bar');
    const pctEl = document.getElementById('pwa-offline-progress-pct');
    if (!statusText || !('caches' in window)) return;
    try {
      const cache = await caches.open(OFFLINE_CACHE_NAME);
      const keys = await cache.keys();
      const pct = Math.min(100, Math.round((keys.length / CRITICAL_OFFLINE_ASSETS.length) * 100));
      if (bar) bar.style.width = `${pct}%`;
      if (pctEl) pctEl.innerText = `${pct}%`;
      if (keys.length >= CRITICAL_OFFLINE_ASSETS.length - 2) {
        if (bar) bar.style.width = '100%';
        if (pctEl) pctEl.innerText = '100%';
        statusText.innerText = `جاهز للعمل دون إنترنت (${keys.length} ملفاً مخزناً محلياً)`;
      } else if (keys.length > 0) {
        statusText.innerText = `تم تخزين ${keys.length} من ${CRITICAL_OFFLINE_ASSETS.length} ملفاً أساسياً`;
      } else {
        statusText.innerText = 'اضغط لتنزيل جميع المجسمات والملفات للعمل دون إنترنت';
      }
    } catch (_) {
      statusText.innerText = 'التخزين المحلي متاح أثناء التصفح';
    }
  }

  async function precacheAllForOffline() {
    const btn = document.getElementById('btn-precache-offline');
    const bar = document.getElementById('pwa-offline-progress-bar');
    const pctEl = document.getElementById('pwa-offline-progress-pct');
    const statusText = document.getElementById('pwa-offline-status-text');

    if (!('caches' in window)) {
      if (statusText) statusText.innerText = 'المتصفح لا يدعم Cache Storage في هذا الوضع.';
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.classList.add('opacity-70', 'pointer-events-none');
    }

    try {
      const cache = await caches.open(OFFLINE_CACHE_NAME);
      let completed = 0;
      const total = CRITICAL_OFFLINE_ASSETS.length;

      for (const url of CRITICAL_OFFLINE_ASSETS) {
        try {
          const res = await fetch(url, { cache: 'reload' });
          if (res && res.ok) {
            await cache.put(url, res);
          }
        } catch (err) {
          console.warn('[Offline Precache] Skipped:', url, err);
        }
        completed++;
        const pct = Math.round((completed / total) * 100);
        if (bar) bar.style.width = `${pct}%`;
        if (pctEl) pctEl.innerText = `${pct}%`;
        if (statusText) statusText.innerText = `جاري الحفظ المحلي... (${completed} / ${total})`;
      }

      if (statusText) {
        statusText.innerText = 'اكتمل التنزيل! يعمل الأطلس ومجسماته 3D الآن بدون إنترنت.';
      }
    } catch (err) {
      if (statusText) {
        statusText.innerText = 'تعذر إكمال التنزيل، تحقق من اتصال الإنترنت وحاول مجدداً.';
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.classList.remove('opacity-70', 'pointer-events-none');
      }
    }
  }
  window.precacheAllForOffline = precacheAllForOffline;

  document.addEventListener('DOMContentLoaded', () => {
    updateInstallButtonState();
    updateOfflineBadge();
    refreshOfflineCacheSummary();
  });

  if (document.readyState !== 'loading') {
    updateInstallButtonState();
    updateOfflineBadge();
    refreshOfflineCacheSummary();
  }
})();
