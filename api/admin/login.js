const {
  createSessionCookie,
  isAdminPasswordConfigured,
  parseJsonBody,
  sendError,
  sendJson,
  verifyAdminPassword
} = require('../_cms');

module.exports = async function loginHandler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendError(res, 405, 'Method not allowed');
  }

  try {
    if (!isAdminPasswordConfigured()) {
      return sendError(res, 500, 'Admin password is not configured.');
    }

    const body = await parseJsonBody(req, 32 * 1024);
    if (!verifyAdminPassword(String(body.password || ''))) {
      return sendError(res, 401, 'Invalid password');
    }

    res.setHeader('Set-Cookie', createSessionCookie());
    return sendJson(res, 200, {
      ok: true
    }, {
      'Cache-Control': 'no-store'
    });
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || 'Unable to sign in');
  }
};
