const CACHE_NAME = 'bio-atlas-offline-v5';

const SAME_ORIGIN_ASSETS = [
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

const EXTERNAL_CDN_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js',
  'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@500;600;700;800;900&family=JetBrains+Mono:wght@500;700&family=Readex+Pro:wght@400;500;600;700&display=swap'
];

async function cacheAssetSafely(cache, url, isExternal = false) {
  try {
    const req = isExternal
      ? new Request(url, { mode: 'no-cors' })
      : new Request(url, { cache: 'reload' });
    const res = await fetch(req);
    if (res && (res.ok || res.type === 'opaque')) {
      await cache.put(url, res);
      return true;
    }
  } catch (err) {
    console.warn('[Service Worker] Failed to precache:', url, err);
  }
  return false;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled([
        ...SAME_ORIGIN_ASSETS.map((url) => cacheAssetSafely(cache, url, false)),
        ...EXTERNAL_CDN_ASSETS.map((url) => cacheAssetSafely(cache, url, true))
      ]);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) return;

  // Never intercept Vite internal dev endpoints
  if (url.pathname.startsWith('/@vite/') || url.pathname.startsWith('/@react-refresh')) {
    return;
  }

  const isNavigation =
    event.request.mode === 'navigate' ||
    (event.request.headers.get('accept') || '').includes('text/html');

  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          return cached || caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  const isLocalJs = url.origin === self.location.origin && url.pathname.startsWith('/js/');
  if (isLocalJs) {
    // Stale-While-Revalidate for local curriculum & engine JS
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        const networkPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => null);

        if (cachedResponse) {
          return cachedResponse;
        }
        const netRes = await networkPromise;
        return netRes || new Response('', { status: 503, statusText: 'Offline' });
      })
    );
    return;
  }

  const isImmutableOrAsset =
    url.pathname.includes('/models/') ||
    url.pathname.endsWith('.glb') ||
    url.pathname.endsWith('.gltf') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.webmanifest') ||
    url.pathname.endsWith('.json') ||
    url.hostname.includes('cdnjs.cloudflare.com') ||
    url.hostname.includes('cdn.jsdelivr.net') ||
    url.hostname.includes('cdn.tailwindcss.com') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com');

  if (isImmutableOrAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          return new Response('Offline asset not available', { status: 503, statusText: 'Offline' });
        }
      })
    );
    return;
  }

  // Default: Network First with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.ok) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
      })
  );
});
