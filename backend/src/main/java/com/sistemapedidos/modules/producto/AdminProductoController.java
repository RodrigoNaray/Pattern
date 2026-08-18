package com.sistemapedidos.modules.producto;

import com.sistemapedidos.common.error.BadRequestException;
import com.sistemapedidos.modules.producto.dto.ActualizarProductoDto;
import com.sistemapedidos.modules.producto.dto.CreateProductoDto;
import com.sistemapedidos.modules.producto.dto.PaginadoProductos;
import com.sistemapedidos.modules.producto.dto.ProductoResponse;
import com.sistemapedidos.modules.producto.dto.PublicarProductoDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/productos")
@RequiredArgsConstructor
public class AdminProductoController {

    private final ProductoService productoService;
    private final ImagenService imagenService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> publicar(@Valid @ModelAttribute PublicarProductoDto dto,
                                        @RequestParam(value = "imagenes", required = false) List<MultipartFile> archivos) {
        List<MultipartFile> archivosValidos = archivos != null ? archivos : List.of();

        if (archivosValidos.isEmpty()) {
            throw new BadRequestException("Seleccione al menos una imagen valida");
        }

        List<String> urlsImagenes = imagenService.guardar(archivosValidos);
        ProductoResponse producto = productoService.publicar(dto, urlsImagenes);

        return Map.of("mensaje", "Producto publicado exitosamente", "producto", producto);
    }

    @GetMapping
    public PaginadoProductos listar() {
        return productoService.listar(null, null, null, 1, 20);
    }

    @GetMapping("/{id}")
    public ProductoResponse obtenerUno(@PathVariable String id) {
        return productoService.obtenerUno(id);
    }

    @PostMapping("/draft")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> crearDraft(@Valid @RequestBody CreateProductoDto dto) {
        ProductoResponse producto = productoService.crear(dto);
        return Map.of("mensaje", "Producto borrador creado exitosamente", "producto", producto);
    }

    @PatchMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> actualizar(@PathVariable String id,
                                          @Valid @ModelAttribute ActualizarProductoDto dto,
                                          @RequestParam(value = "imagenes", required = false) List<MultipartFile> archivos) {
        List<MultipartFile> archivosValidos = archivos != null ? archivos : List.of();

        List<String> urlsNuevasImagenes = null;
        List<String> urlsImagenesAntiguas = null;

        if (!archivosValidos.isEmpty()) {
            ProductoResponse productoActual = productoService.obtenerUno(id);
            urlsImagenesAntiguas = productoActual.imagenes();
            urlsNuevasImagenes = imagenService.guardar(archivosValidos);
        }

        ProductoResponse producto = productoService.actualizarAdmin(id, dto, urlsNuevasImagenes);

        if (urlsImagenesAntiguas != null && !urlsImagenesAntiguas.isEmpty()) {
            imagenService.eliminar(urlsImagenesAntiguas);
        }

        return Map.of("mensaje", "Producto actualizado exitosamente", "producto", producto);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> eliminar(@PathVariable String id) {
        productoService.eliminar(id);
        return Map.of("mensaje", "Producto eliminado exitosamente");
    }

    @PutMapping("/{id}/desactivar")
    public Map<String, Object> desactivar(@PathVariable String id) {
        ProductoResponse producto = productoService.desactivar(id);
        return Map.of("mensaje", "Producto desactivado exitosamente", "producto", producto);
    }
}
