package com.sistemapedidos.modules.producto.dto;

import com.sistemapedidos.modules.producto.TallesConstants;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ActualizarProductoDto(
        @Size(min = 3, message = "El nombre debe tener al menos 3 caracteres")
        @Size(max = 255) String nombre,
        String descripcion,
        @Pattern(regexp = TallesConstants.TALLES_REGEX, message = "Seleccione un talle valido") String talle,
        @Min(value = 1, message = "El precio debe ser mayor a cero") Long precioCentavos,
        @Min(value = 0) Integer stock) {
}
