package com.sistemapedidos.modules.producto;

import com.sistemapedidos.BaseIntegrationTest;
import com.sistemapedidos.domain.entity.Producto;
import org.junit.jupiter.api.Test;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ProductoControllerTest extends BaseIntegrationTest {

    @Test
    void listar_devuelveSoloActivosPaginados() throws Exception {
        guardarProducto("Camiseta", "M", 1500, 10, true);
        guardarProducto("Pantalon", "L", 3500, 5, true);
        guardarProducto("Bermuda Oculto", "S", 2200, 3, false);

        mockMvc.perform(get("/productos").param("activo", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productos", hasSize(2)))
                .andExpect(jsonPath("$.total").value(2))
                .andExpect(jsonPath("$.pagina").value(1))
                .andExpect(jsonPath("$.tamano").value(20))
                .andExpect(jsonPath("$.productos[0].precioCentavos").isNumber());
    }

    @Test
    void listar_buscaPorNombreInsensibleAMayusculas() throws Exception {
        guardarProducto("Camiseta Basica", "M", 1500, 10);
        guardarProducto("Pantalon Chino", "L", 3500, 5);

        mockMvc.perform(get("/productos").param("q", "CAMISETA"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.productos[0].nombre").value("Camiseta Basica"));
    }

    @Test
    void listar_filtraPorTalle() throws Exception {
        guardarProducto("Camiseta", "M", 1500, 10);
        guardarProducto("Pantalon", "L", 3500, 5);

        mockMvc.perform(get("/productos").param("talle", "L"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.productos[0].talle").value("L"));
    }

    @Test
    void listar_paginaYTamanoPersonalizados() throws Exception {
        for (int i = 1; i <= 5; i++) {
            guardarProducto("Producto " + i, "M", 1000, 10);
        }

        mockMvc.perform(get("/productos").param("pagina", "2").param("tamano", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(5))
                .andExpect(jsonPath("$.productos", hasSize(2)))
                .andExpect(jsonPath("$.pagina").value(2));
    }

    @Test
    void obtenerUno_devuelveProducto() throws Exception {
        Producto producto = guardarProducto("Camiseta", "M", 1500, 10);

        mockMvc.perform(get("/productos/" + producto.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(producto.getId()))
                .andExpect(jsonPath("$.nombre").value("Camiseta"))
                .andExpect(jsonPath("$.precioCentavos").value(1500))
                .andExpect(jsonPath("$.imagenes[0]").value("https://img.test/foto.png"));
    }

    @Test
    void obtenerUnoInexistente_devuelve404() throws Exception {
        mockMvc.perform(get("/productos/no-existe"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Producto no encontrado"));
    }
}
