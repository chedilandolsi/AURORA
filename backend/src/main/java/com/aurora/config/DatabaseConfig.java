package com.aurora.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
@Slf4j
public class DatabaseConfig {

    @Value("${DATABASE_URL:#{null}}")
    private String databaseUrl;

    @Value("${spring.datasource.url:#{null}}")
    private String springDatasourceUrl;

    @Value("${spring.datasource.username:#{null}}")
    private String springDatasourceUsername;

    @Value("${spring.datasource.password:#{null}}")
    private String springDatasourcePassword;

    @Value("${spring.datasource.hikari.maximum-pool-size:10}")
    private int maxPoolSize;

    @Value("${spring.datasource.hikari.minimum-idle:2}")
    private int minIdle;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setPoolName("AuroraHikariPool");
        config.setMaximumPoolSize(maxPoolSize);
        config.setMinimumIdle(minIdle);
        config.setIdleTimeout(300000);
        config.setConnectionTimeout(20000);
        config.setMaxLifetime(1200000);
        config.addDataSourceProperty("prepareThreshold", "0");

        String effectiveUrl = (databaseUrl != null && !databaseUrl.isBlank()) ? databaseUrl : springDatasourceUrl;

        if (effectiveUrl != null && (effectiveUrl.startsWith("postgres://") || effectiveUrl.startsWith("postgresql://"))) {
            log.info("Configuring DataSource from external DATABASE_URL (Cloud Neon/Supabase/Render/Railway)");
            try {
                String cleanUriString = effectiveUrl;
                if (cleanUriString.startsWith("postgresql://")) {
                    cleanUriString = "postgres://" + cleanUriString.substring("postgresql://".length());
                }

                URI dbUri = new URI(cleanUriString);
                String userInfo = dbUri.getUserInfo();
                String username = springDatasourceUsername;
                String password = springDatasourcePassword;

                if (userInfo != null && userInfo.contains(":")) {
                    String[] userParts = userInfo.split(":", 2);
                    username = userParts[0];
                    password = userParts[1];
                } else if (userInfo != null) {
                    username = userInfo;
                }

                String host = dbUri.getHost();
                int port = dbUri.getPort() == -1 ? 5432 : dbUri.getPort();
                String path = dbUri.getPath();
                String query = dbUri.getQuery();

                StringBuilder jdbcUrl = new StringBuilder();
                jdbcUrl.append("jdbc:postgresql://").append(host).append(":").append(port).append(path);

                if (query != null && !query.isBlank()) {
                    jdbcUrl.append("?").append(query);
                    if (!query.contains("prepareThreshold")) {
                        jdbcUrl.append("&prepareThreshold=0");
                    }
                } else {
                    // Require SSL by default for cloud hosted databases
                    jdbcUrl.append("?sslmode=require&prepareThreshold=0");
                }

                config.setJdbcUrl(jdbcUrl.toString());
                config.setUsername(username);
                config.setPassword(password);
                config.setDriverClassName("org.postgresql.Driver");

                log.info("Successfully configured HikariDataSource for {}:{} (DB: {})", host, port, path);
                return new HikariDataSource(config);
            } catch (Exception e) {
                log.error("Failed to parse DATABASE_URL URI, falling back to standard JDBC parameters: {}", e.getMessage());
            }
        }

        // Standard JDBC URL or local development fallback
        log.info("Configuring DataSource from standard JDBC URL");
        config.setJdbcUrl(springDatasourceUrl != null ? springDatasourceUrl : "jdbc:postgresql://localhost:5432/aurora_db");
        config.setUsername(springDatasourceUsername != null ? springDatasourceUsername : "aurora_user");
        config.setPassword(springDatasourcePassword != null ? springDatasourcePassword : "aurora_secure_password_2026");
        config.setDriverClassName("org.postgresql.Driver");

        return new HikariDataSource(config);
    }
}
