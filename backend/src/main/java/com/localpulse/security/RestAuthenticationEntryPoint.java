package com.localpulse.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;

/**
 * Ensures unauthenticated requests to protected endpoints get a clean 401
 * JSON body instead of Spring Security's default 403 (which is meant for
 * form-login apps that don't apply here since this API is stateless/JWT).
 */
@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                          AuthenticationException authException) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        String path = request.getRequestURI().replace("\"", "\\\"");
        String json = """
                {"timestamp":"%s","status":401,"error":"Unauthorized","message":"Authentication required. Please verify OTP first.","path":"%s","details":[]}""".formatted(Instant.now(), path);
        response.getWriter().write(json);
    }
}
