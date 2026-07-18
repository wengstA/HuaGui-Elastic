// ========== Global Contact ==========
const CONTACT_INFO = {
  email: 'evenzheng@vip.163.com',
  address: 'No. 1 Jintian Road, Xiashan, Chaonan District, Shantou, Guangdong, China',
  tel: '+86 0754 8776 3266',
  people: [
    {
      name: 'Mr. Zheng',
      mobileWechat: '+86 13822883266',
      whatsapp: '+86 13531183266'
    },
    {
      name: 'Mr. Zhou',
      mobileWechat: '+86 13433396966'
    }
  ]
};

window.HUAGUI_CONTACT_INFO = CONTACT_INFO;

function getContactCardsHtml() {
  const contactRows = CONTACT_INFO.people.map(person => `
    <p>${person.name}<br>Mobile / WeChat: ${person.mobileWechat}${person.whatsapp ? `<br>WhatsApp: ${person.whatsapp}` : ''}</p>
  `).join('');

  return `
    <div class="contact-info-card">
      <div class="contact-info-icon">@</div>
      <div>
        <h4>Email</h4>
        <p>${CONTACT_INFO.email}</p>
      </div>
    </div>
    <div class="contact-info-card">
      <div class="contact-info-icon">T</div>
      <div>
        <h4>Tel</h4>
        <p>${CONTACT_INFO.tel}</p>
      </div>
    </div>
    <div class="contact-info-card">
      <div class="contact-info-icon">W</div>
      <div>
        <h4>Mobile / WeChat / WhatsApp</h4>
        ${contactRows}
      </div>
    </div>
    <div class="contact-info-card">
      <div class="contact-info-icon">CN</div>
      <div>
        <h4>Address</h4>
        <p>${CONTACT_INFO.address}</p>
      </div>
    </div>
  `;
}

function renderGlobalContactInfo() {
  const contactInfo = document.querySelector('[data-contact-info]');
  if (contactInfo) {
    contactInfo.innerHTML = getContactCardsHtml();
  }
}

// ========== Header/Footer Injection ==========
function injectFavicons() {
  const icons = [
    { rel: 'icon', type: 'image/png', href: 'assets/images/huagui-logo.png' },
    { rel: 'apple-touch-icon', href: 'assets/images/huagui-logo.png' }
  ];
  icons.forEach(icon => {
    if (document.head.querySelector(`link[rel="${icon.rel}"]`)) return;
    const link = document.createElement('link');
    Object.entries(icon).forEach(([key, value]) => link.setAttribute(key, value));
    document.head.appendChild(link);
  });
  if (!document.head.querySelector('meta[name="theme-color"]')) {
    const theme = document.createElement('meta');
    theme.name = 'theme-color';
    theme.content = '#880830';
    document.head.appendChild(theme);
  }
}

function injectHeader() {
  const path = window.location.pathname;
  const isActive = (page) => path.endsWith(page) || (page === 'index.html' && path.endsWith('/')) ? ' class="active"' : '';
  const header = document.createElement('header');
  header.innerHTML = `
    <nav class="navbar" id="navbar">
      <div class="container">
        <a href="index.html" class="navbar-logo" aria-label="Huagui Elastic home">
          <img src="assets/images/huagui-logo.png" alt="Huagui Elastic logo">
          <span>HUAGUI ELASTIC</span>
        </a>
        <ul class="navbar-links" id="navLinks">
          <li><a href="index.html"${isActive('index.html')}>HOME</a></li>
          <li><a href="products.html"${isActive('products.html')}>PRODUCTS</a></li>
          <li><a href="service.html"${isActive('service.html')}>CUSTOM SOLUTIONS</a></li>
          <li><a href="factory.html"${isActive('factory.html')}>FACTORY</a></li>
          <li><a href="exhibitions.html"${isActive('exhibitions.html')}>EXHIBITIONS</a></li>
          <li><a href="about.html"${isActive('about.html')}>ABOUT US</a></li>
          <li><a href="contact.html"${isActive('contact.html')}>CONTACT</a></li>
        </ul>
        <button class="navbar-toggle" id="navToggle" aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  `;
  document.getElementById('app').prepend(header);
}

