package com.apex.judge.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private final String secretKey = "c2VjdXJlLXN1cGVyLXNlY3JldC1qd3Qta2V5LWZvci1hcGV4LWp1ZGdlLXByb2R1Y3Rpb24tbXVzdC1iZS0yNTYtYml0cw==";

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", secretKey);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 3600000L);
    }

    @Test
    @DisplayName("Should generate valid JWT token and extract subject")
    void testGenerateAndExtractUsername() {
        String username = "alex_coder";
        String token = jwtService.generateToken(username, "USER", "user-123");

        assertNotNull(token);
        assertFalse(token.isBlank());

        String extracted = jwtService.extractUsername(token);
        assertEquals(username, extracted);
    }

    @Test
    @DisplayName("Should validate token successfully for the matching user")
    void testValidateTokenSuccess() {
        String username = "admin";
        String token = jwtService.generateToken(username, "ADMIN", "user-admin");

        assertTrue(jwtService.isTokenValid(token, username));
        assertFalse(jwtService.isTokenValid(token, "other_user"));
    }
}
