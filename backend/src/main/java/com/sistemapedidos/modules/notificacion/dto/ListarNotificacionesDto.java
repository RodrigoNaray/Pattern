package com.sistemapedidos.modules.notificacion.dto;

import jakarta.validation.constraints.Pattern;

public record ListarNotificacionesDto(
        @Pattern(regexp = "all|unread", message = "El filtro debe ser 'all' o 'unread'") String filtro) {
}