function injectFooter() {
  const footer = document.createElement('footer');
  footer.innerHTML = `
    <div class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-about">
            <div class="footer-logo">
              <img src="assets/images/huagui-logo.png" alt="Huagui Elastic logo">
              <span>HUAGUI ELASTIC</span>
            </div>
            <p>Custom elastic webbing manufacturer for underwear, lingerie, activewear, and apparel brands.</p>
            <p>Printed, jacquard, plain, fold over, picot, silicone grip, and bra strap elastic solutions.</p>
          </div>
          <div class="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="index.html">Home</a></li>
              <li><a href="products.html">Products</a></li>
              <li><a href="service.html">Custom Solutions</a></li>
              <li><a href="factory.html">Factory</a></li>
              <li><a href="contact.html">Contact</a></li>
            </ul>
          </div>
          <div class="footer-links">
            <h4>Products</h4>
            <ul>
              <li><a href="products.html?cat=mens">Men's Underwear Elastics</a></li>
              <li><a href="products.html?cat=womens">Women's Underwear Elastics</a></li>
              <li><a href="products.html?cat=lingerie">Bra & Lingerie Elastics</a></li>
              <li><a href="products.html?cat=activewear">Activewear Elastics</a></li>
            </ul>
          </div>
          <div class="footer-links">
            <h4>Contact</h4>
            <ul>
              <li>${CONTACT_INFO.email}</li>
              <li>Tel: ${CONTACT_INFO.tel}</li>
              <li>${CONTACT_INFO.people.map(person => `${person.name}: ${person.mobileWechat}`).join('</li><li>')}</li>
              <li>${CONTACT_INFO.address}</li>
              <li>Sample and bulk order support</li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 Huagui Elastic. Custom elastic webbing for global apparel brands.</p>
        </div>
      </div>
    </div>
  `;
  document.getElementById('app').appendChild(footer);
}

// ========== Hero Slider ==========
function initSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dots .dot');
  if (!slides.length) return;
  let current = 0;
  let interval;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = index;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(parseInt(dot.dataset.index, 10));
      resetInterval();
    });
  });

  function next() { goTo((current + 1) % slides.length); }
  function resetInterval() { clearInterval(interval); interval = setInterval(next, 5000); }
  resetInterval();

  const slider = document.getElementById('heroSlider');
  if (slider) {
    slider.addEventListener('mouseenter', () => clearInterval(interval));
    slider.addEventListener('mouseleave', resetInterval);
  }
}

// ========== Mobile Menu ==========
function initMobileMenu() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => links.classList.toggle('active'));
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar')) links.classList.remove('active');
  });
}

function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  });
}

