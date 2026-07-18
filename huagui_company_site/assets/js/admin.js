const CATEGORY_LABELS = {
  mens: "Men's Underwear Elastics",
  womens: "Women's Underwear Elastics",
  lingerie: 'Bra & Lingerie Elastics',
  activewear: 'Activewear Elastics'
};

const TAG_LABELS = {
  printed: 'Printed',
  jacquard: 'Jacquard',
  debossed: 'Debossed',
  embossed: 'Embossed',
  lurex: 'Lurex',
  plain: 'Plain',
  'fold-over': 'Fold Over',
  picot: 'Picot',
  'silicone-grip': 'Silicone Grip',
  'bra-strap': 'Bra Strap',
  waistband: 'Waistband',
  lingerie: 'Lingerie',
  activewear: 'Activewear'
};

const DEFAULT_FEATURES = [
  'Stable stretch and recovery',
  'Vivid, wash-resistant printing',
  'Soft skin-contact comfort',
  'Custom widths, logos, and colors',
  'Bulk-ready quality consistency'
];

const LEGACY_SPEC_LABELS = ['Width', 'Material', 'Printing', 'Handfeel'];

const IMAGE_LABEL_PRESETS = [
  { label: 'Front & Back', group: 'Product Display' },
  { label: 'Front', group: 'Product Display' },
  { label: 'Back', group: 'Product Display' },
  { label: 'Colors', group: 'Product Display' },
  { label: 'Application', group: 'Application' }
];

const PLACEHOLDER_IMAGE = 'assets/images/product-elastic-sample-board.webp';
const LOCAL_ADMIN_URL = 'http://127.0.0.1:3000/admin';
const ADMIN_SCRIPT_VERSION = 'admin-cms-20260707-structured-table-editor';

if (window.location.protocol === 'file:') {
  window.location.replace(LOCAL_ADMIN_URL);
}

