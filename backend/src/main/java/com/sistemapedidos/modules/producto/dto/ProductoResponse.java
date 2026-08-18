package com.sistemapedidos.modules.producto.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ProductoResponse(
        String id,
        String nombre,
        String descripcion,
        String talle,
        long precioCentavos,
        int stock,
        List<String> imagenes,
        boolean activo,
        LocalDateTime creadoEn,
        LocalDateTime actualizadoEn) {
}
