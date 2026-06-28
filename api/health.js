import { list } from '@vercel/blob';

// Lightweight diagnostics so the app (and you) can tell at a glance whether the
// backend is wired up correctly: is APP_PASSWORD set, is BLOB_READ_WRITE_TOKEN set,
// and does the token actually work against the Blob store?
export default async function handler(req, res) {
  const hasPassword = Boolean(process.env.APP_PASSWORD);
  const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

  let blobOk = false;
  let blobError = null;
  if (hasBlobToken) {
    try {
      await list({ limit: 1 });
      blobOk = true;
    } catch (err) {
      blobError = err && err.message ? err.message : 'list() failed';
    }
  }

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ hasPassword, hasBlobToken, blobOk, blobError });
}
