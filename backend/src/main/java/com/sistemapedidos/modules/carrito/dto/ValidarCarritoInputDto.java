package com.sistemapedidos.modules.carrito.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record ValidarCarritoInputDto(
        @NotNull(message = "Los items son obligatorios")
        @NotEmpty(message = "El carrito esta vacio")
        @Valid List<ItemInput> items) {

    public record ItemInput(
            @NotBlank(message = "El ID del producto es obligatorio") String productoId,
            @NotBlank(message = "El nombre del producto es obligatorio") String nombre,
            @NotBlank(message = "El talle del producto es obligatorio") String talle,
            @NotNull(message = "El precio unitario es obligatorio") Integer precioCentavos,
            @NotNull(message = "La cantidad es obligatoria") Integer cantidad,
            @NotNull(message = "El subtotal es obligatorio") Integer subtotalCentavos) {
    }
}
