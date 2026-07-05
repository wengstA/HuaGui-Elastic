const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

const CATEGORY_LABELS = {
  mens: "Men's Underwear Elastics",
  womens: "Women's Underwear Elastics",
  lingerie: 'Bra & Lingerie Elastics',
  activewear: 'Activewear Elastics'
};

const IMAGE_LABEL_PRESETS = [
  { label: 'Front & Back', group: 'Product Display' },
  { label: 'Front', group: 'Product Display' },
  { label: 'Back', group: 'Product Display' },
  { label: 'Colors', group: 'Product Display' },
  { label: 'Application', group: 'Application' }
];

const SESSION_COOKIE = 'huagui_admin';
const DEFAULT_SESSION_MAX_AGE_SECONDS = 12 * 60 * 60;
const PRODUCTS_BLOB_PATH = process.env.CMS_PRODUCTS_BLOB_PATH || 'cms/products.json';
const LOCAL_PRODUCTS_PATH = path.join(process.cwd(), 'huagui_company_site', 'data', 'products.json');
const LOCAL_UPLOAD_ROOT = path.join(process.cwd(), 'huagui_company_site', 'uploads');

function hasBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

function blobClientOptions() {
  return process.env.BLOB_READ_WRITE_TOKEN
    ? { token: process.env.BLOB_READ_WRITE_TOKEN }
    : {};
}

function isVercelRuntime() {
  return Boolean(process.env.VERCEL);
}

function sendJson(res, statusCode, payload, headers = {}) {
  res.statusCode = statusCode;
  Object.entries({
    'Content-Type': 'application/json; charset=utf-8',
    ...headers
  }).forEach(([key, value]) => res.setHeader(key, value));
  res.end(JSON.stringify(payload));
}

function sendError(res, statusCode, message, details) {
  sendJson(res, statusCode, {
    ok: false,
    error: message,
    ...(details ? { details } : {})
  });
}

