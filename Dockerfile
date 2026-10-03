# ==============================================================================
# Aurora Artisanal E-Commerce - Production Multi-Stage Dockerfile
# ==============================================================================

# Stage 1: Build Angular 17 Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build -- --configuration=production

# Stage 2: Build Spring Boot 3 Backend
FROM maven:3.9.6-eclipse-temurin-17 AS backend-builder
WORKDIR /app/backend
COPY backend/pom.xml ./
RUN mvn dependency:go-offline -B
COPY backend/src ./src
# Copy built Angular static assets into Spring Boot's static resources folder
COPY --from=frontend-builder /app/frontend/dist/frontend/browser/ ./src/main/resources/static/
RUN mvn clean package -DskipTests

# Stage 3: Lightweight Production JRE Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Security: Non-root user
RUN addgroup -S aurora && adduser -S aurora -G aurora
USER aurora:aurora

COPY --from=backend-builder --chown=aurora:aurora /app/backend/target/aurora-backend-*.jar app.jar

ENV SPRING_PROFILES_ACTIVE=prod
ENV PORT=8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/categories || exit 1

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
