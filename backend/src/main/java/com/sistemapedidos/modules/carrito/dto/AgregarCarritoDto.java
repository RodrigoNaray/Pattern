package com.sistemapedidos.modules.carrito.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AgregarCarritoDto(
        @NotBlank(message = "El ID del producto es obligatorio") String productoId,
        @NotNull(message = "La cantidad es obligatoria")
        @Min(value = 1, message = "La cantidad debe ser mayor a cero") Integer cantidad,
        String talle) {
}
