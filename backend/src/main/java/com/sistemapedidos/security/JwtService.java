package com.sistemapedidos.security;

import com.sistemapedidos.common.config.AppProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey key;
    private final Duration expiresIn;

    public JwtService(AppProperties properties) {
        this.key = Keys.hmacShaKeyFor(hashClave(properties.getJwtSecret()));
        this.expiresIn = properties.getJwtExpiresIn();
    }

    public String generarToken(String id, String email, String rol) {
        Instant ahora = Instant.now();
        return Jwts.builder()
                .subject(id)
                .claim("email", email)
                .claim("rol", rol)
                .issuedAt(Date.from(ahora))
                .expiration(Date.from(ahora.plus(expiresIn)))
                .signWith(key)
                .compact();
    }

    public Claims parsear(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private byte[] hashClave(String secreto) {
        try {
            return MessageDigest.getInstance("SHA-256")
                    .digest(secreto.getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 no disponible", e);
        }
    }
}
