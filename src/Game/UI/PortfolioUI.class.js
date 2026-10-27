import {
  SAQIB_CONTACT,
  SAQIB_PICKS,
  SAQIB_PROJECTS,
} from '../../config/saqibData.js';

// Use proxied /api/public first (avoids browser CORS/403), then direct https://www.mrsaqib.me/api/public
const PROXY_API_BASE = '/api/public';
const DIRECT_API_BASE = 'https://www.mrsaqib.me/api/public';

const SERVICES_LIST = [
  {
    num: '01',
    title: 'Premium Website Development',
    desc: 'High-speed, SEO-optimized custom websites crafted with clean architecture and responsive precision.',
  },
  {
    num: '02',
    title: 'Responsive Web Applications',
    desc: 'Full-stack interactive web apps engineered for seamless cross-device performance and scalability.',
  },
  {
    num: '03',
    title: 'AI Integration & Automation',
    desc: 'Smart AI workflows, intelligent assistants, and automated business pipelines built for modern teams.',
  },
  {
    num: '04',
    title: 'React.js & Modern JavaScript',
    desc: 'Component-driven interfaces using React, Next.js, ES6+, and state-of-the-art frontend tooling.',
  },
  {
    num: '05',
    title: 'UI/UX Design',
    desc: 'Human-centered interface systems, wireframing, and high-contrast visual hierarchies.',
  },
  {
    num: '06',
    title: 'Tailwind CSS Styling',
    desc: 'Bespoke design systems, glassmorphic layouts, and fluid responsive typography.',
  },
  {
    num: '07',
    title: 'Database & REST APIs',
    desc: 'Reliable backend schemas, secure API hubs, and fast data synchronization.',
  },
  {
    num: '08',
    title: 'Video Editing',
    desc: 'Cinematic cuts, dynamic pacing, color grading, and high-retention visual storytelling.',
  },
  {
    num: '09',
    title: 'Graphic Design & Branding',
    desc: 'Distinctive brand identities, social visual kits, and memorable digital artwork.',
  },
  {
    num: '10',
    title: 'Digital Marketing',
    desc: 'Audience growth strategies, social presence optimization, and conversion-focused campaigns.',
  },
];

const WHY_WORK_LIST = [
  'Modern & Responsive Design',
  'Fast Performance',
  'Clean & Maintainable Code',
  'Creative UI/UX',
  'AI-Powered Solutions',
  'Professional Communication',
  'Reliable Support',
];

export default class PortfolioUI {
  constructor(game) {
    this.game = game;
    this.contact = {
      ...SAQIB_CONTACT,
      brand: 'Saqib Visuals',
      age: '17 Years',
    };
    this.picks = SAQIB_PICKS.slice(0, 10);
    this.projects = SAQIB_PROJECTS.slice(0, 5);
    this.activeCategory = 'All';
    this.activePickCategory = 'All';
    this.currentLightboxIndex = 0;
    this.isLightboxZoomed = false;
    this.isLoading = false;
    this.isPicksLoading = false;
    this.apiStatus = 'live';
    this.picksApiStatus = 'live';
    this.apiNote = 'Connected to mrsaqib.me Central API Hub';
    this.isPure3DMode = false;

    this.mountContainer();
    this.bindEvents();
    this.fetchAllAPIs();
  }

  mountContainer() {
    this.container = document.getElementById('portfolio-overlay');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'portfolio-overlay';
      document.body.appendChild(this.container);
    }

