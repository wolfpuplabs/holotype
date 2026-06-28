import { list, put } from '@vercel/blob';

// Fixed pathname for the library manifest stored in Vercel Blob.
export const LIBRARY_PATH = 'library/index.json';

// Read the manifest. Returns an array of asset records (empty if none yet).
export async function readLibrary() {
  try {
    const { blobs } = await list({ prefix: 'library/' });
    const entry = blobs.find((b) => b.pathname === LIBRARY_PATH);
    if (!entry) return [];
    // Cache-bust so we never read a stale CDN copy after an overwrite.
    const res = await fetch(`${entry.url}?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('readLibrary failed', err);
    return [];
  }
}

// Overwrite the manifest with the given array.
export async function writeLibrary(items) {
  await put(LIBRARY_PATH, JSON.stringify(items), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });
}

// Constant-time-ish password check against the APP_PASSWORD env var.
export function checkPassword(candidate) {
  const expected = process.env.APP_PASSWORD;
  if (!expected) return false;
  return typeof candidate === 'string' && candidate === expected;
}
