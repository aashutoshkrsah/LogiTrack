package com.project.logistics.security;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Demo / small-deployment user store. Users are seeded from environment
 * variables (APP_AUTH_ADMIN_PASSWORD etc.) with safe demo defaults; the
 * password is BCrypt-hashed in memory at startup and never stored plain.
 * This is NOT a production identity system — see README / CHANGELOG_PRO.md.
 */
@Service
public class DemoUserService {

    public record DemoUser(String email, String name, String role, String passwordHash) {
    }

    private final Map<String, DemoUser> users = new LinkedHashMap<>();
    private final PasswordEncoder encoder = new BCryptPasswordEncoder();

    public DemoUserService(
            @Value("${app.auth.admin-email:admin@logitrack.in}") String adminEmail,
            @Value("${app.auth.admin-password:Admin@123}") String adminPassword,
            @Value("${app.auth.admin-name:Admin User}") String adminName,
            @Value("${app.auth.dispatcher-email:dispatcher@logitrack.in}") String dispatcherEmail,
            @Value("${app.auth.dispatcher-password:Dispatch@123}") String dispatcherPassword,
            @Value("${app.auth.dispatcher-name:Dispatch Operator}") String dispatcherName,
            @Value("${app.auth.viewer-email:viewer@logitrack.in}") String viewerEmail,
            @Value("${app.auth.viewer-password:View@123}") String viewerPassword,
            @Value("${app.auth.viewer-name:Read-only Viewer}") String viewerName) {
        add(adminEmail, adminName, "ADMIN", adminPassword);
        add(dispatcherEmail, dispatcherName, "DISPATCHER", dispatcherPassword);
        add(viewerEmail, viewerName, "VIEWER", viewerPassword);
    }

    private void add(String email, String name, String role, String rawPassword) {
        users.put(email.toLowerCase(), new DemoUser(email.toLowerCase(), name, role, encoder.encode(rawPassword)));
    }

    public Optional<DemoUser> findByEmail(String email) {
        return Optional.ofNullable(email == null ? null : users.get(email.toLowerCase().trim()));
    }

    public boolean matches(DemoUser user, String rawPassword) {
        return encoder.matches(rawPassword, user.passwordHash());
    }
}
