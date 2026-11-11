package com.project.logistics.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/** Validates a Bearer JWT when present. Never clears an existing authentication
 *  (so @WithMockUser works in tests and no-token requests simply stay anonymous). */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final DemoUserService demoUserService;

    public JwtAuthFilter(JwtUtil jwtUtil, DemoUserService demoUserService) {
        this.jwtUtil = jwtUtil;
        this.demoUserService = demoUserService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ") && SecurityContextHolder.getContext().getAuthentication() == null) {
            String token = header.substring(7);
            try {
                Claims claims = jwtUtil.parseClaims(token);
                String email = claims.getSubject();
                if (email != null && jwtUtil.isValid(token, email)) {
                    String role = claims.get("role", String.class);
                    if (role == null) {
                        role = "VIEWER";
                    }
                    String name = claims.get("name", String.class);
                    if (name == null) {
                        name = email;
                    }
                    DemoUserService.DemoUser user = demoUserService.findByEmail(email).orElse(null);
                    String displayName = user != null ? user.name() : name;
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            email, null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + role)));
                    auth.setDetails(displayName);
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (Exception ignored) {
                // Invalid/expired token: leave anonymous; the authorization rule returns 401.
            }
        }
        chain.doFilter(request, response);
    }
}
