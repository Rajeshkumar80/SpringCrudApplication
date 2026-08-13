package com.example.Product.service;

import com.github.benmanes.caffeine.cache.Cache;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Optional;

/**
 * Caches AI endpoint responses keyed on (endpoint, normalized-input-hash)
 * with a 10-minute TTL, so repeated identical questions skip Ollama.
 */
@Service
public class AiCacheService {

    private final Cache<String, Object> cache;

    public AiCacheService(Cache<String, Object> aiResponseCache) {
        this.cache = aiResponseCache;
    }

    public String key(String endpoint, String rawInput) {
        return endpoint + ":" + sha256(normalize(rawInput));
    }

    public Optional<Object> get(String key) {
        return Optional.ofNullable(cache.getIfPresent(key));
    }

    public void put(String key, Object value) {
        cache.put(key, value);
    }

    private String normalize(String input) {
        return input == null ? "" : input.trim().toLowerCase().replaceAll("\\s+", " ");
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }
}
