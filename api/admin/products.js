const {
  loadProducts,
  normalizeProducts,
  parseJsonBody,
  requireAdmin,
  saveProductsDocument,
  sendError,
  sendJson
} = require('../_cms');

function validateProducts(products) {
  const normalized = normalizeProducts(products);
  const slugs = new Set();

  normalized.forEach(product => {
    if (slugs.has(product.slug)) {
      const error = new Error(`Duplicate slug: ${product.slug}`);
      error.statusCode = 400;
      throw error;
    }
    slugs.add(product.slug);

    if (product.status === 'published') {
      if (!product.name || product.name === 'Untitled Product') {
        const error = new Error('Published products need a name.');
        error.statusCode = 400;
        throw error;
      }
      if (!product.image) {
        const error = new Error(`${product.name} needs a main image before publishing.`);
        error.statusCode = 400;
        throw error;
      }
    }
  });

  return normalized;
}

module.exports = async function adminProductsHandler(req, res) {
  if (!['GET', 'PUT'].includes(req.method)) {
    res.setHeader('Allow', 'GET, PUT');
    return sendError(res, 405, 'Method not allowed');
  }

  if (!requireAdmin(req, res)) return;

  try {
    if (req.method === 'GET') {
      const products = await loadProducts({ includeDrafts: true });
      return sendJson(res, 200, {
        ok: true,
        products
      }, {
        'Cache-Control': 'no-store'
      });
    }

    const body = await parseJsonBody(req);
    const products = validateProducts(body.products);
    const document = await saveProductsDocument(products);

    return sendJson(res, 200, {
      ok: true,
      products: document.products,
      updatedAt: document.updatedAt
    }, {
      'Cache-Control': 'no-store'
    });
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message || 'Unable to save products');
  }
};
