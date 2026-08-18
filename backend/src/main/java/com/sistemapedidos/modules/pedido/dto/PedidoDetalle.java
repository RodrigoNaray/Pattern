package com.sistemapedidos.modules.pedido.dto;

import java.time.LocalDateTime;
import java.util.List;

public record PedidoDetalle(
        String id,
        String codigo,
        String emailComprador,
        String telefonoComprador,
        String estado,
        long totalCentavos,
        LocalDateTime creadoEn,
        LocalDateTime confirmadoEn,
        LocalDateTime vencidoEn,
        List<Item> items) {

    public record Item(
            String id,
            String productoId,
            int cantidad,
            long precioUnitarioCentavos,
            long subtotalCentavos,
            Producto producto) {

        public record Producto(String nombre, String talle) {
        }
    }
}
