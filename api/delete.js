import { del } from '@vercel/blob';
import { readLibrary, writeLibrary, checkPassword } from './_lib.js';

// POST { password, id } -> remove the asset from the manifest and delete its
// underlying blob files (model, usdz, audio, video, thumbnail).
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password, id } = req.body || {};
  if (!checkPassword(password)) {
    return res.status(401).json({ error: 'Wrong password' });
  }
  if (!id) {
    return res.status(400).json({ error: 'Missing asset id' });
  }

  const items = await readLibrary();
  const target = items.find((a) => a.id === id);
  if (!target) {
    return res.status(404).json({ error: 'Asset not found' });
  }

  await writeLibrary(items.filter((a) => a.id !== id));

  const urls = [target.glb, target.usdz, target.audio, target.video, target.thumbnail].filter(
    Boolean,
  );
  if (urls.length) {
    try {
      await del(urls);
    } catch (err) {
      // Manifest is already updated; orphaned files can be cleaned later.
      console.error('blob delete failed', err);
    }
  }

  return res.status(200).json({ ok: true });
}
