package com.example.Product.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Issues and verifies HS256 JWTs.
 * Expiry and secret come from configuration and can be
 * overridden via the JWT_SECRET / JWT_EXPIRATION_MS env vars.
 */
@Service
public class JwtService {

    // Mirrors the default in application.properties; guards against an empty
    // JWT_SECRET env var overriding the ${JWT_SECRET:...} fallback with "".
    private static final String DEFAULT_SECRET = "OB/OiiculTHXfYAeznVX1gikZPY2oSs9s6oi0LuqsCnEz4rIVAq5kCfLGVVK1J+mNtrJU7Mukpon86IOFOJqyw==";

    private final SecretKey key;
    private final long expirationMs;

    public JwtService(@Value("${jwt.secret}") String secret,
                      @Value("${jwt.expiration-ms}") long expirationMs) {
        String resolved = (secret == null || secret.isBlank()) ? DEFAULT_SECRET : secret;
        this.key = Keys.hmacShaKeyFor(resolved.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(String username, String role) {
        Date now = new Date();
        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs))
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return parseClaims(token).get("role", String.class);
    }

    public boolean isValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
