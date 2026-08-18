package com.sistemapedidos.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginAdminDto(
        @NotBlank(message = "El email es obligatorio") String email,
        @NotBlank(message = "La contrasena es obligatoria") String password) {
}
