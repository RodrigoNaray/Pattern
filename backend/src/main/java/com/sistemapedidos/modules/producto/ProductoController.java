package com.sistemapedidos.modules.producto;

import com.sistemapedidos.modules.producto.dto.PaginadoProductos;
import com.sistemapedidos.modules.producto.dto.ProductoResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    @GetMapping
    public PaginadoProductos listar(@RequestParam(required = false) Boolean activo,
                                    @RequestParam(required = false) String talle,
                                    @RequestParam(required = false) String q,
                                    @RequestParam(defaultValue = "1") int pagina,
                                    @RequestParam(defaultValue = "20") int tamano) {
        return productoService.listar(activo, talle, q, pagina, tamano);
    }

    @GetMapping("/{id}")
    public ProductoResponse obtenerUno(@PathVariable String id) {
        return productoService.obtenerUno(id);
    }
}
