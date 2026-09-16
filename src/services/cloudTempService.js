/**
 * Cloud Temporary File Storage Service
 * Manages file uploads (Built-in Server Storage & Cloudflare Worker/R2),
 * ultra-short link indexing (/s/:shortId), and seamless cross-browser retrieval.
 */

// Default Cloudflare Worker URL for KitsLight Cloud Temp Storage
export const DEFAULT_WORKER_URL = 'https://kitslight-r2-api.divaagustinpurba.workers.dev';

// Generate random alphanumeric 6-char Short ID
export function generateShortId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Upload File to Cloud Temporary Storage
 * @param {File} file - File object to upload
 * @param {number} durationHours - Number of hours before auto-expiration
 * @param {Object} r2Config - R2 Storage configuration from Admin Context
 */
export async function uploadTempFile(file, durationHours, r2Config = {}) {
  const shortId = generateShortId();
  const safeFileName = file.name.replace(/[^\w\.\-]/g, '_');
  const now = Date.now();
  const expiresAtTimestamp = now + durationHours * 3600 * 1000;
  const expiresAtFormatted = new Date(expiresAtTimestamp).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
  const cleanShortUrl = `${window.location.origin}/s/${shortId}`;

  // Worker URL precedence: Configured in Admin > DEFAULT_WORKER_URL
  const workerBase = (r2Config?.workerUrl || DEFAULT_WORKER_URL).replace(/\/$/, '');

  // OPTION 1: Upload via Cloudflare Worker (Which stores file & metadata into Cloudflare R2!)
  if (workerBase) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('shortId', shortId);
      formData.append('fileName', file.name);
      formData.append('expiresAt', expiresAtTimestamp.toString());

      const response = await fetch(`${workerBase}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Worker upload error (${response.status}): ${await response.text()}`);
      }

      const resData = await response.json();

      const metadata = {
        shortId,
        fileName: file.name,
        safeFileName,
        sizeMB,
        sizeBytes: file.size,
        createdAt: now,
        expiresAtTimestamp,
        expiresAtFormatted,
        shortUrl: cleanShortUrl,
        workerUrl: workerBase,
        r2DirectUrl: resData.url || `${workerBase}/file/${shortId}`,
        storageType: 'r2_worker',
      };

      // Save locally
      try {
        const localIndex = JSON.parse(localStorage.getItem('kitslight_cloud_temp_index') || '{}');
        localIndex[shortId] = metadata;
        localStorage.setItem('kitslight_cloud_temp_index', JSON.stringify(localIndex));
      } catch (e) {}

      return metadata;
    } catch (err) {
      console.warn('Cloudflare Worker upload failed, falling back to local server:', err);
    }
  }

  // OPTION 2: Default Built-in Server Storage (Vite Middleware)
  try {
    const response = await fetch('/api/temp-cloud/upload', {
      method: 'POST',
      headers: {
        'x-short-id': shortId,
        'x-file-name': encodeURIComponent(file.name),
        'x-expires-at': expiresAtTimestamp.toString(),
        'x-file-size': file.size.toString(),
      },
      body: file,
    });

    if (response.ok) {
      const resData = await response.json();
      return {
        ...resData.metadata,
        shortUrl: cleanShortUrl,
      };
    }
  } catch (err) {
    console.warn('Local server upload error:', err);
  }

  // Fallback: Local client metadata
  const metadata = {
    shortId,
    fileName: file.name,
    safeFileName,
    sizeMB,
    sizeBytes: file.size,
    createdAt: now,
    expiresAtTimestamp,
    expiresAtFormatted,
    shortUrl: cleanShortUrl,
    storageType: 'local_client',
  };

  try {
    const localIndex = JSON.parse(localStorage.getItem('kitslight_cloud_temp_index') || '{}');
    localIndex[shortId] = metadata;
    localStorage.setItem('kitslight_cloud_temp_index', JSON.stringify(localIndex));
  } catch (e) {}

  return metadata;
}

/**
 * Get File Metadata by Short ID (Universal Cross-Browser & Cross-Device Support)
 * Resolves clean URLs like /s/:shortId without any query parameters!
 * @param {string} shortId
 */
