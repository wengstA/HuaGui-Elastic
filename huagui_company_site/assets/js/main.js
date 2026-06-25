// ========== Header/Footer Injection ==========
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
              <li>sales@huaguielastic.com</li>
              <li>WhatsApp / WeChat available</li>
              <li>Guangdong, China</li>
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
const products = [
  {
    slug: 'printed-waistbands',
    name: 'Printed Waistbands',
    category: 'mens',
    categoryLabel: "Men's Underwear Elastics",
    image: 'assets/images/printed-waistband-front-back.jpeg',
    gallery: [
      {
        group: 'Product',
        src: 'assets/images/printed-waistband-front-back.jpeg',
        label: 'Front & Back',
        alt: 'Printed waistband front and back view'
      },
      {
        group: 'Product',
        src: 'assets/images/printed-waistband-front.jpeg',
        label: 'Front',
        alt: 'Printed waistband front view'
      },
      {
        group: 'Product',
        src: 'assets/images/printed-waistband-back.jpeg',
        label: 'Back',
        alt: 'Printed waistband back view'
      },
      {
        group: 'Applied',
        src: 'assets/images/printed-waistband-application.jpeg',
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
    image: 'assets/images/product-jacquard-waistbands-main.jpg',
    gallery: ['assets/images/product-jacquard-waistbands-main.jpg', 'assets/images/material-yarn-lines.jpg'],
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
    image: 'assets/images/product-plain-elastic-main.jpg',
    gallery: ['assets/images/product-plain-elastic-main.jpg', 'assets/images/product-elastic-sample-board.jpg'],
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
    image: 'assets/images/product-plain-elastic-main.jpg',
    gallery: ['assets/images/product-plain-elastic-main.jpg', 'assets/images/material-yarn-lines.jpg'],
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
    image: 'assets/images/product-fold-over-elastic-main.jpg',
    gallery: ['assets/images/product-fold-over-elastic-main.jpg', 'assets/images/product-elastic-sample-board.jpg'],
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
    image: 'assets/images/product-picot-elastic-main.jpg',
    gallery: ['assets/images/product-picot-elastic-main.jpg', 'assets/images/product-bra-strap-elastic-main.jpg'],
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
    image: 'assets/images/product-tooth-elastic-main.jpg',
    gallery: ['assets/images/product-tooth-elastic-main.jpg', 'assets/images/factory-weaving-production.jpg'],
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
    image: 'assets/images/product-bra-strap-elastic-main.jpg',
    gallery: ['assets/images/product-bra-strap-elastic-main.jpg', 'assets/images/product-elastic-sample-board.jpg'],
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
    image: 'assets/images/product-knitted-elastic-main.jpg',
    gallery: ['assets/images/product-knitted-elastic-main.jpg', 'assets/images/product-fold-over-elastic-main.jpg'],
    tags: ['plain', 'activewear'],
    specs: ['Durable stretch', 'Sweat resistant', 'Color matching', 'Roll packing'],
    intro: 'Binding elastic for activewear and sports garments needing durability, color matching, and production-ready roll supply.',
    applications: ['Activewear binding', 'Sportswear trims', 'Performance apparel'],
    customOptions: ['Durable construction', 'Color matching', 'Width and tension', 'Bulk packing']
  }
];

const featuredProducts = products.slice(0, 6);

function renderProductCards(containerId, items) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = items.map(p => `
    <article class="product-card">
      <a class="product-card-img" href="product-detail.html?slug=${p.slug}" aria-label="${p.name}">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
      </a>
      <div class="product-card-body">
        <p class="material">${p.categoryLabel}</p>
        <h3><a href="product-detail.html?slug=${p.slug}">${p.name}</a></h3>
        <div class="tag-row">${p.tags.map(tag => `<span>${formatTag(tag)}</span>`).join('')}</div>
        <div class="specs">${p.specs.map(s => `<span>${s}</span>`).join('')}</div>
        <a href="product-detail.html?slug=${p.slug}" class="btn-inquiry">View Details</a>
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
  const slug = params.get('slug') || 'printed-waistbands';
  const product = products.find(p => p.slug === slug) || products[0];
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
      alt: item.alt || `${product.name} ${item.label || `view ${index + 1}`}`
    };
  });
  const galleryGroups = gallery.reduce((groups, image, index) => {
    if (!groups.has(image.group)) groups.set(image.group, []);
    groups.get(image.group).push({ ...image, index });
    return groups;
  }, new Map());
  const productFeatures = [
    'Soft and smooth handfeel for comfortable skin contact',
    'Stable elasticity and recovery for repeat garment production',
    'Custom logo artwork, repeat layout, width, and color support',
    'Suitable for underwear waistbands, briefs, trunks, and loungewear',
    'Sample development and bulk order review before shipment'
  ];
  const specificationRows = [
    ['Material', product.specs[1] || 'Nylon / Polyester / Spandex'],
    ['Width', product.specs[0] || 'Custom width available'],
    ['Printing', product.specs[2] || 'Custom printed logo'],
    ['Handfeel', product.specs[3] || 'Soft skin-contact finish'],
    ['Color', 'Pantone or fabric color matching available'],
    ['Elasticity', 'Custom stretch tension and recovery control'],
    ['Usage', product.applications.join(', ')],
    ['Packing', product.customOptions[3] || 'Roll length and carton packing']
  ];

  document.title = `Huagui Elastic - ${product.name}`;
  page.innerHTML = `
    <section class="product-detail-shell">
      <div class="container">
        <div class="breadcrumb">
          <a href="index.html">Home</a><span>/</span><a href="products.html">Products</a><span>/</span><a href="products.html?cat=${product.category}">${product.categoryLabel}</a><span>/</span><strong>${product.name}</strong>
        </div>

        <div class="detail-filter-strip">
          <div><strong>Category</strong><a href="products.html?cat=${product.category}">${product.categoryLabel}</a></div>
          <div><strong>Tags</strong>${product.tags.map(tag => `<a href="products.html?tag=${tag}">${formatTag(tag)}</a>`).join('')}</div>
        </div>

        <div class="product-detail-layout">
          <aside class="detail-sidebar">
            <p class="section-label">${product.categoryLabel}</p>
            <h1>${product.name}</h1>
            <p class="product-intro">${product.intro}</p>
            <div class="tag-row">${product.tags.map(tag => `<span>${formatTag(tag)}</span>`).join('')}</div>

            <div class="custom-summary">
              <h3>Custom Your Design</h3>
              <div class="custom-summary-grid">
                <span>Custom Logo</span>
                <span>Custom Color</span>
                <span>Custom Width</span>
                <span>Custom Packing</span>
              </div>
              <a href="contact.html" class="btn btn-primary">Request Quote</a>
            </div>

            <div class="quick-contact">
              <a href="contact.html"><strong>Email</strong><span>sales@huaguielastic.com</span></a>
              <a href="contact.html"><strong>WhatsApp / WeChat</strong><span>Send artwork and sample photos</span></a>
            </div>
          </aside>

          <section class="detail-main-column" aria-label="Product details">
            <div class="image-note"><strong data-gallery-caption>${gallery[0].label}</strong><span>Click thumbnails to view available product angles.</span></div>
            <div class="product-main-image"><img src="${gallery[0].src}" alt="${gallery[0].alt}"></div>
            <div class="product-info-table">
              <div class="product-info-head">
                <h2>Product Details</h2>
                <p>Buyer-focused product features and fabric parameters for quotation review.</p>
              </div>
              <section class="product-detail-block" aria-labelledby="product-features-title">
                <h3 id="product-features-title">Features</h3>
                <ul class="product-feature-list">
                  ${productFeatures.map(feature => `<li><span class="feature-check" aria-hidden="true"></span>${feature}</li>`).join('')}
                </ul>
              </section>
              <section class="product-detail-block product-spec-block" aria-labelledby="product-specifications-title">
                <h3 id="product-specifications-title">Specifications</h3>
                <table class="product-spec-table" aria-label="Product specifications">
                  <tbody>
                    ${specificationRows.map(([label, value]) => `<tr><th scope="row">${label}</th><td>${value}</td></tr>`).join('')}
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
                  <span class="product-thumb-group">${group}</span>
                  ${images.map(image => `
                    <button class="${image.index === 0 ? 'active' : ''}" data-gallery-src="${image.src}" data-gallery-alt="${image.alt}" data-gallery-label="${image.label}" aria-label="View ${image.label}">
                      <span class="product-thumb-index">${image.index + 1}</span>
                      <img src="${image.src}" alt="${image.alt}">
                      <span class="product-thumb-name">${image.label}</span>
                    </button>
                  `).join('')}
                </div>
              `).join('')}
            </div>
          </aside>
        </div>
      </div>
    </section>

    <section class="cta-banner" style="background-image: url('${product.image}');">
      <div class="hero-overlay"></div>
      <div class="container cta-banner-content">
        <h2>Need ${product.name} With Your Brand Details?</h2>
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
      if (caption) caption.textContent = button.dataset.galleryLabel;
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  injectHeader();
  injectFooter();

  setTimeout(() => {
    initSlider();
    initMobileMenu();
    initNavbarScroll();
    renderProductCards('featuredProducts', featuredProducts);
    initProductsPage();
    initProductDetailPage();

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