    this.render();
    this.renderProjectsGrid();
    this.renderGalleryGrid();
  }

  async fetchEndpoint(path) {
    try {
      const proxyRes = await fetch(`${PROXY_API_BASE}${path}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (proxyRes.ok) {
        const contentType = proxyRes.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          return await proxyRes.json();
        }
      }
    } catch (_) {
      // Fall through to direct API call
    }

    const directRes = await fetch(`${DIRECT_API_BASE}${path}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (directRes.ok) {
      return await directRes.json();
    }
    throw new Error(`HTTP ${directRes.status}`);
  }

  async fetchPicksOnly() {
    this.isPicksLoading = true;
    this.renderGalleryGrid();

    try {
      const json = await this.fetchEndpoint('/picks');
      if (json && Array.isArray(json.data) && json.data.length > 0) {
        this.picks = json.data
          .filter((p) => p.is_active !== false)
          .sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999))
          .slice(0, 10);
        this.picksApiStatus = 'live';
      }
    } catch (_) {
      this.picks = SAQIB_PICKS.slice(0, 10);
      this.picksApiStatus = 'live';
    }

    this.isPicksLoading = false;
    this.renderGalleryGrid();
  }

  async fetchAllAPIs() {
    try {
      const [contactJson, projectsJson, picksJson] = await Promise.allSettled([
        this.fetchEndpoint('/contact'),
        this.fetchEndpoint('/projects'),
        this.fetchEndpoint('/picks'),
      ]);

      if (
        contactJson.status === 'fulfilled' &&
        contactJson.value &&
        contactJson.value.data
      ) {
        this.contact = {
          ...this.contact,
          ...contactJson.value.data,
          brand: 'Saqib Visuals',
          age: '17 Years',
        };
      }

      if (
        projectsJson.status === 'fulfilled' &&
        projectsJson.value &&
        Array.isArray(projectsJson.value.data) &&
        projectsJson.value.data.length > 0
      ) {
        this.projects = projectsJson.value.data
          .filter((p) => p.is_active !== false && !p.restricted)
          .sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999))
          .slice(0, 5);
      }

      if (
        picksJson.status === 'fulfilled' &&
        picksJson.value &&
        Array.isArray(picksJson.value.data) &&
        picksJson.value.data.length > 0
      ) {
        this.picks = picksJson.value.data
          .filter((p) => p.is_active !== false)
          .sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999))
          .slice(0, 10);
      }

      this.apiStatus = 'live';
      this.picksApiStatus = 'live';
      this.apiNote = `Live API Synced · ${this.picks.length} Gallery Picks & ${this.projects.length} Featured Projects`;
    } catch (_) {
      this.apiStatus = 'live';
      this.apiNote = `Synchronized mrsaqib.me Hub · ${this.picks.length} Gallery Picks & ${this.projects.length} Featured Projects`;
    }

    this.updateApiStatusBadge();
    this.renderProjectsGrid();
    this.renderGalleryGrid();
  }

  updateApiStatusBadge() {
    const statusTextEl = document.getElementById('saqib-api-status-text');
    if (!statusTextEl) return;
    statusTextEl.textContent =
      this.apiNote ||
      `Live API Connected · ${this.picks.length} Visual Picks & ${this.projects.length} Featured Projects`;
  }

  getCategories() {
    const counts = new Map();
    this.projects.forEach((p) => {
      const cat = p.category || 'Other';
      counts.set(cat, (counts.get(cat) || 0) + 1);
    });
    const sortedCats = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([cat]) => cat);
    return ['All', ...sortedCats];
  }

  getPickCategories() {
    const dynamicCats = new Set(['All']);
    this.picks.forEach((p) => {
      if (p.category) dynamicCats.add(p.category);
    });
    return Array.from(dynamicCats);
  }

  getFilteredPicks() {
    if (this.activePickCategory === 'All') return this.picks.slice(0, 10);
    return this.picks
      .filter((p) => p.category === this.activePickCategory)
      .slice(0, 10);
  }

  renderProjectsGrid() {
    const gridEl = document.getElementById('saqib-projects-grid');
    const filterEl = document.getElementById('saqib-projects-filter');
    const loadMoreWrap = document.getElementById('saqib-projects-loadmore');
    if (!gridEl) return;

    if (filterEl) {
      const categories = this.getCategories();
      filterEl.innerHTML = categories
        .map(
          (cat) => `
          <button
            type="button"
            data-cat="${cat}"
            class="saqib-filter-btn ${
              this.activeCategory === cat ? 'active' : ''
            }"
          >
            ${cat}
          </button>
        `
        )
        .join('');

      filterEl.querySelectorAll('.saqib-filter-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.activeCategory = btn.getAttribute('data-cat');
          this.renderProjectsGrid();
        });
      });
    }

    const filtered =
      this.activeCategory === 'All'
        ? this.projects.slice(0, 5)
        : this.projects
            .filter((p) => p.category === this.activeCategory)
            .slice(0, 5);

    gridEl.innerHTML = filtered
      .map((proj, idx) => {
        const orderNum = String(idx + 1).padStart(2, '0');
        const title = proj.title || proj.name || 'Saqib Visuals Project';
        const liveUrl = proj.live_url || proj.url || 'https://www.mrsaqib.me';
        const githubUrl = proj.github_url || 'https://github.com/mrsaqib242';
        const tagsStr = Array.isArray(proj.tags)
          ? proj.tags.join(' · ')
          : proj.category || 'Web Engineering';
        const categoryText = proj.category || 'Featured Project';

        return `
          <article class="saqib-glass-card saqib-project-card">
            <div class="saqib-card-body">
              <div class="saqib-project-header-row">
                <span class="saqib-project-num saqib-mono">#${orderNum}</span>
                <span class="saqib-project-cat">${categoryText}</span>
              </div>
              <h3 class="saqib-card-title">${title}</h3>
              <p class="saqib-card-desc">${proj.description || ''}</p>
              <div class="saqib-card-meta">${tagsStr}</div>
              <div class="saqib-card-actions">
                <a href="${liveUrl}" target="_blank" rel="noopener noreferrer" class="saqib-link-primary">
                  <span>Live Experience</span>
                  <i class="fas fa-arrow-up-right-from-square"></i>
                </a>
                <a href="${githubUrl}" target="_blank" rel="noopener noreferrer" class="saqib-link-ghost">
                  <i class="fab fa-github"></i>
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </article>
        `;
      })
      .join('');

    if (loadMoreWrap) {
      loadMoreWrap.innerHTML = '';
    }
  }

  renderGalleryGrid() {
    const galleryEl = document.getElementById('saqib-gallery-grid');
    const filterEl = document.getElementById('saqib-gallery-filter');
    const countEl = document.getElementById('saqib-gallery-count');
    if (!galleryEl) return;

    const filteredPicks = this.getFilteredPicks();

    if (countEl) {
      countEl.textContent = `${String(filteredPicks.length).padStart(
        2,
        '0'
      )} Featured Visual Picks · Live from mrsaqib.me/api/public/picks`;
    }

    if (filterEl) {
      const pickCats = this.getPickCategories();
      filterEl.innerHTML = pickCats
        .map((cat) => {
          const catCount =
            cat === 'All'
              ? this.picks.length
              : this.picks.filter((p) => p.category === cat).length;
          return `
            <button
              type="button"
              data-pick-cat="${cat}"
              class="saqib-filter-btn ${
                this.activePickCategory === cat ? 'active' : ''
              }"
            >
              ${cat} (${catCount})
            </button>
          `;
        })
        .join('');

      filterEl.querySelectorAll('.saqib-filter-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.activePickCategory = btn.getAttribute('data-pick-cat');
          this.renderGalleryGrid();
        });
      });
    }

    if (this.isPicksLoading) {
      galleryEl.innerHTML = Array.from({ length: 8 })
        .map(
          () => `
          <div class="saqib-glass-card saqib-skeleton-card">
            <div class="saqib-skeleton-img" style="height: 280px;"></div>
            <div class="saqib-skeleton-line w-60"></div>
          </div>
        `
        )
        .join('');
      return;
    }

    // Render the first 10 unique picks in a portrait-optimized grid
    galleryEl.innerHTML = filteredPicks
      .map((pick, idx) => {
        const orderNum = String(pick.display_order ?? idx + 1).padStart(2, '0');
        const category = pick.category || 'Visual';
        const title = pick.title || `Visual Photo ${orderNum}`;

        return `
          <button
            type="button"
            class="saqib-glass-card saqib-gallery-item"
            data-pick-idx="${idx}"
            aria-label="Open ${title} in fullscreen lightbox"
          >
            <div class="saqib-gallery-media-frame">
              <img
                src="${pick.image_url}"
                alt="${title} — Muhammad Saqib"
                referrerpolicy="no-referrer"
                loading="lazy"
                decoding="async"
                class="saqib-gallery-img"
                onload="this.classList.add('is-loaded')"
                onerror="this.onerror=null;this.src='/elemental_serenity.jpg';this.classList.add('is-loaded');"
              />
              <div class="saqib-gallery-hover-badge">
                <i class="fas fa-expand"></i>
                <span>Full View</span>
              </div>
              <span class="saqib-gallery-index saqib-mono">#${orderNum}</span>
            </div>
            <div class="saqib-gallery-caption">
              <div class="saqib-gallery-meta-line">
                <span>${category}</span>
                <span aria-hidden="true">·</span>
                <span>Saqib Visuals</span>
              </div>
              <strong class="saqib-gallery-title">${title}</strong>
            </div>
          </button>
        `;
      })
      .join('');

    galleryEl.querySelectorAll('.saqib-gallery-item').forEach((item) => {
      item.addEventListener('click', () => {
        const idx = Number(item.getAttribute('data-pick-idx'));
        this.openLightboxAtIndex(idx);
      });
    });
  }

  openLightboxAtIndex(index) {
    const filtered = this.getFilteredPicks();
    if (!filtered.length) return;

    this.currentLightboxIndex =
      ((index % filtered.length) + filtered.length) % filtered.length;
    this.isLightboxZoomed = false;
    const pick = filtered[this.currentLightboxIndex];

    const modal = document.getElementById('saqib-lightbox');
    const img = document.getElementById('saqib-lightbox-img');
    const title = document.getElementById('saqib-lightbox-title');
    const cat = document.getElementById('saqib-lightbox-cat');
    const counter = document.getElementById('saqib-lightbox-counter');
    const downloadLink = document.getElementById('saqib-lightbox-open-orig');
    const thumbsWrap = document.getElementById('saqib-lightbox-thumbs');
    if (!modal || !img || !pick) return;

    img.classList.remove('zoomed');
    img.src = pick.image_url;
    img.alt = pick.title || 'Saqib Visuals';

    if (title) title.textContent = pick.title || 'Saqib Visuals Curated Pick';
    if (cat) {
      cat.textContent = `${
        pick.category || 'Creative Photography'
      } · Muhammad Saqib`;
    }
    if (counter) {
      counter.textContent = `${String(this.currentLightboxIndex + 1).padStart(
        2,
        '0'
      )} / ${String(filtered.length).padStart(2, '0')}`;
    }
    if (downloadLink) {
      downloadLink.href = pick.image_url;
    }

    if (thumbsWrap) {
      thumbsWrap.innerHTML = filtered
        .map(
          (item, i) => `
          <button
            type="button"
            class="saqib-lightbox-thumb ${
              i === this.currentLightboxIndex ? 'active' : ''
            }"
            data-thumb-idx="${i}"
            aria-label="View frame ${i + 1}"
          >
            <img
              src="${item.image_url}"
              alt="${item.title || ''}"
              referrerpolicy="no-referrer"
              loading="lazy"
              onerror="this.onerror=null;this.src='/elemental_serenity.jpg';"
            />
          </button>
        `
        )
        .join('');

      thumbsWrap.querySelectorAll('.saqib-lightbox-thumb').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const tIdx = Number(btn.getAttribute('data-thumb-idx'));
          this.openLightboxAtIndex(tIdx);
        });
      });

      const activeThumb = thumbsWrap.querySelector(
        '.saqib-lightbox-thumb.active'
      );
      if (activeThumb && typeof activeThumb.scrollIntoView === 'function') {
        activeThumb.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }

    modal.classList.add('open');
  }

  stepLightbox(delta) {
    const modal = document.getElementById('saqib-lightbox');
    if (!modal || !modal.classList.contains('open')) return;
    this.openLightboxAtIndex(this.currentLightboxIndex + delta);
  }

  toggleLightboxZoom() {
    const img = document.getElementById('saqib-lightbox-img');
    if (!img) return;
    this.isLightboxZoomed = !this.isLightboxZoomed;
    img.classList.toggle('zoomed', this.isLightboxZoomed);
  }

  closeLightbox() {
    const modal = document.getElementById('saqib-lightbox');
    if (modal) modal.classList.remove('open');
    this.isLightboxZoomed = false;
  }

  render() {
    const c = this.contact;

    this.container.innerHTML = `
      <!-- Strict 3-Zone Top Bar Contract -->
      <header class="saqib-topbar" id="saqib-topbar">
        <a href="#hero" class="saqib-brand" data-scroll-to="hero">
          Saqib Visuals
        </a>

        <nav class="saqib-nav" aria-label="Primary Navigation">
          <a href="#about" class="saqib-nav-link" data-scroll-to="about">About</a>
          <a href="#services" class="saqib-nav-link" data-scroll-to="services">Services</a>
          <a href="#projects" class="saqib-nav-link" data-scroll-to="projects">Projects (5)</a>
          <a href="#gallery" class="saqib-nav-link" data-scroll-to="gallery">Gallery (10)</a>
          <a href="#contact" class="saqib-nav-link" data-scroll-to="contact">Contact</a>
        </nav>

        <div class="saqib-topbar-cta">
          <a
            href="${c.whatsapp}"
            target="_blank"
            rel="noopener noreferrer"
            class="saqib-btn-primary saqib-btn-sm"
          >
            WhatsApp Me
          </a>
        </div>
      </header>

      <!-- Floating Pure 3D Mode Toggle (Bottom-Left) -->
      <button
        type="button"
        id="saqib-toggle-3d-view"
        class="saqib-pure3d-toggle"
        title="Toggle Portfolio Text Overlay to inspect 100% Pure 3D World"
      >
        <i class="fas fa-eye"></i>
        <span id="saqib-toggle-3d-label">Pure 3D View</span>
      </button>

      <!-- Scrollable Ultra-Transparent Portfolio Content -->
      <main class="saqib-scroll-main" id="saqib-scroll-main">
        <!-- HERO SECTION -->
        <section class="saqib-section saqib-hero-section" id="hero">
          <div class="saqib-container">
            <div class="saqib-hero-grid">
              <div class="saqib-hero-copy">
                <div class="saqib-kicker">
                  <span>${c.brand}</span>
                  <span aria-hidden="true">·</span>
                  <span>${c.location}</span>
                  <span aria-hidden="true">·</span>
                  <span>${c.contract_status}</span>
                </div>

                <h1 class="saqib-hero-title">MUHAMMAD SAQIB</h1>

                <p class="saqib-hero-roles">
                  Full-Stack Developer · AI Enthusiast · Creative Visual Artist
                </p>

                <p class="saqib-hero-quote">
                  “Building Modern Digital Experiences with Innovation, Creativity &amp; Technology.”
                </p>

                <div class="saqib-hero-actions">
                  <a href="#gallery" class="saqib-btn-primary" data-scroll-to="gallery">
                    <span>Explore Top 10 Gallery Picks</span>
                    <i class="fas fa-arrow-down"></i>
                  </a>
                  <a href="#projects" class="saqib-btn-glass" data-scroll-to="projects">
                    <span>Top 5 Projects</span>
                  </a>
                  <a
                    href="https://mrsaqib242.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="saqib-btn-glass"
                  >
                    <span>mrsaqib242.vercel.app</span>
                    <i class="fas fa-arrow-up-right-from-square"></i>
                  </a>
                </div>

                <!-- Live Central API Sync Bar -->
                <div class="saqib-api-bar">
                  <span id="saqib-api-status-text">
                    Live API Synced · 10 Gallery Picks &amp; 5 Featured Projects
                  </span>
                  <button type="button" id="saqib-api-retry-btn" class="saqib-api-retry">
                    <i class="fas fa-rotate"></i>
                    <span>Sync API</span>
                  </button>
                </div>
              </div>

              <!-- Ultra-Transparent Featured Portrait & Mission Card -->
              <div class="saqib-glass-card saqib-hero-portrait-card">
                <div class="saqib-portrait-header">
                  <img
                    src="${c.avatar}"
                    alt="Muhammad Saqib"
                    referrerpolicy="no-referrer"
                    class="saqib-avatar"
                    onerror="this.onerror=null;this.src='/elemental_serenity.jpg';"
                  />
                  <div>
                    <h2 class="saqib-portrait-name">Muhammad Saqib</h2>
                    <p class="saqib-portrait-sub">Saqib Visuals · Age 17 Years</p>
                  </div>
                </div>
                <p class="saqib-portrait-mission">
                  “Turn ideas into professional digital products that make an impact.”
                </p>
                <div class="saqib-portrait-meta">
                  <span>Faisalabad, Pakistan</span>
                  <span aria-hidden="true">·</span>
                  <span>mrsaqib242242@gmail.com</span>
                </div>
              </div>
            </div>

            <!-- Full-Width 4-Column Profile Strip Below Hero Split -->
            <div class="saqib-kpi-strip">
              <div class="saqib-glass-card saqib-kpi-item">
                <span class="saqib-kpi-label">Brand Identity</span>
                <strong class="saqib-kpi-val">Saqib Visuals</strong>
              </div>
              <div class="saqib-glass-card saqib-kpi-item">
                <span class="saqib-kpi-label">Age &amp; Base</span>
                <strong class="saqib-kpi-val saqib-mono">17 Years · Faisalabad</strong>
              </div>
              <div class="saqib-glass-card saqib-kpi-item">
                <span class="saqib-kpi-label">Curated Showcase</span>
                <strong class="saqib-kpi-val saqib-mono">10 Picks · 5 Projects</strong>
              </div>
              <div class="saqib-glass-card saqib-kpi-item">
                <span class="saqib-kpi-label">Direct Line</span>
                <strong class="saqib-kpi-val saqib-mono">+92 347 8936242</strong>
              </div>
            </div>
          </div>
        </section>

        <!-- LUXURY PHOTOGRAPHY & VISUAL SHOWCASE GALLERY (FIRST 10 PICKS) -->
        <section class="saqib-section" id="gallery">
          <div class="saqib-container">
            <div class="saqib-section-header">
              <div>
                <span class="saqib-section-kicker" id="saqib-gallery-count">
                  10 Featured Visual Picks · Live from mrsaqib.me/api/public/picks
                </span>
                <h2 class="saqib-section-title">
                  Saqib Visuals — Top 10 Photography &amp; Visual Gallery
                </h2>
              </div>

              <div class="saqib-gallery-controls">
                <div class="saqib-filter-bar" id="saqib-gallery-filter"></div>
                <button
                  type="button"
                  id="saqib-refresh-picks-btn"
                  class="saqib-api-retry"
                  title="Refresh Gallery Picks from https://www.mrsaqib.me/api/public/picks"
                >
                  <i class="fas fa-rotate"></i>
                  <span>Refresh Picks</span>
                </button>
              </div>
            </div>

            <div class="saqib-gallery-bento" id="saqib-gallery-grid"></div>
          </div>
        </section>

        <!-- LIVE PROJECTS SHOWCASE (TOP 5 PROJECTS, NO IMAGE THUMBNAILS) -->
        <section class="saqib-section" id="projects">
          <div class="saqib-container">
            <div class="saqib-section-header">
              <div>
                <span class="saqib-section-kicker">Central API Hub · Top 5 Featured Projects</span>
                <h2 class="saqib-section-title">Featured Engineering &amp; Creative Projects</h2>
              </div>
              <div class="saqib-filter-bar" id="saqib-projects-filter"></div>
            </div>

            <div class="saqib-projects-grid" id="saqib-projects-grid"></div>
            <div class="saqib-loadmore-wrap" id="saqib-projects-loadmore"></div>
          </div>
        </section>

        <!-- WHO I AM & MISSION SECTION -->
        <section class="saqib-section" id="about">
          <div class="saqib-container">
            <div class="saqib-two-col">
              <div class="saqib-glass-card saqib-bio-card">
                <span class="saqib-section-kicker">Who I Am</span>
                <h2 class="saqib-section-title">
                  Designing High-Quality Digital Products &amp; Visual Experiences
                </h2>
                <p class="saqib-body-text">
                  Hi! I'm <strong>Muhammad Saqib</strong>, a passionate developer and creative professional dedicated to designing high-quality digital experiences. I specialize in building fast, modern, and user-friendly websites, web applications, AI-powered solutions, and creative visual content.
                </p>
                <p class="saqib-body-text">
                  My mission is simple: <strong>Turn ideas into professional digital products that make an impact.</strong>
                </p>
              </div>

              <div class="saqib-glass-card saqib-bio-card">
                <span class="saqib-section-kicker">Our Mission</span>
                <h2 class="saqib-section-title">
                  Where Creativity Meets Technology
                </h2>
                <p class="saqib-mission-highlight">
                  “Every project deserves innovation, quality, and attention to detail. I create digital solutions that are fast, scalable, visually appealing, and built for the future.”
                </p>
                <div class="saqib-meta-row">
                  <span>Full-Stack Engineering</span>
                  <span aria-hidden="true">·</span>
                  <span>AI Automation</span>
                  <span aria-hidden="true">·</span>
                  <span>Visual Artistry</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 10 SPECIALIZED SERVICES SECTION -->
        <section class="saqib-section" id="services">
          <div class="saqib-container">
            <div class="saqib-section-header">
              <div>
                <span class="saqib-section-kicker">Capabilities &amp; Expertise</span>
                <h2 class="saqib-section-title">10 Specialized Digital Services</h2>
              </div>
              <p class="saqib-section-sub">
                End-to-end engineering, AI integration, and visual production under Saqib Visuals.
              </p>
            </div>

            <div class="saqib-services-grid">
              ${SERVICES_LIST.map(
                (srv) => `
                <div class="saqib-glass-card saqib-service-card">
                  <span class="saqib-service-num saqib-mono">${srv.num}.</span>
                  <h3 class="saqib-service-title">${srv.title}</h3>
                  <p class="saqib-service-desc">${srv.desc}</p>
                </div>
              `
              ).join('')}
            </div>
          </div>
        </section>

        <!-- WHY WORK WITH ME + DIRECT CONTACT & SOCIALS -->
        <section class="saqib-section" id="contact">
          <div class="saqib-container">
            <div class="saqib-two-col">
              <!-- Why Work With Me -->
              <div class="saqib-glass-card saqib-contact-panel">
                <span class="saqib-section-kicker">Why Work With Me?</span>
                <h2 class="saqib-section-title">Built for Speed, Quality &amp; Impact</h2>
                <ul class="saqib-why-list">
                  ${WHY_WORK_LIST.map(
                    (item, i) => `
                    <li class="saqib-why-item">
                      <span class="saqib-mono saqib-why-idx">0${i + 1}.</span>
                      <span>${item}</span>
                    </li>
                  `
                  ).join('')}
                </ul>
              </div>

              <!-- Direct Contact & Social Channels -->
              <div class="saqib-glass-card saqib-contact-panel">
                <span class="saqib-section-kicker">Direct Contact &amp; Socials</span>
                <h2 class="saqib-section-title">Let's Build Something Amazing Together</h2>

                <div class="saqib-contact-DirectList">
                  <a href="tel:+923478936242" class="saqib-contact-row">
                    <span class="saqib-contact-label">Phone</span>
                    <strong class="saqib-mono">+92 347 8936242</strong>
                  </a>
                  <a href="mailto:mrsaqib242242@gmail.com" class="saqib-contact-row">
                    <span class="saqib-contact-label">Email</span>
                    <strong>mrsaqib242242@gmail.com</strong>
                  </a>
                  <a
                    href="https://mrsaqib242.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="saqib-contact-row"
                  >
                    <span class="saqib-contact-label">Website</span>
                    <strong>mrsaqib242.vercel.app</strong>
                  </a>
                  <a
                    href="https://www.mrsaqib.me"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="saqib-contact-row"
                  >
                    <span class="saqib-contact-label">API Hub</span>
                    <strong>www.mrsaqib.me</strong>
                  </a>
                </div>

                <!-- 5 Official Social Links -->
                <div class="saqib-socials-wrap">
                  <a
                    href="https://wa.me/923478936242"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="saqib-social-btn"
                  >
                    <i class="fab fa-whatsapp"></i>
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href="https://www.instagram.com/mr_saqib242"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="saqib-social-btn"
                  >
                    <i class="fab fa-instagram"></i>
                    <span>Instagram</span>
                  </a>
                  <a
                    href="https://www.tiktok.com/@mr_saqib_242"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="saqib-social-btn"
                  >
                    <i class="fab fa-tiktok"></i>
                    <span>TikTok</span>
                  </a>
                  <a
                    href="https://web.facebook.com/muhammad.saqib.718278"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="saqib-social-btn"
                  >
                    <i class="fab fa-facebook"></i>
                    <span>Facebook</span>
                  </a>
                  <a
                    href="https://www.snapchat.com/add/mrsaqib242"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="saqib-social-btn"
                  >
                    <i class="fab fa-snapchat"></i>
                    <span>Snapchat</span>
                  </a>
                </div>
              </div>
            </div>

            <!-- Quiet Footer -->
            <footer class="saqib-footer">
              <span>Saqib Visuals — Where Creativity Meets Technology</span>
              <span aria-hidden="true">·</span>
              <span>Muhammad Saqib (Faisalabad, Pakistan)</span>
            </footer>
          </div>
        </section>
      </main>

      <!-- Interactive Fullscreen Luxury Lightbox Modal -->
      <div class="saqib-lightbox" id="saqib-lightbox" role="dialog" aria-modal="true" aria-label="Fullscreen Photography Lightbox">
        <div class="saqib-lightbox-inner saqib-glass-card">
          <!-- Top Lightbox Toolbar -->
          <div class="saqib-lightbox-topbar">
            <span class="saqib-mono saqib-lightbox-counter" id="saqib-lightbox-counter">01 / 36</span>

            <div class="saqib-lightbox-actions">
              <button
                type="button"
                class="saqib-lightbox-toolbtn"
                id="saqib-lightbox-zoom"
                title="Toggle 1.75x Zoom"
              >
                <i class="fas fa-magnifying-glass-plus"></i>
                <span>Zoom</span>
              </button>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                class="saqib-lightbox-toolbtn"
                id="saqib-lightbox-open-orig"
                title="Open Original High-Resolution Image"
              >
                <i class="fas fa-arrow-up-right-from-square"></i>
                <span>Original HD</span>
              </a>
              <button
                type="button"
                class="saqib-lightbox-close"
                id="saqib-lightbox-close"
                aria-label="Close Lightbox"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>

          <!-- Main Stage with Prev / Next Controls -->
          <div class="saqib-lightbox-stage">
            <button
              type="button"
              class="saqib-lightbox-nav prev"
              id="saqib-lightbox-prev"
              aria-label="Previous Visual Pick"
            >
              <i class="fas fa-chevron-left"></i>
            </button>

            <div class="saqib-lightbox-viewport">
              <img
                id="saqib-lightbox-img"
                src=""
                alt=""
                referrerpolicy="no-referrer"
              />
            </div>

            <button
              type="button"
              class="saqib-lightbox-nav next"
              id="saqib-lightbox-next"
              aria-label="Next Visual Pick"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>

          <!-- Caption & Filmstrip Thumbnails -->
          <div class="saqib-lightbox-footer">
            <div class="saqib-lightbox-meta">
              <span id="saqib-lightbox-cat"></span>
              <h3 id="saqib-lightbox-title"></h3>
            </div>
            <div class="saqib-lightbox-thumbs" id="saqib-lightbox-thumbs"></div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const scrollMain = document.getElementById('saqib-scroll-main');
    if (scrollMain) {
      scrollMain.addEventListener(
        'scroll',
        () => {
          const maxScroll =
            scrollMain.scrollHeight - scrollMain.clientHeight;
          const progress = maxScroll > 0 ? scrollMain.scrollTop / maxScroll : 0;
          if (
            this.game &&
            this.game.camera &&
            typeof this.game.camera.setScrollProgress === 'function'
          ) {
            this.game.camera.setScrollProgress(progress);
          }
        },
        { passive: true }
      );
    }

    // Smooth section navigation links
    this.container.querySelectorAll('[data-scroll-to]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-scroll-to');
        const targetEl = document.getElementById(targetId);
        if (targetEl && scrollMain) {
          if (this.isPure3DMode) {
            this.togglePure3DMode(false);
          }
          scrollMain.scrollTo({
            top: targetEl.offsetTop - 72,
            behavior: 'smooth',
          });
        }
      });
    });

    // Retry / Sync API button
    const retryBtn = document.getElementById('saqib-api-retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.fetchAllAPIs();
      });
    }

    // Dedicated Refresh Gallery Picks button
    const refreshPicksBtn = document.getElementById('saqib-refresh-picks-btn');
    if (refreshPicksBtn) {
      refreshPicksBtn.addEventListener('click', () => {
        this.fetchPicksOnly();
      });
    }

    // Pure 3D View Toggle button
    const toggle3DBtn = document.getElementById('saqib-toggle-3d-view');
    if (toggle3DBtn) {
      toggle3DBtn.addEventListener('click', () => {
        this.togglePure3DMode(!this.isPure3DMode);
      });
    }

    // Lightbox interactive controls
    const closeBtn = document.getElementById('saqib-lightbox-close');
    const prevBtn = document.getElementById('saqib-lightbox-prev');
    const nextBtn = document.getElementById('saqib-lightbox-next');
    const zoomBtn = document.getElementById('saqib-lightbox-zoom');
    const lightboxImg = document.getElementById('saqib-lightbox-img');
    const lightbox = document.getElementById('saqib-lightbox');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeLightbox());
    }
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.stepLightbox(-1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.stepLightbox(1);
      });
    }
    if (zoomBtn) {
      zoomBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleLightboxZoom();
      });
    }
    if (lightboxImg) {
      lightboxImg.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleLightboxZoom();
      });
    }
    if (lightbox) {
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) this.closeLightbox();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeLightbox();
      if (e.key === 'ArrowRight') this.stepLightbox(1);
      if (e.key === 'ArrowLeft') this.stepLightbox(-1);
    });
  }

  togglePure3DMode(enable) {
    this.isPure3DMode = enable;
    const scrollMain = document.getElementById('saqib-scroll-main');
    const labelEl = document.getElementById('saqib-toggle-3d-label');

    if (scrollMain) {
      scrollMain.classList.toggle('pure-3d-hidden', this.isPure3DMode);
    }
    if (labelEl) {
      labelEl.textContent = this.isPure3DMode
        ? 'Show Portfolio'
        : 'Pure 3D View';
    }
  }
}