const state = {
  products: [],
  selectedSlug: null,
  dirty: false,
  search: '',
  statusFilter: 'all',
  rotatingImageIndex: null,
  toastTimer: null
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

function normalizeStringList(value, fallback = []) {
  if (Array.isArray(value)) {
    return value.map(item => String(item || '').trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return linesToArray(value);
  }
  return [...fallback];
}

function normalizeSpecRow(item, index = 0) {
  if (item && typeof item === 'object') {
    const label = String(item.label || item.name || item.key || item.title || '').trim();
    const value = String(item.value || item.text || item.detail || item.content || '').trim();
    if (!label && !value) return null;
    return {
      label: label || (LEGACY_SPEC_LABELS[index] || `Specification ${index + 1}`),
      value
    };
  }

  const text = String(item || '').trim();
  if (!text) return null;
  const match = text.match(/^([^:：]{1,40})[:：]\s*(.+)$/);
  if (match) {
    return {
      label: match[1].trim(),
      value: match[2].trim()
    };
  }
  return {
    label: LEGACY_SPEC_LABELS[index] || `Specification ${index + 1}`,
    value: text
  };
}

function normalizeSpecRows(value) {
  const rows = Array.isArray(value)
    ? value
    : (typeof value === 'string' ? value.split(/\r?\n/) : []);
  return rows
    .map((item, index) => normalizeSpecRow(item, index))
    .filter(Boolean);
}

function hasStructuredSpecs(value) {
  return Array.isArray(value) && value.some(item => item && typeof item === 'object');
}

function productSpecRows(source) {
  const rows = normalizeSpecRows(source.specs);
  if (hasStructuredSpecs(source.specs) || !rows.length) return rows;

  const labels = new Set(rows.map(row => row.label.toLowerCase()));
  const applications = normalizeStringList(source.applications);
  const customOptions = normalizeStringList(source.customOptions);
  const legacyDetailRows = [
    { label: 'Color', value: 'Pantone or fabric color matching available' },
    { label: 'Elasticity', value: 'Custom stretch tension and recovery control' },
    { label: 'Usage', value: applications.join(', ') },
    { label: 'Packing', value: customOptions[3] || 'Roll length and carton packing' }
  ];

  legacyDetailRows.forEach(row => {
    if (!row.value || labels.has(row.label.toLowerCase())) return;
    rows.push(row);
    labels.add(row.label.toLowerCase());
  });
  return rows;
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

function productDetailUrl(product, fresh = false) {
  const params = new URLSearchParams({
    slug: product.slug
  });
  if (fresh) params.set('cmsFresh', Date.now().toString());
  return `product-detail.html?${params.toString()}`;
}

function hideFloatingBanner() {
  const banner = document.querySelector('[data-admin-toast]');
  if (!banner) return;
  banner.classList.remove('is-visible');
  window.setTimeout(() => {
    banner.hidden = true;
  }, 180);
}

function showFloatingBanner({ title, message, actionHref, actionLabel, tone = 'success', duration = 9000 }) {
  let banner = document.querySelector('[data-admin-toast]');
  if (!banner) {
    banner = document.createElement('div');
    banner.className = 'admin-toast';
    banner.setAttribute('data-admin-toast', '');
    banner.setAttribute('role', 'status');
    banner.setAttribute('aria-live', 'polite');
    document.body.appendChild(banner);
  }

  if (state.toastTimer) {
    window.clearTimeout(state.toastTimer);
    state.toastTimer = null;
  }

  banner.dataset.tone = tone;
  banner.innerHTML = `
    <div class="admin-toast-copy">
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(message)}</span>
    </div>
    ${actionHref ? `<a class="admin-toast-action" href="${escapeHtml(actionHref)}" target="_blank" rel="noreferrer">${escapeHtml(actionLabel || 'View')}</a>` : ''}
    <button class="admin-toast-close" type="button" data-admin-toast-close aria-label="Dismiss">&times;</button>
  `;
  banner.hidden = false;
  window.requestAnimationFrame(() => {
    banner.classList.add('is-visible');
  });

  const close = banner.querySelector('[data-admin-toast-close]');
  if (close) close.addEventListener('click', hideFloatingBanner, { once: true });
  if (duration > 0) {
    state.toastTimer = window.setTimeout(hideFloatingBanner, duration);
  }
}

function gallerySignature(product) {
  return (product.gallery || [])
    .map(item => (typeof item === 'string' ? item : item && item.src) || '')
    .filter(Boolean)
    .join('|');
}

function publicProductMatches(savedProduct, publicProduct) {
  if (!savedProduct || !publicProduct) return false;
  if (publicProduct.status && publicProduct.status !== 'published') return false;
  if (publicProduct.slug !== savedProduct.slug) return false;
  if (publicProduct.name !== savedProduct.name) return false;
  if (String(publicProduct.image || '') !== String(savedProduct.image || '')) return false;
  return gallerySignature(publicProduct) === gallerySignature(savedProduct);
}

async function waitForPublishedProduct(product) {
  let lastSeen = null;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      const data = await apiJson(`/api/products?cmsFresh=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      lastSeen = (data.products || []).find(item => item.slug === product.slug) || null;
      if (publicProductMatches(product, lastSeen)) return lastSeen;
    } catch (error) {
      appendDebug('publish public check failed', error.message);
    }
    await sleep(300 + attempt * 220);
  }
  return lastSeen && lastSeen.slug === product.slug ? lastSeen : null;
}

function showPublishBanner(product, verified) {
  showFloatingBanner({
    title: verified ? 'Product published' : 'Product saved',
    message: verified
      ? `${product.name} is live on the public product detail page.`
      : `${product.name} was saved. If the old image is still visible, refresh the detail page once.`,
    actionHref: productDetailUrl(product, true),
    actionLabel: 'View Product Details',
    tone: verified ? 'success' : 'warning'
  });
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
  els.duplicateProduct = $('[data-duplicate-product]');
  els.upload = $('[data-upload]');
  els.uploadStatus = $('[data-upload-status]');
  els.galleryEditor = $('[data-gallery-editor]');
  els.featureEditor = $('[data-feature-editor]');
  els.specEditor = $('[data-spec-editor]');
  els.addFeature = $('[data-add-feature]');
  els.addSpec = $('[data-add-spec]');
  els.sideStatus = $('[data-side-status]');
  els.sideUpdated = $('[data-side-updated]');
  els.sideImage = $('[data-side-image]');
  els.sideName = $('[data-side-name]');
  els.sideCategory = $('[data-side-category]');
  els.sideTags = $('[data-side-tags]');
  els.saveMessage = $('[data-save-message]');
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

function uniqueSlugForCurrentProduct(base) {
  const root = slugify(base) || 'new-product';
  let slug = root;
  let index = 2;
  while (state.products.some(product => product.slug === slug && product.slug !== state.selectedSlug)) {
    slug = `${root}-${index}`;
    index += 1;
  }
  return slug;
}

function isDuplicateSlugValue(slug) {
  return state.products.some(product => product.slug === slug && product.slug !== state.selectedSlug);
}

function isAutoGeneratedSlugForProduct(product) {
  return Boolean(product && product.slug === uniqueSlugForCurrentProduct(product.name));
}

function shouldAutoUpdateSlugFromName() {
  const product = currentProduct();
  const currentSlug = slugify(field('slug').value);
  if (els.form.dataset.slugMode === 'auto') return true;
  if (!currentSlug) return true;
  if (isDuplicateSlugValue(currentSlug)) return true;
  return Boolean(product && currentSlug === uniqueSlugForCurrentProduct(product.name));
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
    features: normalizeStringList(source.features, DEFAULT_FEATURES),
    specs: productSpecRows(source),
    intro: String(source.intro || '').trim(),
    applications: normalizeStringList(source.applications),
    customOptions: normalizeStringList(source.customOptions),
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
    if (els.featureEditor) els.featureEditor.innerHTML = '<p class="admin-empty">Create a product to start editing.</p>';
    if (els.specEditor) els.specEditor.innerHTML = '<p class="admin-empty">Create a product to start editing.</p>';
    els.unpublish.disabled = true;
    els.delete.disabled = true;
    return;
  }

  els.editorTitle.textContent = product.name || 'New Product';
  els.editorStatus.textContent = statusLabel(product);
  field('name').value = product.name;
  field('slug').value = product.slug;
  els.form.dataset.slugMode = isAutoGeneratedSlugForProduct(product) ? 'auto' : 'manual';
  field('category').value = product.category;
  field('sortOrder').value = product.sortOrder || '';
  field('intro').value = product.intro || '';
  field('applications').value = arrayToLines(product.applications);
  field('customOptions').value = arrayToLines(product.customOptions);
  renderFeatureEditor(product.features);
  renderSpecEditor(product.specs);
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

function renderFeatureEditor(features = []) {
  if (!els.featureEditor) return;
  const rows = features.length ? features : [''];
  els.featureEditor.innerHTML = rows.map((feature, index) => `
    <div class="admin-feature-row" data-feature-row>
      <input type="text" value="${escapeHtml(feature)}" data-feature-input aria-label="Feature ${index + 1}" placeholder="Soft and smooth hand feel">
      <button class="admin-row-remove" type="button" data-remove-feature="${index}" ${rows.length === 1 ? 'disabled' : ''} aria-label="Remove feature">&times;</button>
    </div>
  `).join('');
}

function renderSpecEditor(specs = []) {
  if (!els.specEditor) return;
  const rows = specs.length ? specs : [{ label: '', value: '' }];
  els.specEditor.innerHTML = `
    <div class="admin-spec-row admin-spec-head" aria-hidden="true">
      <span>Label</span>
      <span>Value</span>
      <span></span>
    </div>
    ${rows.map((spec, index) => `
      <div class="admin-spec-row" data-spec-row>
        <input type="text" value="${escapeHtml(spec.label)}" data-spec-label aria-label="Specification label ${index + 1}" placeholder="Material">
        <input type="text" value="${escapeHtml(spec.value)}" data-spec-value aria-label="Specification value ${index + 1}" placeholder="Polyester / Nylon + Spandex">
        <button class="admin-row-remove" type="button" data-remove-spec="${index}" ${rows.length === 1 ? 'disabled' : ''} aria-label="Remove specification row">&times;</button>
      </div>
    `).join('')}
  `;
}

function collectFeaturesFromEditor() {
  if (!els.featureEditor) return [];
  return $all('[data-feature-input]', els.featureEditor)
    .map(input => input.value.trim())
    .filter(Boolean);
}

function collectSpecsFromEditor() {
  if (!els.specEditor) return [];
  return $all('[data-spec-row]', els.specEditor)
    .map((row, index) => {
      const label = $('[data-spec-label]', row);
      const value = $('[data-spec-value]', row);
      const labelText = label ? label.value.trim() : '';
      const valueText = value ? value.value.trim() : '';
      if (!labelText && !valueText) return null;
      return {
        label: labelText || (LEGACY_SPEC_LABELS[index] || `Specification ${index + 1}`),
        value: valueText
      };
    })
    .filter(Boolean);
}

function addFeatureRow() {
  const rows = collectFeaturesFromEditor();
  rows.push('');
  renderFeatureEditor(rows);
  const inputs = $all('[data-feature-input]', els.featureEditor);
  const lastInput = inputs[inputs.length - 1];
  if (lastInput) lastInput.focus();
  markDirty();
}

function addSpecRow() {
  const rows = collectSpecsFromEditor();
  rows.push({ label: '', value: '' });
  renderSpecEditor(rows);
  const inputs = $all('[data-spec-label]', els.specEditor);
  const lastInput = inputs[inputs.length - 1];
  if (lastInput) lastInput.focus();
  markDirty();
}

function removeFeatureRow(index) {
  const rows = collectFeaturesFromEditor();
  rows.splice(index, 1);
  renderFeatureEditor(rows);
  markDirty();
}

function removeSpecRow(index) {
  const rows = collectSpecsFromEditor();
  rows.splice(index, 1);
  renderSpecEditor(rows);
  markDirty();
}

function renderGalleryEditor() {
  const product = currentProduct();
  if (!product || !product.gallery.length) {
    els.galleryEditor.innerHTML = '<p class="admin-empty">No images yet</p>';
    return;
  }

  const mainIndex = product.gallery.findIndex(image => image.src === product.image);
  els.galleryEditor.innerHTML = product.gallery.map((image, index) => {
    const isMain = index === mainIndex;
    return `
    <div class="admin-gallery-row" data-gallery-index="${index}">
      <div class="admin-gallery-thumb ${isMain ? 'is-main' : ''}">
        ${isMain ? '<span class="admin-main-badge">Main</span>' : ''}
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
        <button type="button" data-set-main="${index}" ${isMain ? 'disabled' : ''}>${isMain ? 'Main' : 'Set Main'}</button>
        <button type="button" data-rotate-image="${index}" ${state.rotatingImageIndex === index ? 'disabled' : ''}>${state.rotatingImageIndex === index ? 'Rotating...' : 'Rotate 90°'}</button>
        <button type="button" data-remove-image="${index}">Remove</button>
      </div>
    </div>
  `;
  }).join('');
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
    features: collectFeaturesFromEditor(),
    specs: collectSpecsFromEditor(),
    intro: field('intro').value.trim(),
    applications: linesToArray(field('applications').value),
    customOptions: linesToArray(field('customOptions').value)
  });

  if (!options.silent && !product.slug) {
    throw new Error('URL name is required.');
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

function syncCurrentFormProduct(options = {}) {
  const product = collectProduct({
    silent: true,
    ...options
  });
  if (!product) return null;
  replaceCurrentProduct(product);
  return product;
}

function validateForSave(product) {
  const duplicate = state.products.some(item => item.slug === product.slug && item.slug !== state.selectedSlug);
  if (duplicate) throw new Error(`This URL name is already used: ${product.slug}`);
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
    state.selectedSlug = state.products.some(item => item.slug === product.slug)
      ? product.slug
      : (state.products[0] ? state.products[0].slug : null);
    state.dirty = false;
    const savedProduct = currentProduct() || product;
    showSaveMessage(status === 'published' ? 'Published' : 'Saved as draft', 'success');
    updateLiveState(status === 'published'
      ? `${savedProduct.name} was saved as published. Checking the public catalog...`
      : `${savedProduct.name} was saved as a draft.`, 'success');
    renderAll();
    return savedProduct;
  } catch (error) {
    showSaveMessage(error.message, 'error');
    updateLiveState(error.message, 'error');
    return null;
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
    features: [...DEFAULT_FEATURES],
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

function cloneGalleryItems(gallery) {
  return (gallery || []).map(item => (typeof item === 'string' ? item : {
    ...item
  }));
}

function uniqueProductName(baseName) {
  let name = baseName;
  let index = 2;
  while (state.products.some(product => product.name === name)) {
    name = `${baseName} ${index}`;
    index += 1;
  }
  return name;
}

function duplicateCurrentProduct() {
  const source = collectProduct({ silent: true, status: 'draft' }) || currentProduct();
  if (!source) return;

  const nextOrder = state.products.reduce((max, product) => Math.max(max, Number(product.sortOrder || 0)), 0) + 10;
  const copyName = uniqueProductName(`${source.name || 'Product'} Copy`);
  const now = new Date().toISOString();
  const product = normalizeProduct({
    ...source,
    slug: uniqueSlug(`${source.slug || source.name || 'product'}-copy`),
    name: copyName,
    status: 'draft',
    sortOrder: nextOrder,
    gallery: cloneGalleryItems(source.gallery),
    image: source.image,
    createdAt: now,
    updatedAt: ''
  }, state.products.length);

  state.products.push(product);
  state.selectedSlug = product.slug;
  state.dirty = true;
  sortProducts();
  renderAll();
  showSaveMessage('Template copy created. Save Draft or Publish to keep it.', 'warning');
  updateLiveState(`${product.name} was created from the selected product template.`, 'warning');
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
  const savedProduct = await saveProducts('published');
  if (!savedProduct) return;

  const publicProduct = await waitForPublishedProduct(savedProduct);
  if (publicProduct && publicProductMatches(savedProduct, publicProduct)) {
    showSaveMessage('Published and live on site', 'success');
    updateLiveState(`${savedProduct.name} is live on the public site.`, 'success');
    showPublishBanner(savedProduct, true);
    return;
  }

  showSaveMessage('Published. Public page may need one refresh.', 'warning');
  updateLiveState(`${savedProduct.name} was published, but the public API check still saw older data.`, 'warning');
  showPublishBanner(savedProduct, false);
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
  const product = syncCurrentFormProduct();
  if (!product || !product.gallery[index]) return;
  product.image = product.gallery[index].src;
  markDirty();
  renderAll();
}

function removeImage(index) {
  const product = syncCurrentFormProduct();
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
  const product = syncCurrentFormProduct();
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
  const product = syncCurrentFormProduct();
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
  if (els.duplicateProduct) {
    els.duplicateProduct.addEventListener('click', duplicateCurrentProduct);
  }
  if (els.addFeature) {
    els.addFeature.addEventListener('click', addFeatureRow);
  }
  if (els.addSpec) {
    els.addSpec.addEventListener('click', addSpecRow);
  }
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
    if (event.target.name === 'slug') {
      els.form.dataset.slugMode = 'manual';
    }
    if (event.target.name === 'name' && shouldAutoUpdateSlugFromName()) {
      field('slug').value = uniqueSlugForCurrentProduct(event.target.value);
      els.form.dataset.slugMode = 'auto';
    }
    markDirty();
  });

  els.form.addEventListener('click', event => {
    const removeFeature = event.target.closest('[data-remove-feature]');
    const removeSpec = event.target.closest('[data-remove-spec]');
    if (removeFeature) removeFeatureRow(Number(removeFeature.dataset.removeFeature));
    if (removeSpec) removeSpecRow(Number(removeSpec.dataset.removeSpec));
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
