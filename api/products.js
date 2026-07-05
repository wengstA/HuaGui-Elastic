const { loadProducts, sendError, sendJson } = require('./_cms');

module.exports = async function productsHandler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return sendError(res, 405, 'Method not allowed');
  }

  try {
    const products = await loadProducts({ includeDrafts: false });
    return sendJson(res, 200, {
      ok: true,
      products
    }, {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || 'Unable to load products');
  }
};
