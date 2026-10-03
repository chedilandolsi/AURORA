# Aurora - Spring Boot 3 Backend

Aurora is the enterprise e-commerce API for handcrafted Tunisian wooden masks, serving international collectors across Europe and North America.

## Tech Stack
- **Framework:** Spring Boot 3.3.4 (Java 17)
- **Security:** Spring Security 6, JWT (HMAC-SHA256), Google OAuth2 Client (`oauth2Login`)
- **Persistence:** Spring Data JPA, Hibernate, PostgreSQL
- **Migrations:** Flyway (`V1` to `V5` automated schema & seed migrations)
- **Payment Processing:** Stripe Java SDK (Checkout Sessions, Webhooks, Wise automated payout metadata)
- **Documentation:** OpenAPI 3.0 / Swagger UI (`/swagger-ui.html`)
- **File Management:** Multi-part concurrent image uploads for multi-angle mask photography

## Setup & Running

### Prerequisites
- Java 17+
- Maven 3.8+
- PostgreSQL 15+

### Configuration
Copy `.env.example` to `.env` or set environment variables:
```bash
cp .env.example .env
```

### Build & Run
```bash
mvn clean compile
mvn spring-boot:run
```

The API will start at `http://localhost:8080`.
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- Google OAuth Endpoint: `http://localhost:8080/oauth2/authorization/google`
