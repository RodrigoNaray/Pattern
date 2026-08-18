package com.sistemapedidos.modules.producto;

import com.sistemapedidos.BaseIntegrationTest;
import com.sistemapedidos.domain.entity.Producto;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AdminProductoControllerTest extends BaseIntegrationTest {

    private MockMultipartFile imagen() {
        return new MockMultipartFile("imagenes", "foto.png", "image/png", new byte[]{1, 2, 3});
    }

    @Test
    void publicar_conImagenes_devuelve201() throws Exception {
        mockMvc.perform(multipart("/admin/productos")
                        .file(imagen())
                        .param("nombre", "Remera Algodon")
                        .param("descripcion", "Remera de algodon")
                        .param("talle", "M")
                        .param("precioCentavos", "15000")
                        .param("stock", "10")
                        .header("Authorization", bearerAdmin()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.mensaje").value("Producto publicado exitosamente"))
                .andExpect(jsonPath("$.producto.nombre").value("Remera Algodon"))
                .andExpect(jsonPath("$.producto.activo").value(true))
                .andExpect(jsonPath("$.producto.imagenes[0]").value(org.hamcrest.Matchers.containsString("/uploads/productos/")));
    }

    @Test
    void publicar_sinImagenes_devuelve400() throws Exception {
        mockMvc.perform(multipart("/admin/productos")
                        .param("nombre", "Remera")
                        .param("talle", "M")
                        .param("precioCentavos", "15000")
                        .header("Authorization", bearerAdmin()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Seleccione al menos una imagen valida"));
    }

    @Test
    void publicar_sinAutenticacion_devuelve401() throws Exception {
        mockMvc.perform(multipart("/admin/productos")
                        .file(imagen())
                        .param("nombre", "Remera")
                        .param("talle", "M")
                        .param("precioCentavos", "15000"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void publicar_nombreCorto_devuelve400() throws Exception {
        mockMvc.perform(multipart("/admin/productos")
                        .file(imagen())
                        .param("nombre", "Re")
                        .param("talle", "M")
                        .param("precioCentavos", "15000")
                        .header("Authorization", bearerAdmin()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void crearDraft_devuelve201() throws Exception {
        mockMvc.perform(post("/admin/productos/draft")
                        .header("Authorization", bearerAdmin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Borrador\",\"talle\":\"L\",\"precioCentavos\":2000,\"stock\":0}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.mensaje").value("Producto borrador creado exitosamente"))
                .andExpect(jsonPath("$.producto.imagenes", hasSize(0)));
    }

    @Test
    void listarAdmin_incluyeInactivos() throws Exception {
        guardarProducto("Activo", "M", 1000, 5, true);
        guardarProducto("Inactivo", "L", 2000, 5, false);

        mockMvc.perform(get("/admin/productos").header("Authorization", bearerAdmin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(2));
    }

    @Test
    void actualizar_sinImagenes_actualizaCampos() throws Exception {
        Producto producto = guardarProducto("Original", "M", 1000, 5);

        mockMvc.perform(multipart(org.springframework.http.HttpMethod.PATCH, "/admin/productos/" + producto.getId())
                        .param("nombre", "Actualizado")
                        .param("precioCentavos", "2500")
                        .param("stock", "7")
                        .header("Authorization", bearerAdmin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.producto.nombre").value("Actualizado"))
                .andExpect(jsonPath("$.producto.precioCentavos").value(2500))
                .andExpect(jsonPath("$.producto.stock").value(7));
    }

    @Test
    void actualizar_conNuevasImagenes_reemplaza() throws Exception {
        Producto producto = guardarProducto("Original", "M", 1000, 5);

        mockMvc.perform(multipart(org.springframework.http.HttpMethod.PATCH, "/admin/productos/" + producto.getId())
                        .file(imagen())
                        .header("Authorization", bearerAdmin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.producto.imagenes[0]").value(org.hamcrest.Matchers.containsString("/uploads/productos/")));
    }

    @Test
    void actualizarInexistente_devuelve404() throws Exception {
        mockMvc.perform(multipart(org.springframework.http.HttpMethod.PATCH, "/admin/productos/no-existe")
                        .param("nombre", "Nombre Valido")
                        .header("Authorization", bearerAdmin()))
                .andExpect(status().isNotFound());
    }

    @Test
    void desactivar_devuelveProductoInactivo() throws Exception {
        Producto producto = guardarProducto("Camiseta", "M", 1000, 5);

        mockMvc.perform(put("/admin/productos/" + producto.getId() + "/desactivar")
                        .header("Authorization", bearerAdmin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensaje").value("Producto desactivado exitosamente"))
                .andExpect(jsonPath("$.producto.activo").value(false));
    }

    @Test
    void desactivarYaInactivo_devuelve400() throws Exception {
        Producto producto = guardarProducto("Camiseta", "M", 1000, 5, false);

        mockMvc.perform(put("/admin/productos/" + producto.getId() + "/desactivar")
                        .header("Authorization", bearerAdmin()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Este producto ya esta desactivado"));
    }

    @Test
    void eliminar_devuelve200_yLuego404() throws Exception {
        Producto producto = guardarProducto("Camiseta", "M", 1000, 5);

        mockMvc.perform(delete("/admin/productos/" + producto.getId()).header("Authorization", bearerAdmin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensaje").value("Producto eliminado exitosamente"));

        assert productoRepository.findById(producto.getId()).isEmpty();
    }
}
