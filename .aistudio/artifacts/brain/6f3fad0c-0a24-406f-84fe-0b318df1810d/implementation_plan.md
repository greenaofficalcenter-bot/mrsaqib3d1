# Muhammad Saqib (Saqib Visuals) — 3D Interactive Portfolio & Central API Hub

Transform the **Elemental Serenity** 3D WebGL nature sanctuary into a living, interactive 3D background canvas for **Muhammad Saqib (Saqib Visuals)**—combining ultra-transparent glassmorphic typography and cards, live integration with the 3 `mrsaqib.me` Central APIs (plus seamless fallback data), and a scroll-driven cinematic 3D camera fly-through across the lake, bridge, and camp while keeping the 3D world 100% visible at all times.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The 3D WebGL world (with Koi fish, chirping birds, drifting clouds, butterflies, and seasonal/day-night controls) remains **100% visible and interactive in the background**. All portfolio sections use ultra-transparent glass containers (`backdrop-blur-md bg-black/15` / `bg-white/10`) and crisp floating text so the 3D scene is never covered by opaque backgrounds.

- **Confirmed Decision 1 — Ultra-Transparent Glass Cards & Crisp Floating Text**: Portfolio content floats cleanly over the live 3D canvas with zero opaque page backgrounds (`background: transparent`), subtle hairline borders, and high-contrast typography with optical text shadows so every detail of the 3D scene shines through.
- **Confirmed Decision 2 — Smooth Cinematic 3D Camera Fly-Through on Scroll**: As the user scrolls through Hero → Who I Am & Services → Projects Showcase → Visual Gallery Picks → Why Work With Me & Contact, the 3D camera smoothly interpolates (`lerp`) across curated 3D viewpoints (Overview → Koi Lake & Water Shimmer → Wooden Bridge & Songbirds → Campfire & Tent → Panoramic Glade) while still allowing manual 3D drag/orbit and clicking on fish/birds.
- **Confirmed Decision 3 — Live Central API Hub + Automatic Fallback**: The app fetches live data from `https://www.mrsaqib.me/api/public/contact`, `https://www.mrsaqib.me/api/public/projects`, and `https://www.mrsaqib.me/api/public/picks` with loading skeletons, a manual **Sync Live API** retry button, and automatic fallback to Muhammad Saqib's complete profile, projects, gallery, services, and socials if CORS/403 domain whitelisting is pending.

---

## 1. Overview & Core Concept

