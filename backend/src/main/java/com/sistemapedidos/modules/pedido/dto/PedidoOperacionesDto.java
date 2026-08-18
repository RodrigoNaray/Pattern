package com.sistemapedidos.modules.pedido.dto;

import java.time.LocalDateTime;
import java.util.List;

public record PedidoOperacionesDto() {

    public record CreatePedidoResponse(String mensaje, CreatePedidoResult pedido) {
    }

    public record CreatePedidoResult(
            String id,
            String codigo,
            String emailComprador,
            String telefonoComprador,
            String estado,
            long totalCentavos,
            List<Item> items,
            LocalDateTime creadoEn,
            LocalDateTime vencidoEn) {

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

    public record ConfirmarPagoResult(
            String id,
            String codigo,
            String estado,
            LocalDateTime confirmadoEn,
            long totalCentavos) {
    }

    public record CancelarPedidoResult(
            String id,
            String codigo,
            String estado,
            long totalCentavos) {
    }

    public record CancelarPedidoResponse(String mensaje, CancelarPedidoResult pedido) {
    }

    public record PaginadoPedidosPendientes(
            List<PedidoPendienteDto> pedidos,
            long total,
            int pagina,
            int tamano) {
    }

    public record PedidoPendienteDto(
            String id,
            String codigo,
            String emailComprador,
            String telefonoComprador,
            long totalCentavos,
            LocalDateTime creadoEn,
            LocalDateTime vencidoEn,
            int itemsCount) {
    }
}
