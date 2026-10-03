# Aurora — Artisanal Tunisian Decor & Handcrafted Wooden Masks

> **Production-Grade E-Commerce Platform** connecting ancestral North African olive woodcraft with international collectors across Europe and North America.

---

## 🏛️ Monorepo Architecture & Production Design

Aurora is organized as a unified, full-stack **Monorepo (`AURORA`)** containing both the backend and frontend modules:

```
AURORA/
├── backend/            # Spring Boot 3.3.4 (Java 17) REST API & Security Engine
│   ├── src/main/java/  # Layered Architecture: Controllers, Services, Repositories, Entities, DTOs
│   ├── src/main/resources/db/migration/ # Flyway SQL Migrations (V1 to V6)
│   ├── pom.xml
│   └── README.md
├── frontend/           # Angular 19 Standalone Signals Storefront & Admin Portal
│   ├── src/app/        # Core, Features (Landing, Catalog, PDP, Cart, Checkout, Admin), Shared
│   ├── tailwind.config.js
│   ├── package.json
│   └── README.md
├── docker-compose.yml  # Local PostgreSQL 16 infrastructure
└── README.md
```

### Why a Single Unified Repository?
1. **Atomic Full-Stack Commits:** API DTO changes in Spring Boot and their corresponding TypeScript models/services in Angular are committed in lockstep, eliminating API drift.
2. **Simplified CI/CD:** Modern platforms (Vercel, Netlify, Railway, Render, Docker) natively support monorepos by specifying the target directory (`frontend` or `backend`).
3. **Streamlined Local Development:** A single repository clone provisions the complete developer environment, unified Git history, and issue tracking.

---

## 🛠️ Technology Stack

- **Backend:** Java 17, Spring Boot 3.3.4, Spring Security 6 (Stateless JWT + Google OAuth2), Spring Data JPA, Hibernate, PostgreSQL 16, Flyway Migrations (V1 - V6).
- **Frontend:** Angular 19 (Standalone Components, Signals & Reactive Forms, Tailwind CSS artisanal luxury theme).
- **Catalog Domain:** Exclusively handcrafted Tunisian wooden masks in 3 standardized lineage categories: **Abstract**, **Animals**, and **People**.
- **Cart Persistence:** Account-bound, database-backed shopping cart (`carts` & `cart_items`) with automatic multi-device synchronization.
- **Media System:** Multi-angle mask photography uploads, interactive thumbnail preview grid, and a collector fullscreen lightbox modal.
- **Payments:** Stripe Checkout Sessions (EUR/USD multi-currency support, automated webhooks, Wise payout routing metadata).

---

## 🚀 Quick Start Guide

### 1. Database Infrastructure
```bash
docker compose up -d
```
PostgreSQL 16 runs on port `5432` with database `aurora_db`.

### 2. Spring Boot Backend
```bash
cd backend
mvn spring-boot:run
```
- API Endpoint: `http://localhost:8080/api`
- OpenAPI Swagger UI: `http://localhost:8080/swagger-ui.html`
- Google OAuth Endpoint: `http://localhost:8080/oauth2/authorization/google`

### 3. Angular Frontend
```bash
cd frontend
npm install
npm start
```
- Storefront UI: `http://localhost:4200`
- API Proxy: Automatically forwards `/api` and `/uploads` to port `8080`.

---

## 🚢 Production Deployment

### Frontend (Vercel / Netlify / Cloudflare Pages)
- **Git Repository:** `https://github.com/chedilandolsi/AURORA.git`
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist/frontend` (or `dist/frontend/browser`)
- **Environment Variable:** `API_URL=https://api.yourdomain.com/api`

### Backend (Render / Railway / Fly.io / AWS ECS)
- **Git Repository:** `https://github.com/chedilandolsi/AURORA.git`
- **Root Directory:** `backend`
- **Build Command:** `mvn clean package -DskipTests`
- **Start Command:** `java -jar target/aurora-backend-1.0.0-SNAPSHOT.jar`
- **Environment Variables:** Provide production `SPRING_DATASOURCE_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `STRIPE_API_KEY`, and `STRIPE_WEBHOOK_SECRET`.
