package com.sistemapedidos.modules.administrador.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordDto(
        @NotBlank(message = "La nueva contrasena es obligatoria")
        @Size(min = 8, message = "La nueva contrasena debe tener al menos 8 caracteres") String nuevaPassword) {
}
