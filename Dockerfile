# ==============================================================================
# Aurora Full-Stack / Backend Production Multi-Stage Dockerfile
# Optimized for free container tiers (Render / Railway) with 512MB RAM cap
# ==============================================================================

# Stage 1: Build Spring Boot 3 Backend
FROM maven:3.9.6-eclipse-temurin-17-alpine AS backend-builder
WORKDIR /workspace

COPY backend/pom.xml .
RUN mvn dependency:go-offline -B

COPY backend/src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal Production JRE Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN apk add --no-cache curl tzdata

RUN addgroup -S aurora && adduser -S aurora -G aurora && \
    mkdir -p /app/uploads/products /app/uploads/simulations && \
    chown -R aurora:aurora /app

USER aurora:aurora

COPY --from=backend-builder --chown=aurora:aurora /workspace/target/aurora-backend-*.jar app.jar

ENV JAVA_OPTS="-Xmx256m -Xms128m -XX:+UseSerialGC -Djava.security.egd=file:/dev/./urandom"
ENV SPRING_PROFILES_ACTIVE=prod
ENV PORT=8080
ENV UPLOAD_DIR=/app/uploads/products

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD curl -f http://localhost:${PORT}/swagger-ui.html || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
