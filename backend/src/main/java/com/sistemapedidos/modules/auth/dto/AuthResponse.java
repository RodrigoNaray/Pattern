package com.sistemapedidos.modules.auth.dto;

public record AuthResponse(String accessToken, AdminBasic admin) {

    public record AdminBasic(String id, String nombre, String email) {
    }
}
