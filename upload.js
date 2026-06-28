import { handleUpload } from '@vercel/blob/client';
import { checkPassword } from './_lib.js';

// Generates short-lived client tokens so the browser can upload large files
// (GLB / USDZ / video) straight to Vercel Blob, bypassing the 4.5 MB function
// body limit. The password from the client payload is verified before any
// token is issued — without this anyone could upload to the store.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let password = '';
        try {
          password = JSON.parse(clientPayload || '{}').password || '';
        } catch (_) {
          /* ignore malformed payload */
        }
        if (!checkPassword(password)) {
          throw new Error('Wrong password');
        }
        return {
          allowedContentTypes: [
            'model/gltf-binary',
            'model/vnd.usdz+zip',
            'application/octet-stream',
            'application/zip',
            'audio/mpeg',
            'audio/wav',
            'audio/ogg',
            'audio/mp4',
            'audio/aac',
            'video/mp4',
            'video/webm',
            'video/quicktime',
            'image/png',
            'image/jpeg',
            'image/webp',
          ],
          maximumSizeInBytes: 500 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({}),
        };
      },
      onUploadCompleted: async () => {
        // The manifest is written by /api/library after all parts succeed,
        // so nothing to do here. (This callback also doesn't fire on localhost.)
      },
    });
    return res.status(200).json(jsonResponse);
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Upload rejected' });
  }
}
