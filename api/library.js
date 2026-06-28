import { readLibrary, writeLibrary, checkPassword } from './_lib.js';

// GET  -> { assets: [...] }  (public, anyone can browse the library)
// POST -> append one asset record to the manifest (password required)
export default async function handler(req, res) {
  if (req.method === 'GET') {
    const assets = await readLibrary();
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ assets });
  }

  if (req.method === 'POST') {
    const { password, asset } = req.body || {};
    if (!checkPassword(password)) {
      return res.status(401).json({ error: 'Wrong password' });
    }
    if (!asset || !asset.id || !asset.name) {
      return res.status(400).json({ error: 'Asset needs at least an id and a name' });
    }
    const items = await readLibrary();
    if (items.some((a) => a.id === asset.id)) {
      return res.status(409).json({ error: 'Asset already exists' });
    }
    items.unshift(asset);
    await writeLibrary(items);
    return res.status(200).json({ ok: true, asset });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
