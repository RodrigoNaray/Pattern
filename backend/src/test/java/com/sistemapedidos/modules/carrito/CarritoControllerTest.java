package com.sistemapedidos.modules.carrito;

import com.sistemapedidos.BaseIntegrationTest;
import com.sistemapedidos.domain.entity.Producto;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class CarritoControllerTest extends BaseIntegrationTest {

    @Test
    void agregar_devuelveResumen() throws Exception {
        Producto producto = guardarProducto("Camiseta", "M", 1500, 10);

        mockMvc.perform(post("/carrito/agregar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"productoId\":\"" + producto.getId() + "\",\"cantidad\":2,\"talle\":\"M\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensaje").value("Producto agregado al carrito"))
                .andExpect(jsonPath("$.carrito", hasSize(1)))
                .andExpect(jsonPath("$.carrito[0].nombre").value("Camiseta"))
                .andExpect(jsonPath("$.carrito[0].precioCentavos").value(1500))
                .andExpect(jsonPath("$.carrito[0].subtotalCentavos").value(3000));
    }

    @Test
    void agregarTalleIncorrecto_devuelve400() throws Exception {
        Producto producto = guardarProducto("Camiseta", "M", 1500, 10);

        mockMvc.perform(post("/carrito/agregar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"productoId\":\"" + producto.getId() + "\",\"cantidad\":1,\"talle\":\"L\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("El talle seleccionado no corresponde con el producto"));
    }

    @Test
    void agregarCantidadMayorAlStock_devuelve400() throws Exception {
        Producto producto = guardarProducto("Camiseta", "M", 1500, 2);

        mockMvc.perform(post("/carrito/agregar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"productoId\":\"" + producto.getId() + "\",\"cantidad\":5}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Stock insuficiente"));
    }

    @Test
    void agregarProductoInexistente_devuelve404() throws Exception {
        mockMvc.perform(post("/carrito/agregar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"productoId\":\"no-existe\",\"cantidad\":1}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value(containsString("Producto con ID no-existe no encontrado")));
    }

    @Test
    void validar_devuelveItemsYTotal() throws Exception {
        Producto producto = guardarProducto("Camiseta", "M", 1500, 10);

        String body = """
                {"items":[{"productoId":"%s","nombre":"Camiseta","talle":"M","precioCentavos":1500,"cantidad":2,"subtotalCentavos":3000}]}
                """.formatted(producto.getId());

        mockMvc.perform(post("/carrito/validar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.items[0].stockDisponible").value(10))
                .andExpect(jsonPath("$.items[0].stockInsuficiente").value(false))
                .andExpect(jsonPath("$.totalCentavos").value(3000))
                .andExpect(jsonPath("$.hayStockInsuficiente").value(false));
    }

    @Test
    void validar_marcaStockInsuficiente() throws Exception {
        Producto producto = guardarProducto("Camiseta", "M", 1500, 1);

        String body = """
                {"items":[{"productoId":"%s","nombre":"Camiseta","talle":"M","precioCentavos":1500,"cantidad":5,"subtotalCentavos":7500}]}
                """.formatted(producto.getId());

        mockMvc.perform(post("/carrito/validar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].stockInsuficiente").value(true))
                .andExpect(jsonPath("$.hayStockInsuficiente").value(true));
    }

    @Test
    void validar_omiteProductosInactivos() throws Exception {
        guardarProducto("Inactivo", "M", 1500, 10, false);

        String body = """
                {"items":[{"productoId":"%s","nombre":"Inactivo","talle":"M","precioCentavos":1500,"cantidad":1,"subtotalCentavos":1500}]}
                """.formatted(productoRepository.findAll().getFirst().getId());

        mockMvc.perform(post("/carrito/validar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(0)))
                .andExpect(jsonPath("$.totalCentavos").value(0));
    }

    @Test
    void actualizarCantidad_devuelveResumen() throws Exception {
        Producto producto = guardarProducto("Camiseta", "M", 1500, 10);

        mockMvc.perform(patch("/carrito/items/" + producto.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"cantidad\":4}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cantidad").value(4))
                .andExpect(jsonPath("$.subtotalCentavos").value(6000));
    }

    @Test
    void eliminar_devuelveCarritoVacio() throws Exception {
        Producto producto = guardarProducto("Camiseta", "M", 1500, 10);

        mockMvc.perform(delete("/carrito/items/" + producto.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensaje").value("Producto eliminado del carrito"))
                .andExpect(jsonPath("$.carrito", hasSize(0)));
    }
}
