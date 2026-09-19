/**
 * Persistent 3D Model Cache using IndexedDB & CacheStorage.
 * Stores downloaded .glb/.gltf models permanently in the browser
 * so they load instantly (~10ms) on subsequent visits without re-downloading.
 */

const DB_NAME = 'Anatomy3DModelsCache';
const DB_VERSION = 1;
const STORE_NAME = 'models_data';

interface CachedModelRecord {
  id: string;
  url: string;
  data: ArrayBuffer;
  size: number;
  timestamp: number;
  system: string;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('url', 'url', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      console.warn('Failed to open IndexedDB for 3D model cache:', request.error);
      reject(request.error);
    };
  });

  return dbPromise;
}

/**
 * Retrieve a cached ArrayBuffer from IndexedDB by key or URL
 */
export async function getCachedModel(key: string): Promise<ArrayBuffer | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result as CachedModelRecord | undefined;
        if (result && result.data instanceof ArrayBuffer && result.data.byteLength > 1000) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        resolve(null);
      };
    });
  } catch (e) {
    console.warn('Error reading from IndexedDB cache:', e);
    return null;
  }
}

/**
 * Save an ArrayBuffer into IndexedDB permanently
 */
export async function saveModelToCache(
  key: string,
  url: string,
  data: ArrayBuffer,
  system: string = 'general'
): Promise<boolean> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const record: CachedModelRecord = {
        id: key,
        url,
        data,
        size: data.byteLength,
        timestamp: Date.now(),
        system,
      };

      const request = store.put(record);

      request.onsuccess = () => {
        resolve(true);
      };

      request.onerror = (err) => {
        console.warn('Error writing model to IndexedDB:', err);
        resolve(false);
      };
    });
  } catch (e) {
    console.warn('Error saving to IndexedDB cache:', e);
    return false;
  }
}

/**
 * Check if a model exists in local cache
 */
export async function isModelCached(key: string): Promise<boolean> {
  const data = await getCachedModel(key);
  return data !== null;
}

/**
 * Get total cached models info
 */
export async function getCacheStats(): Promise<{ count: number; totalSizeBytes: number; keys: string[] }> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const records = (request.result || []) as CachedModelRecord[];
        const totalSizeBytes = records.reduce((acc, r) => acc + (r.size || 0), 0);
        const keys = records.map((r) => r.id);
        resolve({
          count: records.length,
          totalSizeBytes,
          keys,
        });
      };

      request.onerror = () => {
        resolve({ count: 0, totalSizeBytes: 0, keys: [] });
      };
    });
  } catch {
    return { count: 0, totalSizeBytes: 0, keys: [] };
  }
}

/**
 * Clear the persistent cache if user requests a refresh
 */
export async function clearModelsCache(): Promise<boolean> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

/**
 * High-performance fetcher with persistent browser storage:
 * 1. Checks IndexedDB cache first -> returns instantly if cached
 * 2. If not cached -> downloads with progress feedback
 * 3. Saves to IndexedDB permanently for all future visits
 * 4. Falls back to secondary CDN URL if primary fails
 */
export async function loadModelWithPersistentCache(
  cacheKey: string,
  primaryUrl: string,
  fallbackUrl?: string,
  onProgress?: (progress: number, loadedBytes: number, totalBytes: number, isFromCache: boolean) => void
): Promise<{ data: ArrayBuffer; fromCache: boolean }> {
  // 1. Check local persistent IndexedDB cache
  const cachedData = await getCachedModel(cacheKey);
  if (cachedData) {
    if (onProgress) {
      onProgress(100, cachedData.byteLength, cachedData.byteLength, true);
    }
    return { data: cachedData, fromCache: true };
  }

  // 2. Fetch from network
  const download = async (url: string): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'arraybuffer';

      xhr.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) {
          const percent = Math.min(99, Math.round((event.loaded / event.total) * 100));
          if (onProgress) {
            onProgress(percent, event.loaded, event.total, false);
          }
        } else {
          if (onProgress) {
            onProgress(50, event.loaded, 0, false);
          }
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300 && xhr.response instanceof ArrayBuffer) {
          resolve(xhr.response);
        } else {
          reject(new Error(`HTTP error ${xhr.status} while fetching ${url}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error(`Network error while fetching ${url}`));
      };

      xhr.send();
    });
  };

  let buffer: ArrayBuffer;
  try {
    buffer = await download(primaryUrl);
  } catch (primaryErr) {
    console.warn(`Primary URL ${primaryUrl} failed:`, primaryErr);
    if (fallbackUrl && fallbackUrl !== primaryUrl) {
      buffer = await download(fallbackUrl);
    } else {
      throw primaryErr;
    }
  }

  // 3. Save to persistent cache asynchronously without blocking
  if (buffer && buffer.byteLength > 1000) {
    saveModelToCache(cacheKey, primaryUrl, buffer, cacheKey).catch((err) => {
      console.warn('Failed to persist model to IndexedDB:', err);
    });
  }

  if (onProgress) {
    onProgress(100, buffer.byteLength, buffer.byteLength, false);
  }

  return { data: buffer, fromCache: false };
}
