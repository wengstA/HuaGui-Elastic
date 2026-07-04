const CATEGORY_LABELS = {
  mens: "Men's Underwear Elastics",
  womens: "Women's Underwear Elastics",
  lingerie: 'Bra & Lingerie Elastics',
  activewear: 'Activewear Elastics'
};

const TAG_LABELS = {
  printed: 'Printed',
  jacquard: 'Jacquard',
  plain: 'Plain',
  'fold-over': 'Fold Over',
  picot: 'Picot',
  'silicone-grip': 'Silicone Grip',
  'bra-strap': 'Bra Strap',
  waistband: 'Waistband',
  lingerie: 'Lingerie',
  activewear: 'Activewear'
};

const IMAGE_LABEL_PRESETS = [
  { label: 'Front & Back', group: 'Product Display' },
  { label: 'Front', group: 'Product Display' },
  { label: 'Back', group: 'Product Display' },
  { label: 'Colors', group: 'Product Display' },
  { label: 'Application', group: 'Application' }
];

const PLACEHOLDER_IMAGE = 'assets/images/product-elastic-sample-board.webp';
const LOCAL_ADMIN_URL = 'http://127.0.0.1:3000/admin';
const ADMIN_SCRIPT_VERSION = 'admin-cms-20260704-rotate-bake2';

if (window.location.protocol === 'file:') {
  window.location.replace(LOCAL_ADMIN_URL);
}

const state = {
  products: [],
  selectedSlug: null,
  dirty: false,
  search: '',
  statusFilter: 'all',
  rotatingImageIndex: null
};

const els = {};
const debugLines = [];

function appendDebug(message, data) {
  const time = new Date().toLocaleTimeString();
  const suffix = data === undefined ? '' : ` ${safeDebugString(data)}`;
  debugLines.push(`[${time}] ${message}${suffix}`);
  if (debugLines.length > 80) debugLines.shift();
  renderDebug();
}

function safeDebugString(data) {
  try {
    return typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  } catch (error) {
    return String(data);
  }
}

function renderDebug() {
  if (!els.debugOutput) return;
  els.debugOutput.textContent = [
    `script=${ADMIN_SCRIPT_VERSION}`,
    `url=${window.location.href}`,
    `protocol=${window.location.protocol}`,
    `origin=${window.location.origin}`,
    `userAgent=${navigator.userAgent}`,
    '',
    ...debugLines
  ].join('\n');
}

window.addEventListener('error', event => {
  appendDebug('window.error', {
    message: event.message,
    source: event.filename,
    line: event.lineno,
    column: event.colno
  });
});

window.addEventListener('unhandledrejection', event => {
  appendDebug('unhandledrejection', {
    reason: event.reason && event.reason.message ? event.reason.message : String(event.reason)
  });
});

function $(selector, root = document) {
  return root.querySelector(selector);
}

