package com.example.Product.config;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

/**
 * Caffeine-backed response cache for AI endpoints.
 * Entries expire 10 minutes after write to keep LLM results fresh.
 */
@Configuration
public class CacheConfig {

    @Bean
    public Cache<String, Object> aiResponseCache() {
        return Caffeine.newBuilder()
                .maximumSize(1000)
                .expireAfterWrite(Duration.ofMinutes(10))
                .build();
    }
}
