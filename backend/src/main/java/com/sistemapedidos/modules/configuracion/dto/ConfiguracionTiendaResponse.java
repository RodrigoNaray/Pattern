package com.sistemapedidos.modules.configuracion.dto;

import java.time.LocalDateTime;

public record ConfiguracionTiendaResponse(
        String id,
        String nombreTienda,
        String whatsappContacto,
        String banco,
        String cbu,
        String alias,
        String titular,
        String mensajeTransferencia,
        int pedidoVencimientoHoras,
        boolean estadoProductoBorrador,
        LocalDateTime actualizadoEn) {

    public record ConfiguracionPublica(String nombreTienda, String whatsappContacto) {
    }
}
