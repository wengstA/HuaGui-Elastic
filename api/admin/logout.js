const { clearSessionCookie, sendError, sendJson } = require('../_cms');

module.exports = async function logoutHandler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendError(res, 405, 'Method not allowed');
  }

  res.setHeader('Set-Cookie', clearSessionCookie());
  return sendJson(res, 200, {
    ok: true
  }, {
    'Cache-Control': 'no-store'
  });
};
