const { listInquiries, storageMode, updateInquiryStatus } = require('../_inquiries');
const { parseJsonBody, requireAdmin, sendError, sendJson } = require('../_cms');

module.exports = async function adminInquiriesHandler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'PATCH'].includes(req.method)) {
    res.setHeader('Allow', 'GET, PATCH');
    return sendError(res, 405, 'Method not allowed');
  }
  if (!requireAdmin(req, res)) return;

  try {
    if (req.method === 'GET') {
      const inquiries = await listInquiries();
      return sendJson(res, 200, {
        ok: true,
        inquiries,
        storage: storageMode()
      }, {
        'Cache-Control': 'no-store'
      });
    }

    const body = await parseJsonBody(req, 16 * 1024);
    const inquiry = await updateInquiryStatus(String(body.id || ''), String(body.status || ''));
    return sendJson(res, 200, {
      ok: true,
      inquiry
    }, {
      'Cache-Control': 'no-store'
    });
  } catch (error) {
    const statusCode = error.statusCode || (error instanceof SyntaxError ? 400 : 500);
    return sendError(res, statusCode, error.message || 'Unable to manage inquiries');
  }
};
