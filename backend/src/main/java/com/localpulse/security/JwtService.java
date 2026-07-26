package com.localpulse.security;

import com.localpulse.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

/**
 * Issues and validates JWTs for authenticated sellers. Buyers never need a
 * token since browsing/searching listings is fully anonymous.
 */
@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMinutes;

    @Autowired
    public JwtService(JwtProperties jwtProperties) {
        this.key = Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
        this.expirationMinutes = jwtProperties.getExpirationMinutes();
    }

    public String generateToken(Long sellerId, String phone) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(sellerId))
                .claim("phone", phone)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(expirationMinutes * 60)))
                .signWith(key)
                .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Long extractSellerId(String token) {
        return Long.valueOf(parseClaims(token).getSubject());
    }
}
