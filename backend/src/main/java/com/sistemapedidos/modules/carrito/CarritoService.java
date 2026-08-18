package com.sistemapedidos.modules.carrito;

import com.sistemapedidos.common.error.BadRequestException;
import com.sistemapedidos.common.error.NotFoundException;
import com.sistemapedidos.domain.entity.Producto;
import com.sistemapedidos.domain.repository.ProductoRepository;
import com.sistemapedidos.modules.carrito.dto.AgregarCarritoDto;
import com.sistemapedidos.modules.carrito.dto.CarritoItemResumen;
import com.sistemapedidos.modules.carrito.dto.ValidarCarritoInputDto;
import com.sistemapedidos.modules.carrito.dto.ValidarCarritoResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CarritoService {

    private final ProductoRepository productoRepository;

    @Transactional(readOnly = true)
    public CarritoItemResumen.AgregarAlCarritoResponse agregarAlCarrito(AgregarCarritoDto dto) {
        Producto producto = obtenerProducto(dto.productoId());

        if (dto.talle() != null && !dto.talle().isBlank() && !producto.getTalle().equals(dto.talle())) {
            throw new BadRequestException("El talle seleccionado no corresponde con el producto");
        }

        CarritoItemResumen item = validarYConvertirAResumen(producto, dto.cantidad());
        return new CarritoItemResumen.AgregarAlCarritoResponse("Producto agregado al carrito", List.of(item));
    }

    @Transactional(readOnly = true)
    public ValidarCarritoResult validarCarrito(List<ValidarCarritoInputDto.ItemInput> itemsCarrito) {
        List<ValidarCarritoResult.CarritoItemValidado> itemsValidados = new ArrayList<>();
        boolean hayStockInsuficiente = false;

        for (ValidarCarritoInputDto.ItemInput itemCarrito : itemsCarrito) {
            Optional<Producto> opcional = productoRepository.findByIdAndActivoTrue(itemCarrito.productoId());
            if (opcional.isEmpty()) {
                continue;
            }
            Producto producto = opcional.get();

            boolean stockInsuficiente = itemCarrito.cantidad() > producto.getStock();
            if (stockInsuficiente) {
                hayStockInsuficiente = true;
            }

            itemsValidados.add(new ValidarCarritoResult.CarritoItemValidado(
                    producto.getId(),
                    producto.getNombre(),
                    producto.getTalle(),
                    producto.getPrecioCentavos(),
                    itemCarrito.cantidad(),
                    producto.getPrecioCentavos() * itemCarrito.cantidad(),
                    producto.getStock(),
                    stockInsuficiente));
        }

        long total = itemsValidados.stream()
                .mapToLong(ValidarCarritoResult.CarritoItemValidado::subtotalCentavos)
                .sum();

        return new ValidarCarritoResult(itemsValidados, total, hayStockInsuficiente);
    }

    @Transactional(readOnly = true)
    public CarritoItemResumen actualizarCantidad(String productoId, int cantidad) {
        Producto producto = obtenerProducto(productoId);
        return validarYConvertirAResumen(producto, cantidad);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> eliminarDelCarrito(String productoId) {
        obtenerProducto(productoId);
        return Map.of("mensaje", "Producto eliminado del carrito", "carrito", List.of());
    }

    private CarritoItemResumen validarYConvertirAResumen(Producto producto, int cantidad) {
        if (cantidad <= 0) {
            throw new BadRequestException("La cantidad debe ser mayor a cero");
        }
        if (cantidad > producto.getStock()) {
            throw new BadRequestException("Stock insuficiente");
        }
        return new CarritoItemResumen(
                producto.getId(),
                producto.getNombre(),
                producto.getTalle(),
                producto.getPrecioCentavos(),
                cantidad,
                producto.getPrecioCentavos() * cantidad);
    }

    private Producto obtenerProducto(String productoId) {
        return productoRepository.findById(productoId)
                .orElseThrow(() -> new NotFoundException("Producto con ID " + productoId + " no encontrado"));
    }
}
