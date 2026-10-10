# ==============================================================================
# Aurora Backend (Spring Boot 3) - Production Multi-Stage Dockerfile
# Optimized for free container tiers (Render / Railway) with 512MB RAM cap
# ==============================================================================

# Stage 1: Build JAR using Maven & Temurin 17
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /workspace

# Layer caching: download dependencies first
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Compile source code
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal Production JRE Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl tzdata

# Security: Non-privileged user and writable uploads directory
RUN addgroup -S aurora && adduser -S aurora -G aurora && \
    mkdir -p /app/uploads/products /app/uploads/simulations && \
    chown -R aurora:aurora /app
USER aurora:aurora

# Copy executable jar
COPY --from=builder --chown=aurora:aurora /workspace/target/aurora-backend-*.jar app.jar

# Production JVM ergonomics:
# - UseSerialGC minimizes GC memory overhead on <= 1 vCPU instances
# - MaxRAMPercentage=75.0 reserves 25% host RAM for off-heap, JVM metadata & thread stacks
# - ExitOnOutOfMemoryError ensures immediate fast restart on OOM
ENV JAVA_OPTS="-Xmx256m -Xms128m -XX:+UseSerialGC -Djava.security.egd=file:/dev/./urandom"
ENV SPRING_PROFILES_ACTIVE=prod
ENV PORT=8080

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD curl -f http://localhost:${PORT}/swagger-ui.html || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