// ========== Product Data ==========
const CATEGORY_LABELS = {
  mens: "Men's Underwear Elastics",
  womens: "Women's Underwear Elastics",
  lingerie: 'Bra & Lingerie Elastics',
  activewear: 'Activewear Elastics'
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

const PRODUCT_PREVIEW_KEY = 'huagui_product_preview';

const DEFAULT_PRODUCTS = [
  {
    slug: 'printed-waistbands',
    name: 'Printed Waistbands',
    category: 'mens',
    categoryLabel: "Men's Underwear Elastics",
    image: 'assets/images/printed-waistband-front-back.webp',
    gallery: [
      {
        group: 'Product',
        src: 'assets/images/printed-waistband-front-back.webp',
        label: 'Front & Back',
        alt: 'Printed waistband front and back view'
      },
      {
        group: 'Product',
        src: 'assets/images/printed-waistband-front.webp',
        label: 'Front',
        alt: 'Printed waistband front view'
      },
      {
        group: 'Product',
        src: 'assets/images/printed-waistband-back.webp',
        label: 'Back',
        alt: 'Printed waistband back view'
      },
      {
        group: 'Applied',
        src: 'assets/images/printed-waistband-application.webp',
        label: 'Application',
        alt: 'Printed waistband application on underwear'
      }
    ],
    tags: ['printed', 'waistband'],
    specs: ['25-45mm width', 'Nylon/Polyester/Spandex', 'Logo print', 'Soft handfeel'],
    intro: 'Custom printed elastic waistbands for men\'s underwear brands, designed for clean logo presentation, soft skin contact, and stable recovery in repeat production.',
    applications: ['Men\'s boxer briefs', 'Briefs', 'Trunks', 'Loungewear waistbands'],
    customOptions: ['Logo artwork and repeat layout', 'Pantone or fabric color matching', 'Width, thickness, and stretch tension', 'Roll length and carton packing']
  },
  {
    slug: 'jacquard-logo-waistbands',
    name: 'Jacquard Logo Waistbands',
    category: 'mens',
    categoryLabel: "Men's Underwear Elastics",
    image: 'assets/images/product-jacquard-waistbands-main.webp',
    gallery: ['assets/images/product-jacquard-waistbands-main.webp', 'assets/images/material-yarn-lines.webp'],
    tags: ['jacquard', 'waistband'],
    specs: ['30-50mm width', 'Woven logo', 'High stretch recovery', 'Color matched'],
    intro: 'Woven logo waistbands for underwear brands that need durable branding and a premium textile texture.',
    applications: ['Men\'s underwear', 'Premium briefs', 'Brand logo waistbands'],
    customOptions: ['Jacquard logo design', 'Yarn color matching', 'Elastic tension control', 'Bulk roll packing']
  },
  {
    slug: 'womens-printed-waistbands',
    name: 'Women\'s Printed Waistbands',
    category: 'womens',
    categoryLabel: "Women's Underwear Elastics",
    image: 'assets/images/product-plain-elastic-main.webp',
    gallery: ['assets/images/product-plain-elastic-main.webp', 'assets/images/product-elastic-sample-board.webp'],
    tags: ['printed', 'waistband'],
    specs: ['18-38mm width', 'Smooth surface', 'Custom color', 'Skin-friendly finish'],
    intro: 'Soft printed waistbands for women\'s underwear, with flexible color and logo options for branded collections.',
    applications: ['Women\'s briefs', 'Seamless underwear', 'Loungewear'],
    customOptions: ['Logo print', 'Soft surface finish', 'Color matching', 'Width customization']
  },
  {
    slug: 'plain-underwear-elastic',
    name: 'Plain Underwear Elastic',
    category: 'womens',
    categoryLabel: "Women's Underwear Elastics",
    image: 'assets/images/product-plain-elastic-main.webp',
    gallery: ['assets/images/product-plain-elastic-main.webp', 'assets/images/material-yarn-lines.webp'],
    tags: ['plain'],
    specs: ['Multiple widths', 'Dyed to match', 'Stable tension', 'Bulk rolls'],
    intro: 'Plain elastic webbing for underwear and apparel factories needing reliable stretch, color consistency, and bulk roll supply.',
    applications: ['Underwear trims', 'Waistbands', 'Garment binding'],
    customOptions: ['Width selection', 'Dyed-to-match color', 'Material blend', 'Roll packing']
  },
  {
    slug: 'fold-over-elastic',
    name: 'Fold Over Elastic',
    category: 'lingerie',
    categoryLabel: 'Bra & Lingerie Elastics',
    image: 'assets/images/product-fold-over-elastic-main.webp',
    gallery: ['assets/images/product-fold-over-elastic-main.webp', 'assets/images/product-elastic-sample-board.webp'],
    tags: ['fold-over', 'lingerie'],
    specs: ['10-25mm width', 'Soft fold line', 'Lingerie trim', 'Custom shade'],
    intro: 'Fold over elastic for lingerie and underwear edges where a clean folded finish and soft touch are important.',
    applications: ['Lingerie edges', 'Brief openings', 'Soft apparel binding'],
    customOptions: ['Width and fold line', 'Color matching', 'Matte or glossy finish', 'Softness adjustment']
  },
  {
    slug: 'picot-lingerie-elastic',
    name: 'Picot Lingerie Elastic',
    category: 'lingerie',
    categoryLabel: 'Bra & Lingerie Elastics',
    image: 'assets/images/product-picot-elastic-main.webp',
    gallery: ['assets/images/product-picot-elastic-main.webp', 'assets/images/product-bra-strap-elastic-main.webp'],
    tags: ['picot', 'lingerie'],
    specs: ['Decorative edge', 'Soft stretch', 'Bra and briefs', 'OEM colors'],
    intro: 'Decorative picot elastic for lingerie trims, balancing visual detail with comfortable stretch.',
    applications: ['Bra edges', 'Lingerie trims', 'Brief leg openings'],
    customOptions: ['Picot edge style', 'Color matching', 'Width customization', 'Elastic recovery']
  },
  {
    slug: 'silicone-grip-elastic',
    name: 'Silicone Grip Elastic',
    category: 'activewear',
    categoryLabel: 'Activewear Elastics',
    image: 'assets/images/product-tooth-elastic-main.webp',
    gallery: ['assets/images/product-tooth-elastic-main.webp', 'assets/images/factory-weaving-production.webp'],
    tags: ['silicone-grip'],
    specs: ['Anti-slip silicone', 'Sportswear ready', 'Strong recovery', 'Custom lines'],
    intro: 'Silicone grip elastic for garments that need anti-slip performance and dependable stretch recovery.',
    applications: ['Activewear', 'Sports bras', 'Leg openings', 'Performance garments'],
    customOptions: ['Silicone line pattern', 'Grip strength', 'Width and tension', 'Base elastic color']
  },
  {
    slug: 'bra-strap-elastic',
    name: 'Bra Strap Elastic',
    category: 'lingerie',
    categoryLabel: 'Bra & Lingerie Elastics',
    image: 'assets/images/product-bra-strap-elastic-main.webp',
    gallery: ['assets/images/product-bra-strap-elastic-main.webp', 'assets/images/product-elastic-sample-board.webp'],
    tags: ['bra-strap'],
    specs: ['8-20mm width', 'Adjustable strap use', 'Gloss or matte', 'Soft touch'],
    intro: 'Bra strap elastic with smooth handfeel and stable recovery for lingerie and intimate apparel.',
    applications: ['Bra straps', 'Camisoles', 'Lingerie shoulder straps'],
    customOptions: ['Width selection', 'Gloss or matte surface', 'Color matching', 'Softness and stretch']
  },
  {
    slug: 'activewear-binding-elastic',
    name: 'Activewear Binding Elastic',
    category: 'activewear',
    categoryLabel: 'Activewear Elastics',
    image: 'assets/images/product-knitted-elastic-main.webp',
    gallery: ['assets/images/product-knitted-elastic-main.webp', 'assets/images/product-fold-over-elastic-main.webp'],
    tags: ['plain', 'activewear'],
    specs: ['Durable stretch', 'Sweat resistant', 'Color matching', 'Roll packing'],
    intro: 'Binding elastic for activewear and sports garments needing durability, color matching, and production-ready roll supply.',
    applications: ['Activewear binding', 'Sportswear trims', 'Performance apparel'],
    customOptions: ['Durable construction', 'Color matching', 'Width and tension', 'Bulk packing']
  }
];

let products = normalizePublicProducts(DEFAULT_PRODUCTS);
let featuredProducts = products.slice(0, 6);
let isPreviewMode = false;

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value.map(item => String(item || '').trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(/\r?\n|,/).map(item => item.trim()).filter(Boolean);
  return [];
}

function normalizeFeatureList(value) {
  if (Array.isArray(value)) return value.map(item => String(item || '').trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(/\r?\n/).map(item => item.trim()).filter(Boolean);
  return [];
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
  const applications = normalizeArray(source.applications);
  const customOptions = normalizeArray(source.customOptions);
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

function specSummary(specs) {
  return normalizeSpecRows(specs)
    .map(spec => (spec.label && spec.value ? `${spec.label}: ${spec.value}` : spec.value || spec.label))
    .filter(Boolean);
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

function normalizeGallery(product) {
  const rawGallery = Array.isArray(product.gallery) ? product.gallery : [];
  const shouldPrependImage = Boolean(product.image && !rawGallery.some(item => {
    const src = typeof item === 'string' ? item : String((item && item.src) || '').trim();
    return src === product.image;
  }));
  const gallery = rawGallery.map((item, index) => {
    const labelIndex = index + (shouldPrependImage ? 1 : 0);
    const preset = imagePresetForLabel(typeof item === 'string' ? '' : (item && (item.label || item.thumbLabel)), labelIndex);
    if (typeof item === 'string') {
      return {
        group: preset.group,
        src: item,
        label: preset.label,
        alt: imageAlt(product.name, preset.label),
        rotate: false
      };
    }
    const source = item && typeof item === 'object' ? item : {};
    return {
      group: preset.group,
      src: String(source.src || '').trim(),
      label: preset.label,
      alt: imageAlt(product.name, preset.label),
      rotate: Boolean(source.rotate)
    };
  }).filter(item => item.src);

  if (shouldPrependImage) {
    const preset = imagePresetForIndex(0);
    gallery.unshift({
      group: preset.group,
      src: product.image,
      label: preset.label,
      alt: imageAlt(product.name, preset.label),
      rotate: false
    });
  }

  return gallery;
}

function normalizeProductForSite(product, index = 0, includeDraft = false) {
  const source = product && typeof product === 'object' ? product : {};
  const status = source.status || 'published';
  if (!includeDraft && status !== 'published') return null;

  const category = CATEGORY_LABELS[source.category] ? source.category : 'mens';
  const name = String(source.name || 'Untitled Product').trim();
  const normalized = {
    slug: String(source.slug || `product-${index + 1}`).trim(),
    name,
    category,
    categoryLabel: CATEGORY_LABELS[category],
    status,
    sortOrder: Number.isFinite(Number(source.sortOrder)) ? Number(source.sortOrder) : (index + 1) * 10,
    image: String(source.image || '').trim(),
    tags: normalizeArray(source.tags),
    features: normalizeFeatureList(source.features),
    specs: productSpecRows(source),
    intro: String(source.intro || '').trim(),
    applications: normalizeArray(source.applications),
    customOptions: normalizeArray(source.customOptions)
  };
  normalized.gallery = normalizeGallery({ ...source, ...normalized });
  return normalized;
}

function normalizePublicProducts(items) {
  return (Array.isArray(items) ? items : [])
    .map((item, index) => normalizeProductForSite(item, index))
    .filter(Boolean)
    .sort((a, b) => {
      const order = Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
      if (order !== 0) return order;
      return a.name.localeCompare(b.name);
    });
}

function getPreviewProduct() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('preview')) return null;
  try {
    const raw = sessionStorage.getItem(PRODUCT_PREVIEW_KEY);
    if (!raw) return null;
    return normalizeProductForSite(JSON.parse(raw), 0, true);
  } catch (error) {
    console.warn('Unable to load product preview.', error);
    return null;
  }
}

function freshDataUrl(url) {
  if (window.location.protocol === 'file:') return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}cmsFresh=${Date.now()}`;
}

async function fetchProductsFrom(url) {
  const response = await fetch(freshDataUrl(url), {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  });
  if (!response.ok) throw new Error(`Unable to load ${url}`);
  const data = await response.json();
  return data.products || data;
}

async function loadSiteProducts() {
  const previewProduct = getPreviewProduct();
  if (previewProduct) {
    isPreviewMode = true;
    products = [previewProduct];
    featuredProducts = products;
    return;
  }

  const sources = window.location.protocol === 'file:'
    ? ['data/products.json']
    : ['/api/products', 'data/products.json'];

  for (const source of sources) {
    try {
      products = normalizePublicProducts(await fetchProductsFrom(source));
      featuredProducts = products.slice(0, 6);
      return;
    } catch (error) {
      console.warn(error.message);
    }
  }

  products = normalizePublicProducts(DEFAULT_PRODUCTS);
  featuredProducts = products.slice(0, 6);
}

function renderProductCards(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!items.length) {
    container.innerHTML = '<p class="empty-state">No published products are available yet.</p>';
    return;
  }
  container.innerHTML = items.map(p => `
    <article class="product-card">
      <a class="product-card-img" href="product-detail.html?slug=${encodeURIComponent(p.slug)}" aria-label="${escapeHtml(p.name)}">
        <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy">
      </a>
      <div class="product-card-body">
        <p class="material">${escapeHtml(p.categoryLabel)}</p>
        <h3><a href="product-detail.html?slug=${encodeURIComponent(p.slug)}">${escapeHtml(p.name)}</a></h3>
        <div class="tag-row">${p.tags.map(tag => `<span>${escapeHtml(formatTag(tag))}</span>`).join('')}</div>
        <div class="specs">${specSummary(p.specs).slice(0, 4).map(s => `<span>${escapeHtml(s)}</span>`).join('')}</div>
        <a href="product-detail.html?slug=${encodeURIComponent(p.slug)}" class="btn-inquiry">View Details</a>
      </div>
    </article>
  `).join('');
}

function formatTag(tag) {
  const labels = {
    'printed': 'Printed',
    'jacquard': 'Jacquard',
    'plain': 'Plain',
    'fold-over': 'Fold Over',
    'picot': 'Picot',
    'silicone-grip': 'Silicone Grip',
    'bra-strap': 'Bra Strap',
    'waistband': 'Waistband',
    'lingerie': 'Lingerie',
    'activewear': 'Activewear'
  };
  return labels[tag] || tag;
}

// ========== Products Page ==========
function initProductsPage() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  let currentCat = 'all';
  let currentTag = 'all';

  function filterProducts() {
    const filtered = products.filter(p => {
      const catMatch = currentCat === 'all' || p.category === currentCat;
      const tagMatch = currentTag === 'all' || p.tags.includes(currentTag);
      return catMatch && tagMatch;
    });
    renderProductCards('productsGrid', filtered);
    const count = document.getElementById('productCount');
    if (count) count.textContent = `${filtered.length} elastic solutions`;
  }

  document.querySelectorAll('[data-cat]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('[data-cat]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCat = tab.dataset.cat;
      filterProducts();
    });
  });

  document.querySelectorAll('[data-tag]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('[data-tag]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTag = tab.dataset.tag;
      filterProducts();
    });
  });

  const params = new URLSearchParams(window.location.search);
  const catParam = params.get('cat');
  const tagParam = params.get('tag');
  if (catParam) {
    const targetCat = document.querySelector(`[data-cat="${catParam}"]`);
    if (targetCat) targetCat.click();
  }
  if (tagParam) {
    const targetTag = document.querySelector(`[data-tag="${tagParam}"]`);
    if (targetTag) targetTag.click();
  }
  filterProducts();
}

// ========== Product Detail Page ==========
function initProductDetailPage() {
  const page = document.getElementById('productDetail');
  if (!page) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug') || (products[0] && products[0].slug) || 'printed-waistbands';
  const product = products.find(p => p.slug === slug) || (isPreviewMode ? products[0] : null);
  if (!product) {
    document.title = 'Huagui Elastic - Product Not Found';
    page.innerHTML = `
      <section class="section">
        <div class="container">
          <div class="breadcrumb">
            <a href="index.html">Home</a><span>/</span><a href="products.html">Products</a>
          </div>
          <div class="empty-detail">
            <p class="section-label">Product Catalog</p>
            <h1>Product Not Found</h1>
            <p>This product is not currently published.</p>
            <a href="products.html" class="btn btn-primary">View Products</a>
          </div>
        </div>
      </section>
    `;
    return;
  }
  const gallery = (product.gallery && product.gallery.length ? product.gallery : [product.image]).map((item, index) => {
    if (typeof item === 'string') {
      return {
        group: 'Gallery',
        src: item,
        label: `View ${index + 1}`,
        alt: `${product.name} view ${index + 1}`
      };
    }
    return {
      group: item.group || 'Gallery',
      src: item.src,
      label: item.label || item.thumbLabel || `View ${index + 1}`,
      alt: item.alt || `${product.name} ${item.label || `view ${index + 1}`}`,
      rotate: Boolean(item.rotate)
    };
  }).filter(item => item.src);
  if (!gallery.length) {
    gallery.push({
      group: 'Gallery',
      src: 'assets/images/product-elastic-sample-board.webp',
      label: 'Preview Image',
      alt: `${product.name} preview image`,
      rotate: false
    });
  }
  const galleryGroups = gallery.reduce((groups, image, index) => {
    if (!groups.has(image.group)) groups.set(image.group, []);
    groups.get(image.group).push({ ...image, index });
    return groups;
  }, new Map());
  const productFeatures = product.features.length ? product.features : DEFAULT_FEATURES;
  const fallbackSpecificationRows = [
    { label: 'Material', value: 'Nylon / Polyester / Spandex' },
    { label: 'Width', value: 'Custom width available' },
    { label: 'Color', value: 'Pantone or fabric color matching available' },
    { label: 'Elasticity', value: 'Custom stretch tension and recovery control' },
    { label: 'Usage', value: product.applications.join(', ') },
    { label: 'Packing', value: product.customOptions[3] || 'Roll length and carton packing' }
  ].filter(row => row.value);
  const specificationRows = product.specs.length ? product.specs : fallbackSpecificationRows;

  document.title = `Huagui Elastic - ${product.name}`;
  page.innerHTML = `
    <section class="product-detail-shell">
      <div class="container">
        ${isPreviewMode ? '<div class="preview-ribbon"><strong>Preview</strong><span>This product is not published yet.</span></div>' : ''}
        <div class="breadcrumb">
          <a href="index.html">Home</a><span>/</span><a href="products.html">Products</a><span>/</span><strong>${escapeHtml(product.categoryLabel)}</strong>
        </div>

        <div class="product-detail-layout">
          <aside class="detail-sidebar">
            <p class="section-label">${escapeHtml(product.categoryLabel)}</p>
            <h1>${escapeHtml(product.name)}</h1>
            <div class="detail-title-dash"></div>
            <p class="product-intro">${escapeHtml(product.intro)}</p>
            <div class="detail-highlight-icons" aria-label="Product highlights">
              <div>
                <span class="detail-highlight-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 4C11 4 6 8 5 16c5 1 11-2 14-12Z"/><path d="M5 16c2-3 5-5 9-7"/></svg></span>
                <span>Soft Comfort</span>
              </div>
              <div>
                <span class="detail-highlight-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="9" cy="8" r="1.5"/><circle cx="15" cy="10" r="1.5"/><circle cx="10" cy="15" r="1.5"/><circle cx="16" cy="16" r="1.5"/></svg></span>
                <span>Vivid Color</span>
              </div>
              <div>
                <span class="detail-highlight-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8c3 2 5 2 8 0s5-2 8 0"/><path d="M4 12c3 2 5 2 8 0s5-2 8 0"/><path d="M4 16c3 2 5 2 8 0s5-2 8 0"/></svg></span>
                <span>High Elasticity</span>
              </div>
            </div>
            <div class="tag-row">${product.tags.map(tag => `<span>${escapeHtml(formatTag(tag))}</span>`).join('')}</div>

            <div class="custom-summary">
              <h3>Custom Your Design</h3>
              <div class="custom-summary-grid">
                <span><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h4"/></svg>Custom Logo</span>
                <span><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="9" r="1.5"/><circle cx="15" cy="9" r="1.5"/><circle cx="9" cy="15" r="1.5"/><circle cx="15" cy="15" r="1.5"/></svg>Custom Color</span>
                <span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16M4 6h8M4 18h12"/></svg>Custom Width</span>
                <span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7l8-4 8 4-8 4-8-4z"/><path d="M4 12l8 4 8-4"/><path d="M4 17l8 4 8-4"/></svg>Custom Packing</span>
              </div>
              <a href="contact.html" class="btn btn-primary">Request Quote</a>
            </div>

            <div class="quick-contact">
              <a href="contact.html" class="quick-contact-card">
                <span class="quick-contact-icon email"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg></span>
                <span class="quick-contact-text"><strong>Email</strong><span>${escapeHtml(CONTACT_INFO.email)}</span></span>
              </a>
              <a href="contact.html" class="quick-contact-card">
                <span class="quick-contact-icon chat"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg></span>
                <span class="quick-contact-text"><strong>WhatsApp / WeChat</strong><span>${escapeHtml(CONTACT_INFO.people.map(person => `${person.name}: ${person.mobileWechat}`).join(' / '))}</span></span>
              </a>
            </div>
          </aside>

          <section class="detail-main-column" aria-label="Product details">
            <div class="product-gallery-card">
              <div class="image-note"><strong data-gallery-caption>${escapeHtml(gallery[0].label)}</strong><span>Click thumbnails to view available product angles.</span></div>
              <div class="product-main-image"><img class="${gallery[0].rotate ? 'is-rotated' : ''}" src="${escapeHtml(gallery[0].src)}" alt="${escapeHtml(gallery[0].alt)}"></div>
            </div>
            <div class="product-info-table">
              <div class="product-info-head">
                <h2>Product Details</h2>
                <p>Buyer-focused product features and fabric parameters for quotation review.</p>
              </div>
              <section class="product-detail-block" aria-labelledby="product-features-title">
                <h3 id="product-features-title">Features</h3>
                <ul class="product-feature-list">
                  ${productFeatures.map(feature => `<li><span class="feature-check" aria-hidden="true"></span>${escapeHtml(feature)}</li>`).join('')}
                </ul>
              </section>
              <section class="product-detail-block product-spec-block" aria-labelledby="product-specifications-title">
                <h3 id="product-specifications-title">Specifications</h3>
                <table class="product-spec-table" aria-label="Product specifications">
                  <tbody>
                    ${specificationRows.map(spec => `<tr><th scope="row">${escapeHtml(spec.label)}</th><td>${escapeHtml(spec.value)}</td></tr>`).join('')}
                  </tbody>
                </table>
              </section>
            </div>
          </section>

          <aside class="detail-thumbs" aria-label="Product image gallery">
            <p>Gallery</p>
            <div class="product-thumbs">
              ${Array.from(galleryGroups.entries()).map(([group, images]) => `
                <div class="product-thumb-section">
                  <span class="product-thumb-group">${escapeHtml(group)}</span>
                  ${images.map(image => `
                    <button class="${image.index === 0 ? 'active' : ''}" data-gallery-src="${escapeHtml(image.src)}" data-gallery-alt="${escapeHtml(image.alt)}" data-gallery-label="${escapeHtml(image.label)}" data-gallery-rotate="${image.rotate ? 'true' : 'false'}" aria-label="View ${escapeHtml(image.label)}">
                      <span class="product-thumb-index">${image.index + 1}</span>
                      <span class="product-thumb-media">
                        <img class="${image.rotate ? 'is-rotated' : ''}" src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}">
                      </span>
                      <span class="product-thumb-name">${escapeHtml(image.label)}</span>
                    </button>
                  `).join('')}
                </div>
              `).join('')}
            </div>
          </aside>
        </div>
      </div>
    </section>

    <section class="cta-banner" style="background-image: url('${escapeHtml(product.image)}');">
      <div class="hero-overlay"></div>
      <div class="container cta-banner-content">
        <h2>Need ${escapeHtml(product.name)} With Your Brand Details?</h2>
        <p>Send width, color, logo artwork, target quantity, and garment application for a faster quotation.</p>
        <a href="contact.html" class="btn btn-white">Start Inquiry</a>
      </div>
    </section>
  `;

  page.querySelectorAll('[data-gallery-src]').forEach(button => {
    button.addEventListener('click', () => {
      page.querySelectorAll('[data-gallery-src]').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      const mainImage = page.querySelector('.detail-main-column .product-main-image img');
      const caption = page.querySelector('[data-gallery-caption]');
      mainImage.src = button.dataset.gallerySrc;
      mainImage.alt = button.dataset.galleryAlt;
      mainImage.classList.toggle('is-rotated', button.dataset.galleryRotate === 'true');
      if (caption) caption.textContent = button.dataset.galleryLabel;
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  injectFavicons();
  injectHeader();
  injectFooter();
  await loadSiteProducts();

  setTimeout(() => {
    initSlider();
    initMobileMenu();
    initNavbarScroll();
    renderProductCards('featuredProducts', featuredProducts);
    initProductsPage();
    initProductDetailPage();
    renderGlobalContactInfo();

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const name = document.getElementById('name').value.trim();
        const message = document.getElementById('message').value.trim();
        if (!name || !email || !message) {
          alert('Please fill in all required fields: name, email, and message.');
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          alert('Please enter a valid email address.');
          return;
        }
        alert('Thank you. Huagui Elastic will respond with sample and quotation details soon.');
        contactForm.reset();
      });
    }
  }, 0);
});
