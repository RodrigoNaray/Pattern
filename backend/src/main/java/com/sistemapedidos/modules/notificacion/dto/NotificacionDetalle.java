package com.sistemapedidos.modules.notificacion.dto;

import java.time.LocalDateTime;

public record NotificacionDetalle(
        NotificacionDto notificacion,
        PedidoResumido pedido) {

    public record NotificacionDto(
            String id,
            String canal,
            String mensaje,
            boolean leida,
            LocalDateTime creadoEn,
            String pedidoId) {
    }

    public record PedidoResumido(
            String id,
            String emailComprador,
            String telefonoComprador,
            String estado,
            long totalCentavos,
            String codigo,
            LocalDateTime creadoEn,
            LocalDateTime confirmadoEn,
            LocalDateTime vencidoEn) {
    }
}
