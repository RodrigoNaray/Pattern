package com.sistemapedidos.modules.producto.dto;

import java.util.List;

public record PaginadoProductos(
        List<ProductoResponse> productos,
        long total,
        int pagina,
        int tamano) {
}
