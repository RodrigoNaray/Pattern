package com.sistemapedidos.modules.configuracion.dto;

import jakarta.validation.constraints.Min;

public record ConfigurarTiendaDto(
        String nombreTienda,
        String whatsappContacto,
        String banco,
        String cbu,
        String alias,
        String titular,
        String mensajeTransferencia,
        @Min(value = 1, message = "Las horas de vencimiento deben ser al menos 1") Integer pedidoVencimientoHoras,
        Boolean estadoProductoBorrador) {
}
