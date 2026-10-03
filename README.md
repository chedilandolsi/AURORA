# Aurora — Artisanal Tunisian Decor & Handcrafted Wooden Masks

> **Production-Grade E-Commerce Platform** connecting ancestral North African woodcraft with international discerning collectors across Europe and North America.

---

## 🏛️ System Architecture

Aurora is engineered with an **API-First Clean Architecture Monolith**:
- **Backend**: Java 17, Spring Boot 3.3.4, Spring Security 6 (Stateless JWT + Google OAuth2), Spring Data JPA, Hibernate, Flyway Migrations.
- **Frontend**: Angular (Standalone Components, Signals, Reactive Forms, Tailwind CSS artisanal luxury aesthetic).
- **Database**: PostgreSQL 16 with UUID primary keys, relational constraints, and connection pooling via HikariCP.
- **Payments**: Stripe Java SDK integrating server-side Stripe Checkout Sessions (EUR/USD multi-currency support, automated webhooks, Wise payout routing metadata).

---

## 🚀 Quick Start Guide

### 1. Start PostgreSQL with Docker
```bash
docker compose up -d
```
PostgreSQL will run on port `5432` with database `aurora_db`.

### 2. Run the Spring Boot Backend
```bash
cd backend
mvn spring-boot:run
```
- Flyway automatically applies migrations `V1__initial_schema.sql` and `V2__seed_artisan_catalog.sql`.
- REST API: `http://localhost:8080/api`
- OpenAPI Swagger UI: `http://localhost:8080/swagger-ui.html`

### 3. Run the Angular Frontend
```bash
cd frontend
npm start
```
- Frontend UI: `http://localhost:4200`

---

## 🔒 Security & Auth Architecture
- **Stateless JWT**: Secure token generation with HMAC-SHA256 (`io.jsonwebtoken 0.12.6`).
- **Google OAuth2**: One-click social authentication linked to internal customer profiles.
- **BCrypt Hashing**: Work factor 10 password hashing.
- **CORS**: Configured for local development and production origins.

---

## 💳 Payment & Fulfillment Workflow
1. Customer selects currency (**EUR** or **USD**).
2. Backend generates a pending `Order` record and initializes a **Stripe Checkout Session**.
3. Customer completes payment via credit card, Apple Pay, Google Pay, or European local payment methods.
4. Stripe Webhook (`POST /api/payments/webhook`) validates the signature and automatically settles the order to `PAID`, reserving inventory and initiating DHL Express dispatch from the atelier in Tunisia.
