package com.example.Product.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    @Test
    void blankSecretFallsBackToDefaultKey() {
        JwtService jwtService = new JwtService("", 86400000L);

        String token = jwtService.generateToken("admin", "ADMIN");

        assertTrue(jwtService.isValid(token));
        assertEquals("admin", jwtService.extractUsername(token));
        assertEquals("ADMIN", jwtService.extractRole(token));
    }

    @Test
    void customSecretIsUsedWhenProvided() {
        JwtService jwtService = new JwtService("a-custom-secret-that-is-long-enough-for-hs256-signing", 86400000L);

        String token = jwtService.generateToken("viewer", "VIEWER");

        assertTrue(jwtService.isValid(token));
        assertEquals("viewer", jwtService.extractUsername(token));
    }
}