package com.project.logistics.controller;

import com.project.logistics.dto.AuthUserResponse;
import com.project.logistics.dto.LoginRequest;
import com.project.logistics.dto.LoginResponse;
import com.project.logistics.security.DemoUserService;
import com.project.logistics.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final DemoUserService demoUserService;
    private final JwtUtil jwtUtil;

    public AuthController(DemoUserService demoUserService, JwtUtil jwtUtil) {
        this.demoUserService = demoUserService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        DemoUserService.DemoUser user = demoUserService.findByEmail(request.getEmail())
                .filter(u -> demoUserService.matches(u, request.getPassword()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "Invalid email or password."));
        String token = jwtUtil.generateToken(user.email(), user.name(), user.role());
        return ResponseEntity.ok(new LoginResponse(token, user.email(), user.name(), user.role(),
                jwtUtil.getExpirationSeconds()));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthUserResponse> me(Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated.");
        }
        String email = String.valueOf(authentication.getPrincipal());
        DemoUserService.DemoUser user = demoUserService.findByEmail(email).orElse(null);
        String name = user != null ? user.name()
                : (authentication.getDetails() instanceof String s ? s : email);
        String role = authentication.getAuthorities().stream().findFirst()
                .map(a -> a.getAuthority().replace("ROLE_", "")).orElse("VIEWER");
        return ResponseEntity.ok(new AuthUserResponse(email, name, role));
    }
}