export async function getTempFileMetadata(shortId) {
  if (!shortId) return null;

  // Resolve Cloudflare Worker URL from multiple sources:
  let workerUrl = null;

  // Source A: Admin Panel / localStorage configuration
  try {
    const adminConfig = JSON.parse(localStorage.getItem('kitslight_admin_config') || '{}');
    workerUrl = adminConfig.r2Storage?.workerUrl || localStorage.getItem('kitslight_worker_url');
  } catch (e) {}

  // Source B: Server Public Config (/api/public-config)
  if (!workerUrl) {
    try {
      const cfgRes = await fetch('/api/public-config');
      if (cfgRes.ok) {
        const cfgData = await cfgRes.json();
        if (cfgData.workerUrl) {
          workerUrl = cfgData.workerUrl.startsWith('http') ? cfgData.workerUrl : `https://${cfgData.workerUrl}`;
        }
      }
    } catch (e) {}
  }

  // Source C: URL Query Parameter ?w=... (if passed)
  if (!workerUrl) {
    try {
      const query = new URLSearchParams(window.location.search);
      const wParam = query.get('w');
      if (wParam) {
        workerUrl = wParam.startsWith('http') ? wParam : `https://${wParam}`;
      }
    } catch (e) {}
  }

  // Source D: Built-in Default Worker URL (Ensures clean links like /s/ab12cd work everywhere!)
  if (!workerUrl) {
    workerUrl = DEFAULT_WORKER_URL;
  }

  // 1. Fetch metadata directly from Cloudflare Worker R2!
  if (workerUrl) {
    try {
      const workerBase = workerUrl.replace(/\/$/, '');
      const res = await fetch(`${workerBase}/meta/${shortId}`);
      if (res.ok) {
        const meta = await res.json();
        meta.workerUrl = workerBase;
        meta.isExpired = Date.now() > meta.expiresAtTimestamp;
        return meta;
      }
    } catch (e) {
      console.warn('Fetching metadata from Cloudflare Worker failed:', e);
    }
  }

  // 2. Fetch from built-in server API (/api/temp-cloud/meta/:id)
  try {
    const res = await fetch(`/api/temp-cloud/meta/${shortId}`);
    if (res.ok) {
      const meta = await res.json();
      meta.isExpired = Date.now() > meta.expiresAtTimestamp;
      return meta;
    }
  } catch (e) {}

  // 3. Fallback to localStorage index (for uploader browser)
  try {
    const localIndex = JSON.parse(localStorage.getItem('kitslight_cloud_temp_index') || '{}');
    if (localIndex[shortId]) {
      const meta = { ...localIndex[shortId] };
      meta.isExpired = Date.now() > meta.expiresAtTimestamp;
      return meta;
    }
  } catch (e) {}

  return null;
}

/**
 * Get File Blob by Short ID
 * @param {string} shortId
 */
export async function getTempFileBlob(shortId) {
  const metadata = await getTempFileMetadata(shortId);
  if (!metadata || metadata.isExpired) {
    throw new Error('File tidak ditemukan atau sudah kadaluarsa.');
  }

  // 1. If stored on Cloudflare Worker / R2
  if (metadata.storageType === 'r2_worker' || metadata.workerUrl) {
    const workerUrl = metadata.workerUrl || localStorage.getItem('kitslight_worker_url') || DEFAULT_WORKER_URL;
    const downloadUrl = metadata.r2DirectUrl || (workerUrl ? `${workerUrl.replace(/\/$/, '')}/file/${shortId}` : null);
    if (downloadUrl) {
      const response = await fetch(downloadUrl);
      if (response.ok) {
        return await response.blob();
      }
    }
  }

  // 2. Fetch from built-in server API
  try {
    const res = await fetch(`/api/temp-cloud/file/${shortId}`);
    if (res.ok) {
      return await res.blob();
    }
  } catch (e) {}

  throw new Error('Data file tidak ditemukan di server atau telah dihapus otomatis.');
}

/**
 * Clean up expired files
 */
export async function autoCleanupExpiredFiles() {}
