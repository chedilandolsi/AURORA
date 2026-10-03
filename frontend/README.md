# Aurora - Angular 19 Artisanal E-Commerce Frontend

Aurora is a luxury e-commerce web platform for handcrafted Tunisian wooden masks, featuring bespoke wood grain inspections, animated galleries, Google OAuth2, Stripe international checkout, and admin inventory management.

## Tech Stack
- **Framework:** Angular 19 (Standalone Components, Signals & Reactive Architecture)
- **Styling:** Tailwind CSS 3, Custom Artisanal Theme (Obsidian, Sand, Terracotta, Olive Gold)
- **State & Routing:** Angular Router, HttpClient, RxJS, Signals
- **Authentication:** JWT Bearer Auth & Google OAuth2 Redirect Callback Handler
- **Payments:** Stripe Checkout integration & tracking
- **Media Experience:** Animated multi-angle photo gallery, crossfade transitions, wood grain hover zoom, collector fullscreen lightbox modal with keyboard controls

## Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm 9+

### Installation
```bash
npm install
```

### Development Server
```bash
npm start
```
Navigate to `http://localhost:4200/`. API requests to `/api` and `/uploads` will proxy to `http://localhost:8080` via `proxy.conf.json`.

### Production Build
```bash
npm run build
```
Build artifacts are placed in `dist/aurora-frontend/`.
