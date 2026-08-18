package com.sistemapedidos.modules.producto;

import com.sistemapedidos.common.error.BadRequestException;
import com.sistemapedidos.common.error.NotFoundException;
import com.sistemapedidos.domain.entity.Producto;
import com.sistemapedidos.domain.repository.ProductoRepository;
import com.sistemapedidos.modules.producto.dto.ActualizarProductoDto;
import com.sistemapedidos.modules.producto.dto.CreateProductoDto;
import com.sistemapedidos.modules.producto.dto.PaginadoProductos;
import com.sistemapedidos.modules.producto.dto.ProductoResponse;
import com.sistemapedidos.modules.producto.dto.PublicarProductoDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;

    @Transactional
    public ProductoResponse publicar(PublicarProductoDto dto, List<String> urlsImagenes) {
        if (urlsImagenes.isEmpty()) {
            throw new BadRequestException("Se requiere al menos una imagen");
        }

        Producto producto = new Producto();
        producto.setNombre(dto.nombre());
        producto.setDescripcion(dto.descripcion());
        producto.setTalle(dto.talle());
        producto.setPrecioCentavos(dto.precioCentavos());
        producto.setStock(dto.stock() != null ? dto.stock() : 0);
        producto.setImagenes(urlsImagenes);
        producto.setActivo(true);
        productoRepository.save(producto);

        return aRespuesta(producto);
    }

    @Transactional
    public ProductoResponse crear(CreateProductoDto dto) {
        Producto producto = new Producto();
        producto.setNombre(dto.nombre());
        producto.setTalle(dto.talle());
        producto.setPrecioCentavos(dto.precioCentavos());
        producto.setStock(dto.stock());
        producto.setDescripcion(dto.descripcion());
        producto.setImagenes(dto.imagenes() != null ? dto.imagenes() : List.of());
        producto.setActivo(dto.activo() != null ? dto.activo() : true);
        productoRepository.save(producto);

        return aRespuesta(producto);
    }

    @Transactional(readOnly = true)
    public PaginadoProductos listar(Boolean activo, String talle, String q, int pagina, int tamano) {
        int paginaSegura = Math.max(pagina, 1);
        int tamanoSeguro = Math.max(tamano, 1);

        Page<Producto> page = productoRepository.findAll(
                ProductoSpecifications.filtros(activo, talle, q),
                PageRequest.of(paginaSegura - 1, tamanoSeguro, Sort.by(Sort.Direction.DESC, "creadoEn")));

        List<ProductoResponse> productos = page.getContent().stream()
                .map(this::aRespuesta)
                .toList();

        return new PaginadoProductos(productos, page.getTotalElements(), paginaSegura, tamanoSeguro);
    }

    @Transactional(readOnly = true)
    public ProductoResponse obtenerUno(String id) {
        return aRespuesta(obtenerEntidad(id));
    }

    @Transactional
    public ProductoResponse actualizarAdmin(String id, ActualizarProductoDto dto, List<String> urlsNuevasImagenes) {
        Producto producto = obtenerEntidad(id);

        if (dto.nombre() != null) producto.setNombre(dto.nombre());
        if (dto.descripcion() != null) producto.setDescripcion(dto.descripcion());
        if (dto.talle() != null) producto.setTalle(dto.talle());
        if (dto.precioCentavos() != null) producto.setPrecioCentavos(dto.precioCentavos());
        if (dto.stock() != null) producto.setStock(dto.stock());
        if (urlsNuevasImagenes != null) producto.setImagenes(urlsNuevasImagenes);

        productoRepository.save(producto);
        return aRespuesta(producto);
    }

    @Transactional
    public ProductoResponse desactivar(String id) {
        Producto producto = obtenerEntidad(id);
        if (!producto.getActivo()) {
            throw new BadRequestException("Este producto ya esta desactivado");
        }
        producto.setActivo(false);
        productoRepository.save(producto);
        return aRespuesta(producto);
    }

    @Transactional
    public void eliminar(String id) {
        Producto producto = obtenerEntidad(id);
        productoRepository.delete(producto);
    }

    public Producto obtenerEntidad(String id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado"));
    }

    private ProductoResponse aRespuesta(Producto p) {
        return new ProductoResponse(
                p.getId(),
                p.getNombre(),
                p.getDescripcion(),
                p.getTalle(),
                p.getPrecioCentavos(),
                p.getStock(),
                p.getImagenes(),
                p.getActivo(),
                p.getCreadoEn(),
                p.getActualizadoEn());
    }
}