- **What It Does**: Presents **Muhammad Saqib's (Saqib Visuals)** official Full-Stack Developer, AI Enthusiast & Creative Visual Artist portfolio directly over the interactive 3D nature diorama.
- **Target Audience / Persona**: Clients, recruiters, and creative collaborators visiting Muhammad Saqib's portfolio to explore his web engineering projects, visual photography picks, 10 specialized services, and direct contact channels.
- **Key Value**: Fuses a real-time 3D WebGL ecosystem with a live API-driven portfolio so visitors experience both technical mastery and visual artistry in a single unified viewport.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Branded Entry & Instant Reveal**: The loader and reveal screen feature **Muhammad Saqib — Saqib Visuals** branding. Once entered (with Music or in Silence), the full-screen 3D sanctuary opens with the floating portfolio overlay and the right-side 3D environment controls (Day/Night, Seasons, Music).
  2. **Scroll-Driven 3D Camera Journey**: Scrolling down smoothly glides the 3D camera from the panoramic glade to a close-up of the Koi lake, across the wooden bridge where songbirds perch, over to the glowing campfire & tent, and back to a high-altitude vista.
  3. **Interactive 3D Canvas Toggle ("3D Free Look")**: Pointer clicks on empty background areas pass through to the 3D canvas (rippling water for Koi fish and triggering bird chirps), plus a quick header/floating toggle lets users hide/show the portfolio text anytime to inspect the pure 3D world.
  4. **Live API Projects, Category Filtering & Lightbox Gallery**: Visitors filter projects by category, open live demos or GitHub repos, and click any Photography/Visual Pick to view it in a full-screen high-resolution glass lightbox modal.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Ultra-transparent spatial glassmorphism paired with editorial precision—designed specifically so the 3D WebGL canvas provides 100% of the background atmosphere.
  - *Color Palette & Mood*:
    - **60% Dominant Canvas**: `transparent` (`0%` opacity page body so the `#three` WebGL canvas is 100% visible everywhere).
    - **30% Structural Glass Surfaces**: Ultra-light translucent glass (`rgba(10, 15, 24, 0.22)` with `backdrop-filter: blur(8px)` and `1px solid rgba(255, 255, 255, 0.16)` hairline borders) that never obscures the 3D scene behind it.
    - **10% Focal Accent**: Warm gold & emerald-cyan highlights (`#f59e0b` / `#38bdf8`) for primary CTAs, interactive filter states, and links.
  - *Typography & Hierarchy*:
    - **Display / Headings**: `Outfit` (600/700 weight, tight tracking, `text-wrap: balance`, subtle drop-shadow for guaranteed legibility over both Day and Night 3D skies).
    - **Body Prose**: `Plus Jakarta Sans` (400/500 weight, crisp optical contrast).
    - **Monospace Numerals**: `JetBrains Mono` (`tabular-nums`) for age, phone numbers, and numbered service indices (`01.`–`10.`).
  - *Top Bar Contract*:
    - **Zone 1 (Brand)**: `Saqib Visuals` single-line wordmark.
    - **Zone 2 (Navigation)**: `About`, `Services`, `Projects`, `Gallery`, `Contact` single-line links (`whitespace-nowrap`) that smoothly scroll to the section and glide the 3D camera to that landmark.
    - **Zone 3 (Primary Action)**: Direct `WhatsApp Me` CTA button (`https://wa.me/923478936242`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Pointer-Events Pass-Through Architecture**
  - *Chosen Approach*: Set the outer scroll container to allow seamless vertical scrolling while interactive cards use `pointer-events: auto` and open canvas regions pass clicks to the 3D raycaster (`Fish` water ripples and `Birds` chirp interactions), plus a dedicated **Pure 3D View** toggle button.
  - *Why*: Ensures the user's requirement that the 3D scene is 100% visible, alive, and interactive behind the portfolio text.
- **Decision 2: Resilient Multi-Endpoint API Client (`mrsaqib.me`)**
  - *Chosen Approach*: Fetch `/api/public/contact`, `/api/public/projects`, and `/api/public/picks` concurrently via `Promise.allSettled`. Display shimmer loading skeletons during fetch. If the origin returns HTTP 403 / CORS (not yet whitelisted in the Master Admin API Hub), display a subtle, dismissible non-blocking status bar with a **Retry Live API** button while immediately rendering Muhammad Saqib's complete profile, projects, gallery picks, 10 services, and verified contact/social links.
  - *Why*: Guarantees zero broken UI or empty grids regardless of CORS whitelist status while honoring the live Central API Hub specification.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

```
┌────────────────────────────────────────────────────────────────────────────┐
│                   Fixed Full-Viewport 3D WebGL Canvas (#three)             │
│  • Ground/Lake Shimmer + 3D Koi Fish + Chirping Birds + 3D Clouds          │
│  • Scroll-Linked Camera Controller (Smooth Lerp Across 5 3D Landmarks)     │
└──────────────────────────────────────┬─────────────────────────────────────┘
                                       │ 100% Visible Background
                                       ▼
┌────────────────────────────────────────────────────────────────────────────┐
│             Ultra-Transparent Scrollable Portfolio Overlay (#portfolio)    │
├──────────────────────┬───────────────────────────┬─────────────────────────┤
│   Top Bar Contract   │  Central API Hub Client   │  Interactive Sections   │
│ • Saqib Visuals      │ • GET /api/public/contact │ • Hero + Mission Quote  │
│ • About · Services   │ • GET /api/public/projects│ • Who I Am + 10 Services│
│   Projects · Gallery │ • GET /api/public/picks   │ • Live Projects Grid    │
│   Contact            │ • Loading Skeletons +     │ • Visual Picks + Modal  │
│ • WhatsApp CTA       │   Retry + Rich Fallback   │ • Why Work With Me +    │
│                      │                           │   Contact & 5 Socials   │
└──────────────────────┴───────────────────────────┴─────────────────────────┘
```

- **Scroll-Linked 3D Camera Keyframes**:
  1. **Hero (`0%` scroll)**: Panoramic Sanctuary Overview (`pos: [18.2, 10.6, 27.3]`, `target: [0, 0.8, 0]`)
  2. **Who I Am & Services (`25%` scroll)**: Koi Lake & Water Shimmer Close-Up (`pos: [6.5, 4.2, 11.5]`, `target: [0.5, 0.2, 1.2]`)
  3. **Projects Showcase (`50%` scroll)**: Wooden Bridge & Perching Songbirds (`pos: [-13.5, 4.8, 9.2]`, `target: [-6.5, 1.2, 1.2]`)
  4. **Gallery Picks (`75%` scroll)**: Campfire, Tent & Forest Glade (`pos: [-11.8, 4.5, -12.5]`, `target: [-4.5, 1.0, -5.5]`)
  5. **Why Work With Me & Contact (`100%` scroll)**: High Scenic Horizon Overlook (`pos: [14.0, 8.5, -18.0]`, `target: [0, 1.5, 0]`)
- **Interactive Component & State Mapping**:
  - **Category Filter Bar (Projects)**: Segmented buttons dynamically filter active projects (`All`, `Web Development`, `AI & Automation`, `UI/UX & Branding`) with instant transitions.
  - **Gallery Lightbox Modal**: Clicking any photo in the Gallery Picks grid opens a full-screen preview modal with title, category, and keyboard `ESC` / close button support.
  - **Live API Retry & Status**: Clicking `Sync Live API` re-triggers all 3 `mrsaqib.me` endpoints and updates the UI state without reloading the 3D scene.