function $all(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
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

function linesToArray(value) {
  return String(value || '')
    .split(/\r?\n/)
    .map(item => item.trim())
    .filter(Boolean);
}

function arrayToLines(value) {
  return Array.isArray(value) ? value.join('\n') : '';
}

function statusLabel(product) {
  return product && product.status === 'published' ? 'Published' : 'Draft';
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

function renderImageLabelOptions(currentLabel, index) {
  const selected = imagePresetForLabel(currentLabel, index).label;
  return IMAGE_LABEL_PRESETS.map(preset => `
    <option value="${escapeHtml(preset.label)}" ${preset.label === selected ? 'selected' : ''}>${escapeHtml(preset.label)}</option>
  `).join('');
}

async function apiJson(url, options = {}) {
  appendDebug('request', {
    method: options.method || 'GET',
    url
  });
  const response = await fetch(url, {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options,
    body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body
  });
  const raw = await response.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = {
      raw: raw.slice(0, 500)
    };
  }
  appendDebug('response', {
    url,
    status: response.status,
    ok: response.ok,
    body: data
  });
  if (!response.ok || data.ok === false) {
    throw new Error(data.error || `Request failed: ${response.status}`);
  }
  return data;
}

function cacheElements() {
  els.login = $('[data-login]');
  els.workspace = $('[data-workspace]');
  els.liveState = $('[data-live-state]');
  els.sessionNote = $('[data-session-note]');
  els.loginForm = $('[data-login-form]');
  els.loginMessage = $('[data-login-message]');
  els.logout = $('[data-logout]');
  els.newProduct = $('[data-new-product]');
  els.search = $('[data-search]');
  els.statusFilter = $('[data-status-filter]');
  els.productList = $('[data-product-list]');
  els.form = $('[data-product-form]');
  els.editorStatus = $('[data-editor-status]');
  els.editorTitle = $('[data-editor-title]');
  els.saveDraft = $('[data-save-draft]');
  els.publish = $('[data-publish]');
  els.unpublish = $('[data-unpublish]');
  els.delete = $('[data-delete]');
  els.upload = $('[data-upload]');
  els.uploadStatus = $('[data-upload-status]');
  els.galleryEditor = $('[data-gallery-editor]');
  els.sideStatus = $('[data-side-status]');
  els.sideUpdated = $('[data-side-updated]');
  els.sideImage = $('[data-side-image]');
  els.sideName = $('[data-side-name]');
  els.sideCategory = $('[data-side-category]');
  els.sideTags = $('[data-side-tags]');
  els.saveMessage = $('[data-save-message]');
  els.debugOutput = $('[data-debug-output]');
  els.debugCopy = $('[data-debug-copy]');
  els.debugCheck = $('[data-debug-check]');
  els.debugToggle = $('[data-debug-toggle]');
  renderDebug();
}

function field(name) {
  return els.form.elements[name];
}

function showLogin(message = '') {
  appendDebug('showLogin', message);
  els.login.hidden = false;
  els.workspace.hidden = true;
  els.loginMessage.textContent = message;
  updateSessionNote('');
  appendDomState('after showLogin');
}

function showWorkspace(source = 'password') {
  appendDebug('showWorkspace', { source });
  els.login.hidden = true;
  els.workspace.hidden = false;
  updateSessionNote(source === 'saved-session' ? 'Signed in from saved session' : 'Signed in with password');
  updateLiveState('Opening admin workspace...', 'warning');
  appendDomState('after showWorkspace');
}

function showAdminReady(message) {
  let banner = document.querySelector('[data-admin-ready]');
  if (!banner) {
    banner = document.createElement('div');
    banner.className = 'admin-ready-banner';
    banner.setAttribute('data-admin-ready', '');
    document.body.appendChild(banner);
  }
  banner.textContent = message;
  window.setTimeout(() => {
    banner.classList.add('is-soft');
  }, 2000);
}

function updateLiveState(message, tone = 'neutral') {
  if (!els.liveState) return;
  els.liveState.textContent = message;
  els.liveState.dataset.tone = tone;
}

function updateSessionNote(message) {
  if (!els.sessionNote) return;
  els.sessionNote.textContent = message;
}

function appendDomState(label) {
  appendDebug(label, {
    loginHidden: Boolean(els.login && els.login.hidden),
    workspaceHidden: Boolean(els.workspace && els.workspace.hidden),
    loginDisplay: els.login ? getComputedStyle(els.login).display : '',
    workspaceDisplay: els.workspace ? getComputedStyle(els.workspace).display : '',
    renderedProductItems: document.querySelectorAll('.admin-product-item').length
  });
}

function showSaveMessage(message, tone = 'neutral') {
  els.saveMessage.textContent = message;
  els.saveMessage.dataset.tone = tone;
}

function markDirty() {
  state.dirty = true;
  showSaveMessage('Unsaved changes', 'warning');
  renderSidePreview();
}

function currentProduct() {
  return state.products.find(product => product.slug === state.selectedSlug) || null;
}

function uniqueSlug(base) {
  const root = slugify(base) || 'new-product';
  let slug = root;
  let index = 2;
  while (state.products.some(product => product.slug === slug)) {
    slug = `${root}-${index}`;
    index += 1;
  }
  return slug;
}

function normalizeProduct(product, index = 0) {
  const source = product && typeof product === 'object' ? product : {};
  const category = CATEGORY_LABELS[source.category] ? source.category : 'mens';
  const name = String(source.name || 'Untitled Product').trim();
  const image = String(source.image || '').trim();
  const gallery = Array.isArray(source.gallery) ? source.gallery.map((item, galleryIndex) => {
    const preset = imagePresetForLabel(typeof item === 'string' ? '' : (item && (item.label || item.thumbLabel)), galleryIndex);
    if (typeof item === 'string') {
      return {
        group: preset.group,
        src: item,
        label: preset.label,
        alt: imageAlt(name, preset.label),
        rotate: false
      };
    }
    return {
      group: preset.group,
      src: String(item.src || '').trim(),
      label: preset.label,
      alt: imageAlt(name, preset.label),
      rotate: Boolean(item.rotate)
    };
  }).filter(item => item.src) : [];

  return {
    slug: slugify(source.slug || name || `product-${index + 1}`) || `product-${index + 1}`,
    name,
    category,
    categoryLabel: CATEGORY_LABELS[category],
    status: source.status === 'published' ? 'published' : 'draft',
    sortOrder: Number.isFinite(Number(source.sortOrder)) ? Number(source.sortOrder) : (index + 1) * 10,
    image,
    gallery,
    tags: Array.isArray(source.tags) ? source.tags : [],
    specs: Array.isArray(source.specs) ? source.specs : [],
    intro: String(source.intro || '').trim(),
    applications: Array.isArray(source.applications) ? source.applications : [],
    customOptions: Array.isArray(source.customOptions) ? source.customOptions : [],
    createdAt: source.createdAt || new Date().toISOString(),
    updatedAt: source.updatedAt || ''
  };
}

function sortProducts() {
  state.products.sort((a, b) => {
    const order = Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
    if (order !== 0) return order;
    return a.name.localeCompare(b.name);
  });
}

async function loadProducts() {
  const data = await apiJson('/api/admin/products');
  state.products = (data.products || []).map(normalizeProduct);
  sortProducts();
  state.selectedSlug = state.products[0] ? state.products[0].slug : null;
  state.dirty = false;
  renderAll();
  appendDebug('products loaded', {
    count: state.products.length,
    first: state.products[0] ? state.products[0].slug : null
  });
  updateLiveState(`Admin workspace is ready. ${state.products.length} products loaded.`, 'success');
  appendDomState('after products loaded');
  showAdminReady(`Admin loaded: ${state.products.length} products`);
  collapseDebug();
}

function renderAll() {
  renderProductList();
  renderEditor();
  renderSidePreview();
}

function renderProductList() {
  const query = state.search.toLowerCase();
  const products = state.products.filter(product => {
    const statusMatch = state.statusFilter === 'all' || product.status === state.statusFilter;
    const queryMatch = !query || `${product.name} ${product.slug} ${product.categoryLabel}`.toLowerCase().includes(query);
    return statusMatch && queryMatch;
  });

  if (!products.length) {
    els.productList.innerHTML = '<p class="admin-empty">No products</p>';
    return;
  }

  els.productList.innerHTML = products.map(product => `
    <button class="admin-product-item ${product.slug === state.selectedSlug ? 'active' : ''}" type="button" data-select="${escapeHtml(product.slug)}">
      <img src="${escapeHtml(product.image || PLACEHOLDER_IMAGE)}" alt="">
      <span>
        <strong>${escapeHtml(product.name)}</strong>
        <small>${escapeHtml(product.categoryLabel)}</small>
      </span>
      <em class="admin-status-pill ${product.status === 'published' ? 'published' : 'draft'}">${statusLabel(product)}</em>
    </button>
  `).join('');
}

function renderEditor() {
  const product = currentProduct();
  if (!product) {
    els.form.reset();
    els.editorTitle.textContent = 'No Product Selected';
    els.editorStatus.textContent = 'Draft';
    els.galleryEditor.innerHTML = '<p class="admin-empty">Create a product to start editing.</p>';
    els.unpublish.disabled = true;
    els.delete.disabled = true;
    return;
  }

  els.editorTitle.textContent = product.name || 'New Product';
  els.editorStatus.textContent = statusLabel(product);
  field('name').value = product.name;
  field('slug').value = product.slug;
  field('category').value = product.category;
  field('sortOrder').value = product.sortOrder || '';
  field('intro').value = product.intro || '';
  field('specs').value = arrayToLines(product.specs);
  field('applications').value = arrayToLines(product.applications);
  field('customOptions').value = arrayToLines(product.customOptions);
  $all('[data-tags] input[type="checkbox"]').forEach(input => {
    input.checked = product.tags.includes(input.value);
  });
  els.unpublish.disabled = product.status !== 'published';
  els.delete.disabled = false;
  renderGalleryEditor();
}

function renderSidePreview() {
  const product = collectProduct({ silent: true }) || currentProduct();
  if (!product) return;
  els.sideStatus.textContent = statusLabel(product);
  els.sideUpdated.textContent = product.updatedAt ? `Updated ${new Date(product.updatedAt).toLocaleString()}` : 'Not saved';
  els.sideImage.src = product.image || PLACEHOLDER_IMAGE;
  els.sideImage.alt = product.name || '';
  els.sideName.textContent = product.name || 'New Product';
  els.sideCategory.textContent = CATEGORY_LABELS[product.category] || CATEGORY_LABELS.mens;
  els.sideTags.innerHTML = (product.tags || []).map(tag => `<span>${escapeHtml(TAG_LABELS[tag] || tag)}</span>`).join('');
}

function renderGalleryEditor() {
  const product = currentProduct();
  if (!product || !product.gallery.length) {
    els.galleryEditor.innerHTML = '<p class="admin-empty">No images yet</p>';
    return;
  }

  els.galleryEditor.innerHTML = product.gallery.map((image, index) => `
    <div class="admin-gallery-row" data-gallery-index="${index}">
      <div class="admin-gallery-thumb">
        <img class="${image.rotate ? 'is-rotated' : ''}" src="${escapeHtml(image.src)}" alt="">
      </div>
      <label class="admin-gallery-label-field">
        <span>Label / Alt</span>
        <select data-gallery-field="label">
          ${renderImageLabelOptions(image.label, index)}
        </select>
        <small>Alt: ${escapeHtml(imageAlt(product.name, imagePresetForLabel(image.label, index).label))}</small>
      </label>
      <div class="admin-gallery-actions">
        <button type="button" data-set-main="${index}">Main</button>
        <button type="button" data-rotate-image="${index}" ${state.rotatingImageIndex === index ? 'disabled' : ''}>${state.rotatingImageIndex === index ? 'Rotating...' : 'Rotate 90°'}</button>
        <button type="button" data-remove-image="${index}">Remove</button>
      </div>
    </div>
  `).join('');
}

function collectProduct(options = {}) {
  const existing = currentProduct();
  if (!existing) return null;
  const name = field('name').value.trim();
  const slug = slugify(field('slug').value || name);
  const tags = $all('[data-tags] input[type="checkbox"]:checked').map(input => input.value);
  const image = existing.image || (existing.gallery[0] && existing.gallery[0].src) || '';

  const product = normalizeProduct({
    ...existing,
    name,
    slug,
    category: field('category').value,
    status: options.status || existing.status || 'draft',
    sortOrder: Number(field('sortOrder').value || existing.sortOrder || 0),
    image,
    tags,
    specs: linesToArray(field('specs').value),
    intro: field('intro').value.trim(),
    applications: linesToArray(field('applications').value),
    customOptions: linesToArray(field('customOptions').value)
  });

  if (!options.silent && !product.slug) {
    throw new Error('Slug is required.');
  }
  return product;
}

function replaceCurrentProduct(product) {
  const index = state.products.findIndex(item => item.slug === state.selectedSlug);
  if (index === -1) return;
  state.products[index] = product;
  state.selectedSlug = product.slug;
  sortProducts();
}

function validateForSave(product) {
  const duplicate = state.products.some(item => item.slug === product.slug && item.slug !== state.selectedSlug);
  if (duplicate) throw new Error(`Slug already exists: ${product.slug}`);
  if (product.status === 'published') {
    if (!product.name || product.name === 'Untitled Product') throw new Error('Product name is required before publishing.');
    if (!product.image) throw new Error('Main image is required before publishing.');
  }
}

async function saveProducts(status) {
  try {
    const product = collectProduct({ status });
    validateForSave(product);
    replaceCurrentProduct(product);

    const data = await apiJson('/api/admin/products', {
      method: 'PUT',
      body: {
        products: state.products
      }
    });

    state.products = (data.products || []).map(normalizeProduct);
    sortProducts();
    if (!state.products.some(item => item.slug === state.selectedSlug)) {
      state.selectedSlug = product.slug;
    }
    state.dirty = false;
    showSaveMessage(status === 'published' ? 'Published' : 'Saved as draft', 'success');
    renderAll();
  } catch (error) {
    showSaveMessage(error.message, 'error');
  }
}

function createDraftProduct() {
  if (state.dirty && !confirm('Discard unsaved changes?')) return;
  const nextOrder = state.products.reduce((max, product) => Math.max(max, Number(product.sortOrder || 0)), 0) + 10;
  const product = normalizeProduct({
    slug: uniqueSlug('new-product'),
    name: 'New Product',
    status: 'draft',
    category: 'mens',
    sortOrder: nextOrder,
    tags: ['printed'],
    specs: [],
    applications: [],
    customOptions: [],
    gallery: []
  }, state.products.length);
  state.products.push(product);
  state.selectedSlug = product.slug;
  state.dirty = true;
  renderAll();
  showSaveMessage('New draft created', 'warning');
}

function selectProduct(slug) {
  if (slug === state.selectedSlug) return;
  if (state.dirty && !confirm('Discard unsaved changes?')) return;
  state.selectedSlug = slug;
  state.dirty = false;
  showSaveMessage('');
  renderAll();
}

async function publishProduct() {
  try {
    const product = collectProduct({ status: 'published' });
    validateForSave(product);
    await saveProducts('published');
  } catch (error) {
    showSaveMessage(error.message, 'error');
  }
}

async function unpublishProduct() {
  const product = currentProduct();
  if (!product || product.status !== 'published') return;
  if (!confirm(`Unpublish ${product.name}?`)) return;
  await saveProducts('draft');
}

async function deleteProduct() {
  const product = currentProduct();
  if (!product) return;
  if (!confirm(`Delete ${product.name}?`)) return;

  state.products = state.products.filter(item => item.slug !== product.slug);
  state.selectedSlug = state.products[0] ? state.products[0].slug : null;

  try {
    const data = await apiJson('/api/admin/products', {
      method: 'PUT',
      body: {
        products: state.products
      }
    });
    state.products = (data.products || []).map(normalizeProduct);
    sortProducts();
    state.selectedSlug = state.products[0] ? state.products[0].slug : null;
    state.dirty = false;
    renderAll();
    showSaveMessage('Deleted', 'success');
  } catch (error) {
    showSaveMessage(error.message, 'error');
  }
}

function updateGalleryField(target) {
  const row = target.closest('[data-gallery-index]');
  const product = currentProduct();
  if (!row || !product) return;
  const index = Number(row.dataset.galleryIndex);
  const galleryField = target.dataset.galleryField;
  if (!product.gallery[index] || !galleryField) return;
  if (galleryField === 'label') {
    const preset = imagePresetForLabel(target.value, index);
    product.gallery[index].group = preset.group;
    product.gallery[index].label = preset.label;
    product.gallery[index].alt = imageAlt(field('name').value || product.name, preset.label);
  } else {
    product.gallery[index][galleryField] = target.type === 'checkbox' ? target.checked : target.value.trim();
  }
  markDirty();
  if (galleryField === 'label') renderGalleryEditor();
}

function setMainImage(index) {
  const product = currentProduct();
  if (!product || !product.gallery[index]) return;
  product.image = product.gallery[index].src;
  markDirty();
  renderAll();
}

function removeImage(index) {
  const product = currentProduct();
  if (!product || !product.gallery[index]) return;
  const [removed] = product.gallery.splice(index, 1);
  if (product.image === removed.src) {
    product.image = product.gallery[0] ? product.gallery[0].src : '';
  }
  markDirty();
  renderAll();
}

function loadImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unable to load this image for rotation.'));
    image.src = url;
  });
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Unable to read ${file.name}`));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas, quality) {
  return new Promise(resolve => canvas.toBlob(resolve, 'image/webp', quality));
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Unable to prepare upload.'));
    reader.readAsDataURL(blob);
  });
}

function sleep(ms) {
  return new Promise(resolve => window.setTimeout(resolve, ms));
}

function preloadDisplayImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Rotated image is not ready for preview yet.'));
    image.src = url;
  });
}

async function waitForImageUrl(url) {
  let lastError;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      await preloadDisplayImage(url);
      return;
    } catch (error) {
      lastError = error;
      await sleep(180 + attempt * 140);
    }
  }
  throw lastError || new Error('Rotated image is not ready for preview yet.');
}

async function canvasToProcessedImage(canvas) {
  let quality = 0.82;
  let blob = await canvasToBlob(canvas, quality);
  while (blob && blob.size > 1.2 * 1024 * 1024 && quality > 0.58) {
    quality -= 0.08;
    blob = await canvasToBlob(canvas, quality);
  }
  if (!blob) throw new Error('Unable to convert image to WebP.');

  return {
    dataUrl: await blobToDataUrl(blob),
    size: blob.size,
    width: canvas.width,
    height: canvas.height
  };
}

async function processImage(file) {
  if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(file.type)) {
    throw new Error(`${file.name} is not a supported image.`);
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error(`${file.name} is larger than 15MB.`);
  }

  const image = await loadImage(file);
  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0, width, height);

  return canvasToProcessedImage(canvas);
}

async function rotateGalleryImage(index) {
  if (state.rotatingImageIndex !== null) return;
  const product = currentProduct();
  const image = product && product.gallery[index];
  if (!product || !image) return;
  const selectedSlug = state.selectedSlug;

  try {
    state.rotatingImageIndex = index;
    renderGalleryEditor();
    showSaveMessage('Rotating image...', 'warning');
    const source = await loadImageFromUrl(image.src);
    const canvas = document.createElement('canvas');
    canvas.width = source.naturalHeight;
    canvas.height = source.naturalWidth;
    const context = canvas.getContext('2d');
    context.translate(0, canvas.height);
    context.rotate(-Math.PI / 2);
    context.drawImage(source, 0, 0);

    const processed = await canvasToProcessedImage(canvas);
    const result = await apiJson('/api/admin/upload', {
      method: 'POST',
      body: {
        slug: field('slug').value || product.slug,
        fileName: `${image.label || 'product-image'}-rotated`,
        dataUrl: processed.dataUrl
      }
    });
    await waitForImageUrl(result.upload.url);

    if (state.selectedSlug !== selectedSlug) return;

    const previousSrc = image.src;
    image.src = result.upload.url;
    image.rotate = false;
    image.alt = imageAlt(field('name').value || product.name, image.label);
    if (product.image === previousSrc) {
      product.image = image.src;
    }
    markDirty();
    renderAll();
    showSaveMessage('Image rotated. Save Draft or Publish to keep this product update.', 'success');
  } catch (error) {
    showSaveMessage(error.message, 'error');
  } finally {
    state.rotatingImageIndex = null;
    renderGalleryEditor();
  }
}

async function uploadImages(files) {
  const product = currentProduct();
  if (!product || !files.length) return;
  els.uploadStatus.textContent = `Preparing ${files.length} image${files.length > 1 ? 's' : ''}...`;

  for (const file of files) {
    try {
      const processed = await processImage(file);
      els.uploadStatus.textContent = `Uploading ${file.name}...`;
      const result = await apiJson('/api/admin/upload', {
        method: 'POST',
        body: {
          slug: field('slug').value || product.slug,
          fileName: file.name.replace(/\.[^.]+$/, ''),
          dataUrl: processed.dataUrl
        }
      });
      const preset = imagePresetForIndex(product.gallery.length);
      const image = {
        group: preset.group,
        src: result.upload.url,
        label: preset.label,
        alt: imageAlt(field('name').value || product.name, preset.label),
        rotate: false
      };
      product.gallery.push(image);
      if (!product.image) product.image = image.src;
      markDirty();
    } catch (error) {
      showSaveMessage(error.message, 'error');
    }
  }

  els.upload.value = '';
  els.uploadStatus.textContent = '';
  renderAll();
}

function bindEvents() {
  if (els.debugCopy) {
    els.debugCopy.addEventListener('click', async () => {
      const text = els.debugOutput ? els.debugOutput.textContent : debugLines.join('\n');
      try {
        await navigator.clipboard.writeText(text);
        appendDebug('debug copied');
      } catch (error) {
        appendDebug('debug copy failed', error.message);
      }
    });
  }

  if (els.debugCheck) {
    els.debugCheck.addEventListener('click', () => {
      runDebugCheck();
    });
  }

  if (els.debugToggle) {
    els.debugToggle.addEventListener('click', () => {
      const panel = $('[data-debug-panel]');
      if (!panel) return;
      panel.classList.toggle('is-collapsed');
      els.debugToggle.textContent = panel.classList.contains('is-collapsed') ? 'Show' : 'Hide';
    });
  }

  els.loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    els.loginMessage.textContent = '';
    appendDebug('login submit', {
      passwordLength: els.loginForm.elements.password.value.length
    });
    try {
      await apiJson('/api/admin/login', {
        method: 'POST',
        body: {
          password: els.loginForm.elements.password.value
        }
      });
      showWorkspace('password');
      await loadProducts();
    } catch (error) {
      appendDebug('login failed', error.message);
      showLogin(error.message);
    }
  });

  els.logout.addEventListener('click', async () => {
    await apiJson('/api/admin/logout', { method: 'POST' }).catch(() => {});
    showLogin();
  });

  els.newProduct.addEventListener('click', createDraftProduct);
  els.saveDraft.addEventListener('click', () => saveProducts('draft'));
  els.publish.addEventListener('click', publishProduct);
  els.unpublish.addEventListener('click', unpublishProduct);
  els.delete.addEventListener('click', deleteProduct);

  els.search.addEventListener('input', () => {
    state.search = els.search.value;
    renderProductList();
  });
  els.statusFilter.addEventListener('change', () => {
    state.statusFilter = els.statusFilter.value;
    renderProductList();
  });

  els.productList.addEventListener('click', event => {
    const button = event.target.closest('[data-select]');
    if (button) selectProduct(button.dataset.select);
  });

  els.form.addEventListener('input', event => {
    const selectedSlug = state.selectedSlug || '';
    if (event.target.name === 'name' && (!field('slug').value || selectedSlug.startsWith('new-product'))) {
      field('slug').value = slugify(event.target.value);
    }
    markDirty();
  });

  els.galleryEditor.addEventListener('input', event => {
    if (event.target.dataset.galleryField) updateGalleryField(event.target);
  });
  els.galleryEditor.addEventListener('change', event => {
    if (event.target.dataset.galleryField) updateGalleryField(event.target);
  });
  els.galleryEditor.addEventListener('click', event => {
    const setMain = event.target.closest('[data-set-main]');
    const rotate = event.target.closest('[data-rotate-image]');
    const remove = event.target.closest('[data-remove-image]');
    if (setMain) setMainImage(Number(setMain.dataset.setMain));
    if (rotate) rotateGalleryImage(Number(rotate.dataset.rotateImage));
    if (remove) removeImage(Number(remove.dataset.removeImage));
  });

  els.upload.addEventListener('change', () => uploadImages(Array.from(els.upload.files || [])));

  window.addEventListener('beforeunload', event => {
    if (!state.dirty) return;
    event.preventDefault();
    event.returnValue = '';
  });
}

function collapseDebug() {
  const panel = $('[data-debug-panel]');
  if (!panel || !els.debugToggle) return;
  panel.classList.add('is-collapsed');
  els.debugToggle.textContent = 'Show';
}

async function runDebugCheck() {
  appendDebug('manual api check started');
  try {
    const session = await apiJson('/api/admin/session');
    appendDebug('manual session ok', session);
  } catch (error) {
    appendDebug('manual session failed', error.message);
  }

  try {
    const productsResponse = await fetch('/api/products', {
      credentials: 'same-origin'
    });
    const productsText = await productsResponse.text();
    appendDebug('manual public products', {
      status: productsResponse.status,
      ok: productsResponse.ok,
      sample: productsText.slice(0, 300)
    });
  } catch (error) {
    appendDebug('manual public products failed', error.message);
  }
}

async function boot() {
  cacheElements();
  appendDebug('boot started');
  bindEvents();
  try {
    const session = await apiJson('/api/admin/session');
    appendDebug('session result', session);
    if (session.authenticated) {
      showWorkspace('saved-session');
      await loadProducts();
    } else {
      showLogin();
    }
  } catch (error) {
    appendDebug('boot failed', error.message);
    showLogin('Admin API is unavailable.');
  }
}

document.addEventListener('DOMContentLoaded', boot);
