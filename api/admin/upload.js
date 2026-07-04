const {
  parseJsonBody,
  requireAdmin,
  saveUploadedWebp,
  sendError,
  sendJson
} = require('../_cms');

module.exports = async function uploadHandler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendError(res, 405, 'Method not allowed');
  }

  if (!requireAdmin(req, res)) return;

  try {
    const body = await parseJsonBody(req, 3 * 1024 * 1024);
    const upload = await saveUploadedWebp({
      slug: body.slug,
      fileName: body.fileName,
      dataUrl: body.dataUrl
    });

    return sendJson(res, 200, {
      ok: true,
      upload
    }, {
      'Cache-Control': 'no-store'
    });
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || 'Unable to upload image');
  }
};
