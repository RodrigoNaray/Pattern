package com.sistemapedidos.modules.carrito.dto;

import java.util.List;

public record ValidarCarritoResult(
        List<CarritoItemValidado> items,
        long totalCentavos,
        boolean hayStockInsuficiente) {

    public record CarritoItemValidado(
            String productoId,
            String nombre,
            String talle,
            long precioCentavos,
            int cantidad,
            long subtotalCentavos,
            int stockDisponible,
            boolean stockInsuficiente) {
    }
}
