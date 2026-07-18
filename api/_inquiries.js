const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');

const INQUIRY_STATUSES = ['new', 'read', 'resolved'];
const INQUIRIES_BLOB_PREFIX = String(process.env.INQUIRIES_BLOB_PREFIX || 'inquiries')
  .trim()
  .replace(/^\/+|\/+$/g, '') || 'inquiries';
const LOCAL_INQUIRIES_PATH = path.join(
  process.cwd(),
  'huagui_company_site',
  'data',
  'inquiries.json'
);

function isVercelRuntime() {
  return Boolean(process.env.VERCEL);
}

function canUseLocalStorage() {
  return !isVercelRuntime() || process.env.VERCEL_ENV === 'development';
}

function hasInquiryBlobStorage() {
  return Boolean(
    process.env.INQUIRIES_BLOB_READ_WRITE_TOKEN ||
    process.env.INQUIRIES_BLOB_STORE_ID
  );
}

function inquiryBlobClientOptions() {
  return {
    ...(process.env.INQUIRIES_BLOB_READ_WRITE_TOKEN
      ? { token: process.env.INQUIRIES_BLOB_READ_WRITE_TOKEN }
      : {}),
    ...(process.env.INQUIRIES_BLOB_STORE_ID
      ? { storeId: process.env.INQUIRIES_BLOB_STORE_ID }
      : {})
  };
}

function storageMode() {
  if (hasInquiryBlobStorage()) return 'private-blob';
  if (canUseLocalStorage()) return 'local-file';
  return 'unavailable';
}

function storageUnavailableError() {
  const error = new Error('Private inquiry storage is not configured.');
  error.statusCode = 503;
  return error;
}

function cleanText(value, maxLength) {
  return String(value || '')
    .replace(/\u0000/g, '')
    .trim()
    .slice(0, maxLength);
}

function validateInquiryInput(input) {
  const inquiry = {
    name: cleanText(input.name, 120),
    email: cleanText(input.email, 254).toLowerCase(),
    phone: cleanText(input.phone, 80),
    product: cleanText(input.product, 40),
    productName: cleanText(input.productName, 160),
    itemNo: cleanText(input.itemNo, 100),
    quantity: cleanText(input.quantity, 120),
    message: cleanText(input.message, 5000),
    sourceUrl: cleanText(input.sourceUrl, 500)
  };

  if (!inquiry.name || !inquiry.email || !inquiry.message) {
    const error = new Error('Name, email, and message are required.');
    error.statusCode = 400;
    throw error;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.email)) {
    const error = new Error('Please enter a valid email address.');
    error.statusCode = 400;
    throw error;
  }
  return inquiry;
}

function createInquiryId(now = new Date()) {
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `HG-${date}-${suffix}`;
}

function inquiryPathForId(id) {
  const match = String(id || '').match(/^HG-(\d{4})(\d{2})(\d{2})-[A-F0-9]{8}$/);
  if (!match) {
    const error = new Error('Invalid inquiry ID.');
    error.statusCode = 400;
    throw error;
  }
  return `${INQUIRIES_BLOB_PREFIX}/${match[1]}/${match[2]}/${id}.json`;
}

function normalizeStoredInquiry(value) {
  const source = value && typeof value === 'object' ? value : {};
  const status = INQUIRY_STATUSES.includes(source.status) ? source.status : 'new';
  return {
    id: cleanText(source.id, 40),
    status,
    name: cleanText(source.name, 120),
    email: cleanText(source.email, 254),
    phone: cleanText(source.phone, 80),
    product: cleanText(source.product, 40),
    productName: cleanText(source.productName, 160),
    itemNo: cleanText(source.itemNo, 100),
    quantity: cleanText(source.quantity, 120),
    message: cleanText(source.message, 5000),
    sourceUrl: cleanText(source.sourceUrl, 500),
    createdAt: source.createdAt || new Date().toISOString(),
    updatedAt: source.updatedAt || source.createdAt || new Date().toISOString(),
    resolvedAt: source.resolvedAt || null
  };
}

function sortInquiries(inquiries) {
  return [...inquiries].sort((a, b) => {
    const dateOrder = String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
    if (dateOrder !== 0) return dateOrder;
    return String(b.id || '').localeCompare(String(a.id || ''));
  });
}

