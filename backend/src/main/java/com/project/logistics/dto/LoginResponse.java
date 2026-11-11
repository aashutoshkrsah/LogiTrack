package com.project.logistics.dto;

public class LoginResponse {

    private String token;
    private String tokenType = "Bearer";
    private String email;
    private String name;
    private String role;
    private long expiresInSeconds;

    public LoginResponse() {
    }

    public LoginResponse(String token, String email, String name, String role, long expiresInSeconds) {
        this.token = token;
        this.email = email;
        this.name = name;
        this.role = role;
        this.expiresInSeconds = expiresInSeconds;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public long getExpiresInSeconds() { return expiresInSeconds; }
    public void setExpiresInSeconds(long expiresInSeconds) { this.expiresInSeconds = expiresInSeconds; }
}
