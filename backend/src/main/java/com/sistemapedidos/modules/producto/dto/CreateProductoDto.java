package com.sistemapedidos.modules.producto.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateProductoDto(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(min = 3, message = "El nombre debe tener al menos 3 caracteres")
        @Size(max = 255) String nombre,
        String descripcion,
        @NotBlank(message = "El talle es obligatorio") String talle,
        @NotNull(message = "El precio es obligatorio")
        @Min(value = 1, message = "El precio debe ser mayor a cero") Long precioCentavos,
        @NotNull(message = "El stock es obligatorio")
        @Min(value = 0) Integer stock,
        List<String> imagenes,
        Boolean activo) {
}
