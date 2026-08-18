package com.sistemapedidos.modules.carrito;

import com.sistemapedidos.modules.carrito.dto.ActualizarCarritoDto;
import com.sistemapedidos.modules.carrito.dto.AgregarCarritoDto;
import com.sistemapedidos.modules.carrito.dto.CarritoItemResumen;
import com.sistemapedidos.modules.carrito.dto.ValidarCarritoInputDto;
import com.sistemapedidos.modules.carrito.dto.ValidarCarritoResult;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/carrito")
@RequiredArgsConstructor
public class CarritoController {

    private final CarritoService carritoService;

    @PostMapping("/agregar")
    public CarritoItemResumen.AgregarAlCarritoResponse agregarAlCarrito(@Valid @RequestBody AgregarCarritoDto dto) {
        return carritoService.agregarAlCarrito(dto);
    }

    @PostMapping("/validar")
    public ValidarCarritoResult validarCarrito(@Valid @RequestBody ValidarCarritoInputDto dto) {
        return carritoService.validarCarrito(dto.items());
    }

    @PatchMapping("/items/{productoId}")
    public CarritoItemResumen actualizarCantidad(@PathVariable String productoId,
                                                 @Valid @RequestBody ActualizarCarritoDto dto) {
        return carritoService.actualizarCantidad(productoId, dto.cantidad());
    }

    @DeleteMapping("/items/{productoId}")
    public Map<String, Object> eliminarDelCarrito(@PathVariable String productoId) {
        return carritoService.eliminarDelCarrito(productoId);
    }
}