async function parseJsonBody(req, maxBytes = 5 * 1024 * 1024) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');

  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) {
      const error = new Error('Request body is too large.');
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function toStringArray(value) {
  if (Array.isArray(value)) {
    return value.map(item => String(item || '').trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value.split(/\r?\n|,/).map(item => item.trim()).filter(Boolean);
  }
  return [];
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function normalizeImageLabelKey(value) {
  return String(value || '').trim().toLowerCase().replace(/&/g, 'and').replace(/\s+/g, ' ');
}

function imagePresetForIndex(index) {
  return IMAGE_LABEL_PRESETS[Math.min(index, IMAGE_LABEL_PRESETS.length - 1)];
}

function imagePresetForLabel(label, index = 0) {
  const key = normalizeImageLabelKey(label);
  const preset = IMAGE_LABEL_PRESETS.find(item => normalizeImageLabelKey(item.label) === key);
  if (preset) return preset;
  return imagePresetForIndex(index);
}

function imageAlt(productName, label) {
  return `${productName || 'Product'} - ${label}`;
}

function normalizeGalleryItem(item, index, productName) {
  const preset = imagePresetForLabel(typeof item === 'string' ? '' : (item && (item.label || item.thumbLabel)), index);
  if (typeof item === 'string') {
    return {
      group: preset.group,
      src: item,
      label: preset.label,
      alt: imageAlt(productName, preset.label),
      rotate: false
    };
  }

  const source = item && typeof item === 'object' ? item : {};
  return {
    group: preset.group,
    src: String(source.src || '').trim(),
    label: preset.label,
    alt: imageAlt(productName, preset.label),
    rotate: Boolean(source.rotate)
  };
}

function normalizeProduct(product, index = 0) {
  const source = product && typeof product === 'object' ? product : {};
  const name = String(source.name || 'Untitled Product').trim();
  const category = CATEGORY_LABELS[source.category] ? source.category : 'mens';
  const slug = slugify(source.slug || name || `product-${index + 1}`) || `product-${index + 1}`;
  const status = source.status === 'draft' ? 'draft' : 'published';
  const image = String(source.image || '').trim();
  const rawGallery = Array.isArray(source.gallery) ? source.gallery : [];
  const shouldPrependImage = Boolean(image && !rawGallery.some(item => {
    const src = typeof item === 'string' ? item : String((item && item.src) || '').trim();
    return src === image;
  }));
  const gallery = rawGallery
    .map((item, galleryIndex) => normalizeGalleryItem(item, galleryIndex + (shouldPrependImage ? 1 : 0), name))
    .filter(item => item.src);

  if (shouldPrependImage) {
    const preset = imagePresetForIndex(0);
    gallery.unshift({
      group: preset.group,
      src: image,
      label: preset.label,
      alt: imageAlt(name, preset.label),
      rotate: false
    });
  }

  return {
    slug,
    name,
    category,
    categoryLabel: CATEGORY_LABELS[category],
    status,
    sortOrder: Number.isFinite(Number(source.sortOrder)) ? Number(source.sortOrder) : (index + 1) * 10,
    image,
    gallery,
    tags: toStringArray(source.tags),
    specs: toStringArray(source.specs),
    intro: String(source.intro || '').trim(),
    applications: toStringArray(source.applications),
    customOptions: toStringArray(source.customOptions),
    createdAt: source.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function sortProducts(products) {
  return [...products].sort((a, b) => {
    const order = Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
    if (order !== 0) return order;
    return String(a.name || '').localeCompare(String(b.name || ''));
  });
}

function normalizeProducts(products) {
  return sortProducts((Array.isArray(products) ? products : []).map(normalizeProduct));
}

function publicProducts(products) {
  return normalizeProducts(products).filter(product => product.status === 'published');
}

async function blobToText(blobResult) {
  if (!blobResult) return '';
  if (typeof blobResult.text === 'function') return blobResult.text();
  if (blobResult.stream) return streamToText(blobResult.stream);
  if (blobResult.body) return streamToText(blobResult.body);
  return '';
}

async function streamToText(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function readLocalProductsDocument() {
  const raw = await fs.readFile(LOCAL_PRODUCTS_PATH, 'utf8');
  return JSON.parse(raw);
}

async function readBlobProductsDocument() {
  const { get } = await import('@vercel/blob');
  const blob = await get(PRODUCTS_BLOB_PATH, blobClientOptions());
  const raw = await blobToText(blob);
  return JSON.parse(raw);
}

async function loadProductsDocument() {
  if (hasBlobStorage()) {
    try {
      return await readBlobProductsDocument();
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`Blob products read failed, using local fallback: ${error.message}`);
      }
    }
  }
  return readLocalProductsDocument();
}

async function saveProductsDocument(products) {
  const document = {
    version: 1,
    updatedAt: new Date().toISOString(),
    products: normalizeProducts(products)
  };
  const json = `${JSON.stringify(document, null, 2)}\n`;

  if (hasBlobStorage()) {
    const { put } = await import('@vercel/blob');
    await put(PRODUCTS_BLOB_PATH, json, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
      cacheControlMaxAge: 60,
      ...blobClientOptions()
    });
    return document;
  }

  if (isVercelRuntime()) {
    const error = new Error('A connected Vercel Blob store is required to save CMS data on Vercel.');
    error.statusCode = 500;
    throw error;
  }

  await fs.writeFile(LOCAL_PRODUCTS_PATH, json, 'utf8');
  return document;
}

async function loadProducts({ includeDrafts = false } = {}) {
  const document = await loadProductsDocument();
  const products = normalizeProducts(document.products || document);
  return includeDrafts ? products : publicProducts(products);
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  return header.split(';').reduce((cookies, part) => {
    const index = part.indexOf('=');
    if (index === -1) return cookies;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    cookies[key] = decodeURIComponent(value);
    return cookies;
  }, {});
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD || (isVercelRuntime() ? '' : 'local-dev-session-secret');
}

function signValue(value) {
  const secret = getSessionSecret();
  if (!secret) return '';
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function getSessionMaxAgeSeconds() {
  const value = Number(process.env.ADMIN_SESSION_MAX_AGE_SECONDS || DEFAULT_SESSION_MAX_AGE_SECONDS);
  if (!Number.isFinite(value) || value <= 0) return DEFAULT_SESSION_MAX_AGE_SECONDS;
  return Math.floor(value);
}

function timingSafeEqualString(a, b) {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function createSessionCookie() {
  const maxAgeSeconds = getSessionMaxAgeSeconds();
  const payload = Buffer.from(JSON.stringify({
    exp: Date.now() + maxAgeSeconds * 1000,
    nonce: crypto.randomBytes(12).toString('base64url')
  })).toString('base64url');
  const signature = signValue(payload);
  const secure = isVercelRuntime() || process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${SESSION_COOKIE}=${encodeURIComponent(`${payload}.${signature}`)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`;
}

function clearSessionCookie() {
  const secure = isVercelRuntime() || process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure}`;
}

function readSession(req) {
  const value = parseCookies(req)[SESSION_COOKIE];
  if (!value) return null;
  const [payload, signature] = value.split('.');
  if (!payload || !signature || !timingSafeEqualString(signature, signValue(payload))) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!session.exp || Date.now() > session.exp) return null;
    return session;
  } catch {
    return null;
  }
}

function isAuthenticated(req) {
  return Boolean(readSession(req));
}

function requireAdmin(req, res) {
  if (isAuthenticated(req)) return true;
  sendError(res, 401, 'Unauthorized');
  return false;
}

function hashPassword(password) {
  const salt = process.env.ADMIN_PASSWORD_SALT || '';
  return crypto.createHash('sha256').update(`${salt}${password}`).digest('hex');
}

function isAdminPasswordConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD_HASH || !isVercelRuntime());
}

function verifyAdminPassword(password) {
  if (!isAdminPasswordConfigured()) return false;
  if (process.env.ADMIN_PASSWORD_HASH) {
    return timingSafeEqualString(hashPassword(password), process.env.ADMIN_PASSWORD_HASH);
  }
  if (process.env.ADMIN_PASSWORD) {
    return timingSafeEqualString(password, process.env.ADMIN_PASSWORD);
  }
  return !isVercelRuntime() && password === 'admin';
}

async function saveUploadedWebp({ slug, fileName, dataUrl }) {
  const safeSlug = slugify(slug || 'product') || 'product';
  const safeName = slugify(fileName || 'image') || 'image';
  const match = String(dataUrl || '').match(/^data:image\/webp;base64,(.+)$/);
  if (!match) {
    const error = new Error('Only processed WebP uploads are accepted.');
    error.statusCode = 400;
    throw error;
  }

  const buffer = Buffer.from(match[1], 'base64');
  if (!buffer.length) {
    const error = new Error('Uploaded image is empty.');
    error.statusCode = 400;
    throw error;
  }
  if (buffer.length > 1.5 * 1024 * 1024) {
    const error = new Error('Processed image must be 1.5MB or smaller.');
    error.statusCode = 413;
    throw error;
  }

  const pathname = `products/${safeSlug}/${Date.now()}-${safeName}.webp`;

  if (hasBlobStorage()) {
    const { put } = await import('@vercel/blob');
    const blob = await put(pathname, buffer, {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'image/webp',
      cacheControlMaxAge: 31536000,
      ...blobClientOptions()
    });
    return {
      url: blob.url,
      pathname: blob.pathname || pathname,
      size: buffer.length
    };
  }

  if (isVercelRuntime()) {
    const error = new Error('A connected Vercel Blob store is required to upload images on Vercel.');
    error.statusCode = 500;
    throw error;
  }

  const publicPath = path.join('uploads', pathname);
  const absolutePath = path.join(LOCAL_UPLOAD_ROOT, pathname);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, buffer);
  return {
    url: `/${publicPath.replace(/\\/g, '/')}`,
    pathname: publicPath.replace(/\\/g, '/'),
    size: buffer.length
  };
}

module.exports = {
  CATEGORY_LABELS,
  clearSessionCookie,
  createSessionCookie,
  isAdminPasswordConfigured,
  isAuthenticated,
  loadProducts,
  normalizeProduct,
  normalizeProducts,
  parseJsonBody,
  publicProducts,
  requireAdmin,
  saveProductsDocument,
  saveUploadedWebp,
  sendError,
  sendJson,
  slugify,
  verifyAdminPassword
};
