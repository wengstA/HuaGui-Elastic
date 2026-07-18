const { createInquiry } = require('./_inquiries');
const { parseJsonBody, sendError, sendJson } = require('./_cms');

module.exports = async function contactHandler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendError(res, 405, 'Method not allowed');
  }

  try {
    const body = await parseJsonBody(req, 32 * 1024);

    // Honeypot fields are hidden from real visitors. Return a neutral response to bots.
    if (String(body.website || '').trim()) {
      return sendJson(res, 201, { ok: true }, { 'Cache-Control': 'no-store' });
    }

    const inquiry = await createInquiry({
      ...body,
      sourceUrl: body.sourceUrl || req.headers.referer || ''
    });
    return sendJson(res, 201, {
      ok: true,
      inquiry: {
        id: inquiry.id,
        createdAt: inquiry.createdAt
      }
    }, {
      'Cache-Control': 'no-store'
    });
  } catch (error) {
    const statusCode = error.statusCode || (error instanceof SyntaxError ? 400 : 500);
    return sendError(res, statusCode, error.message || 'Unable to submit inquiry');
  }
};