async function streamToText(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function blobToText(blobResult) {
  if (!blobResult) return '';
  if (typeof blobResult.text === 'function') return blobResult.text();
  if (blobResult.stream) return streamToText(blobResult.stream);
  if (blobResult.body) return streamToText(blobResult.body);
  return '';
}

async function readLocalDocument() {
  try {
    const raw = await fs.readFile(LOCAL_INQUIRIES_PATH, 'utf8');
    const document = JSON.parse(raw);
    const inquiries = Array.isArray(document) ? document : document.inquiries;
    return {
      version: 1,
      updatedAt: document.updatedAt || null,
      inquiries: (Array.isArray(inquiries) ? inquiries : []).map(normalizeStoredInquiry)
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { version: 1, updatedAt: null, inquiries: [] };
    }
    throw error;
  }
}

async function writeLocalDocument(inquiries) {
  const document = {
    version: 1,
    updatedAt: new Date().toISOString(),
    inquiries: sortInquiries(inquiries).map(normalizeStoredInquiry)
  };
  await fs.mkdir(path.dirname(LOCAL_INQUIRIES_PATH), { recursive: true });
  await fs.writeFile(LOCAL_INQUIRIES_PATH, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
  return document;
}

async function readPrivateInquiry(pathname) {
  const { get } = await import('@vercel/blob');
  const blob = await get(pathname, {
    access: 'private',
    useCache: false,
    ...inquiryBlobClientOptions()
  });
  if (!blob || blob.statusCode !== 200) return null;
  const raw = await blobToText(blob);
  return raw ? normalizeStoredInquiry(JSON.parse(raw)) : null;
}

async function writePrivateInquiry(inquiry) {
  const { put } = await import('@vercel/blob');
  const pathname = inquiryPathForId(inquiry.id);
  await put(pathname, `${JSON.stringify(normalizeStoredInquiry(inquiry), null, 2)}\n`, {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    ...inquiryBlobClientOptions()
  });
  return inquiry;
}

async function listPrivateInquiries() {
  const { list } = await import('@vercel/blob');
  const blobs = [];
  let cursor;
  do {
    const page = await list({
      prefix: `${INQUIRIES_BLOB_PREFIX}/`,
      limit: 1000,
      ...(cursor ? { cursor } : {}),
      ...inquiryBlobClientOptions()
    });
    blobs.push(...page.blobs.filter(blob => blob.pathname.endsWith('.json')));
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  const recentBlobs = blobs
    .sort((a, b) => b.pathname.localeCompare(a.pathname))
    .slice(0, 500);
  const inquiries = [];
  for (let index = 0; index < recentBlobs.length; index += 20) {
    const batch = recentBlobs.slice(index, index + 20);
    const results = await Promise.all(batch.map(blob => readPrivateInquiry(blob.pathname)));
    inquiries.push(...results.filter(Boolean));
  }
  return sortInquiries(inquiries);
}

async function createInquiry(input) {
  const validated = validateInquiryInput(input);
  const now = new Date();
  const inquiry = normalizeStoredInquiry({
    ...validated,
    id: createInquiryId(now),
    status: 'new',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    resolvedAt: null
  });

  if (hasInquiryBlobStorage()) {
    await writePrivateInquiry(inquiry);
    return inquiry;
  }
  if (!canUseLocalStorage()) throw storageUnavailableError();

  const document = await readLocalDocument();
  document.inquiries.push(inquiry);
  await writeLocalDocument(document.inquiries);
  return inquiry;
}

async function listInquiries() {
  if (hasInquiryBlobStorage()) return listPrivateInquiries();
  if (!canUseLocalStorage()) throw storageUnavailableError();
  const document = await readLocalDocument();
  return sortInquiries(document.inquiries);
}

async function updateInquiryStatus(id, status) {
  if (!INQUIRY_STATUSES.includes(status)) {
    const error = new Error('Invalid inquiry status.');
    error.statusCode = 400;
    throw error;
  }

  if (hasInquiryBlobStorage()) {
    const pathname = inquiryPathForId(id);
    const inquiry = await readPrivateInquiry(pathname);
    if (!inquiry) {
      const error = new Error('Inquiry not found.');
      error.statusCode = 404;
      throw error;
    }
    const updated = normalizeStoredInquiry({
      ...inquiry,
      status,
      updatedAt: new Date().toISOString(),
      resolvedAt: status === 'resolved' ? new Date().toISOString() : null
    });
    await writePrivateInquiry(updated);
    return updated;
  }
  if (!canUseLocalStorage()) throw storageUnavailableError();

  const document = await readLocalDocument();
  const index = document.inquiries.findIndex(inquiry => inquiry.id === id);
  if (index === -1) {
    const error = new Error('Inquiry not found.');
    error.statusCode = 404;
    throw error;
  }
  const updated = normalizeStoredInquiry({
    ...document.inquiries[index],
    status,
    updatedAt: new Date().toISOString(),
    resolvedAt: status === 'resolved' ? new Date().toISOString() : null
  });
  document.inquiries[index] = updated;
  await writeLocalDocument(document.inquiries);
  return updated;
}

module.exports = {
  INQUIRY_STATUSES,
  createInquiry,
  listInquiries,
  storageMode,
  updateInquiryStatus,
  validateInquiryInput
};
