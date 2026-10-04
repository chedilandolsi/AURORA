package com.aurora;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;

@EnableAsync
@SpringBootApplication
public class AuroraApplication {

    public static void main(String[] args) {
        loadDotenv();
        SpringApplication.run(AuroraApplication.class, args);
    }

    private static void loadDotenv() {
        File[] candidateFiles = new File[]{
                new File(".env"),
                new File("../.env")
        };

        for (File envFile : candidateFiles) {
            if (envFile.exists() && envFile.isFile()) {
                try (BufferedReader reader = new BufferedReader(new FileReader(envFile))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) {
                            continue;
                        }
                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String value = line.substring(eqIdx + 1).trim();
                            if ((value.startsWith("\"") && value.endsWith("\"")) ||
                                (value.startsWith("'") && value.endsWith("'"))) {
                                value = value.substring(1, value.length() - 1);
                            }
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, value);
                            }
                        }
                    }
                    System.out.println("[AuroraApplication] Successfully loaded local environment from: " + envFile.getAbsolutePath());
                    break;
                } catch (IOException e) {
                    System.err.println("[AuroraApplication] Warning: could not read .env file: " + e.getMessage());
                }
            }
        }
    }
}
