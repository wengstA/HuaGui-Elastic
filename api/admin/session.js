const { sendJson } = require('../_cms');

module.exports = async function sessionHandler(req, res) {
  const { isAuthenticated } = require('../_cms');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return sendJson(res, 405, { ok: false, error: 'Method not allowed' });
  }

  return sendJson(res, 200, {
    ok: true,
    authenticated: isAuthenticated(req)
  }, {
    'Cache-Control': 'no-store'
  });
};
