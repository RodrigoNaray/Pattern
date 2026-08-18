package com.sistemapedidos.modules.carrito.dto;

import java.util.List;

public record CarritoItemResumen(
        String productoId,
        String nombre,
        String talle,
        long precioCentavos,
        int cantidad,
        long subtotalCentavos) {

    public record AgregarAlCarritoResponse(String mensaje, List<CarritoItemResumen> carrito) {
    }
}
