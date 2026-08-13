package com.example.Product.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class AiCacheServiceTest {

    private AiCacheService cacheService;

    @BeforeEach
    void setUp() {
        cacheService = new AiCacheService(
                com.github.benmanes.caffeine.cache.Caffeine.newBuilder().build());
    }

    @Test
    void putAndGet_returnsStoredValue() {
        cacheService.put("nlquery:abc", "result-1");

        Optional<Object> result = cacheService.get("nlquery:abc");

        assertTrue(result.isPresent());
        assertEquals("result-1", result.get());
    }

    @Test
    void get_missingKeyReturnsEmpty() {
        assertTrue(cacheService.get("nlquery:nope").isEmpty());
    }

    @Test
    void key_isCaseInsensitiveAndWhitespaceNormalized() {
        String key1 = cacheService.key("nlquery", "  Show   Samsung Phones ");
        String key2 = cacheService.key("nlquery", "show samsung phones");

        assertEquals(key1, key2, "Normalized inputs must produce identical cache keys");
    }

    @Test
    void key_differsAcrossEndpoints() {
        assertNotEquals(cacheService.key("nlquery", "hello"),
                cacheService.key("chat", "hello"));
    }
}
