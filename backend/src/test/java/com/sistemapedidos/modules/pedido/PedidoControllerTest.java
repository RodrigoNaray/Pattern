package com.sistemapedidos.modules.pedido;

import com.fasterxml.jackson.databind.JsonNode;
import com.sistemapedidos.BaseIntegrationTest;
import com.sistemapedidos.domain.entity.Pedido;
import com.sistemapedidos.domain.entity.Producto;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import java.nio.charset.StandardCharsets;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.emptyString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PedidoControllerTest extends BaseIntegrationTest {

    private String bodyPedido(String email, String telefono, String productoId, int cantidad) {
        return """
                {"emailComprador":"%s","telefonoComprador":"%s","items":[{"productoId":"%s","cantidad":%d}]}
                """.formatted(email, telefono, productoId, cantidad);
    }

    private JsonNode crearPedido(String email, String telefono, String productoId, int cantidad) throws Exception {
        MvcResult result = mockMvc.perform(post("/pedidos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bodyPedido(email, telefono, productoId, cantidad)))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }

    private int stockDe(Producto producto) {
        return productoRepository.findById(producto.getId()).orElseThrow().getStock();
    }

    @Test
    void crear_devuelve201ConItemsYTotal() throws Exception {
        Producto producto = guardarProducto("Camiseta", "M", 1500, 10);

        mockMvc.perform(post("/pedidos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bodyPedido("compra@test.com", "099123456", producto.getId(), 3)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.mensaje").value("Pedido creado exitosamente"))
                .andExpect(jsonPath("$.pedido.codigo").value(containsString("PED-")))
                .andExpect(jsonPath("$.pedido.estado").value("PENDIENTE_PAGO"))
                .andExpect(jsonPath("$.pedido.totalCentavos").value(4500))
                .andExpect(jsonPath("$.pedido.items", hasSize(1)))
                .andExpect(jsonPath("$.pedido.items[0].producto.nombre").value("Camiseta"))
                .andExpect(jsonPath("$.pedido.items[0].cantidad").value(3))
                .andExpect(jsonPath("$.pedido.vencidoEn", not(emptyString())));
    }

    @Test
    void crear_noDescuentaStock() throws Exception {
        Producto producto = guardarProducto("Camiseta", "M", 1500, 10);

        crearPedido("compra@test.com", "099123456", producto.getId(), 3);

        assert stockDe(producto) == 10;
    }

    @Test
    void crearStockInsuficiente_devuelve400() throws Exception {
        Producto producto = guardarProducto("Camiseta", "M", 1500, 2);

        mockMvc.perform(post("/pedidos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bodyPedido("compra@test.com", "099123456", producto.getId(), 5)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("Stock insuficiente")))
                .andExpect(jsonPath("$.message").value(containsString("Camiseta")));
    }

    @Test
    void crearCarritoVacio_devuelve400() throws Exception {
        mockMvc.perform(post("/pedidos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"emailComprador\":\"compra@test.com\",\"telefonoComprador\":\"099123456\",\"items\":[]}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("El carrito esta vacio"));
    }

    @Test
    void crearTelefonoInvalido_devuelve400() throws Exception {
        Producto producto = guardarProducto("Camiseta", "M", 1500, 10);

        mockMvc.perform(post("/pedidos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bodyPedido("compra@test.com", "12345", producto.getId(), 1)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("formato Uruguay")));
    }

    @Test
    void crearProductoInexistente_devuelve404() throws Exception {
        mockMvc.perform(post("/pedidos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bodyPedido("compra@test.com", "099123456", "no-existe", 1)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value(containsString("Producto con ID no-existe no encontrado")));
    }

    @Test
    void confirmarPago_descuentaStockUnaSolaVez() throws Exception {
        Producto producto = guardarProducto("Camiseta", "M", 1500, 10);
        JsonNode creado = crearPedido("compra@test.com", "099123456", producto.getId(), 3);

        mockMvc.perform(put("/pedidos/" + creado.path("pedido").path("id").asText() + "/confirmar-pago")
                        .header("Authorization", bearerAdmin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("PAGO_CONFIRMADO"))
                .andExpect(jsonPath("$.confirmadoEn", not(emptyString())))
                .andExpect(jsonPath("$.totalCentavos").value(4500));

        assert stockDe(producto) == 7;
    }

    @Test
    void confirmarPago_agotaStock_desactivaProducto() throws Exception {
        Producto producto = guardarProducto("Camiseta", "M", 1500, 2);
        JsonNode creado = crearPedido("compra@test.com", "099123456", producto.getId(), 2);

        mockMvc.perform(put("/pedidos/" + creado.path("pedido").path("id").asText() + "/confirmar-pago")
                        .header("Authorization", bearerAdmin()))
                .andExpect(status().isOk());

        Producto actualizado = productoRepository.findById(producto.getId()).orElseThrow();
        assert actualizado.getStock() == 0;
        assert !actualizado.getActivo();
    }

    @Test
    void confirmarPago_sinStockAlMomento_devuelve400() throws Exception {
        Producto producto = guardarProducto("Camiseta", "M", 1500, 5);
        JsonNode creado = crearPedido("compra@test.com", "099123456", producto.getId(), 3);

        producto.setStock(2);
        productoRepository.save(producto);

        mockMvc.perform(put("/pedidos/" + creado.path("pedido").path("id").asText() + "/confirmar-pago")
                        .header("Authorization", bearerAdmin()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("Stock insuficiente")));

        assert stockDe(producto) == 2;
    }

    @Test
    void confirmarPagoYaConfirmado_devuelve400() throws Exception {
        Producto producto = guardarProducto("Camiseta", "M", 1500, 10);
        JsonNode creado = crearPedido("compra@test.com", "099123456", producto.getId(), 1);
        String id = creado.path("pedido").path("id").asText();

        mockMvc.perform(put("/pedidos/" + id + "/confirmar-pago").header("Authorization", bearerAdmin()))
                .andExpect(status().isOk());

        mockMvc.perform(put("/pedidos/" + id + "/confirmar-pago").header("Authorization", bearerAdmin()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Este pedido ya fue confirmado"));
    }

    @Test
    void confirmarPagoPedidoInexistente_devuelve404() throws Exception {
        mockMvc.perform(put("/pedidos/no-existe/confirmar-pago").header("Authorization", bearerAdmin()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Pedido no encontrado"));
    }

    @Test
    void cancelar_noRestauraStock() throws Exception {
        Producto producto = guardarProducto("Camiseta", "M", 1500, 10);
        JsonNode creado = crearPedido("compra@test.com", "099123456", producto.getId(), 3);

        mockMvc.perform(put("/pedidos/" + creado.path("pedido").path("id").asText() + "/cancelar")
                        .header("Authorization", bearerAdmin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensaje").value("Pedido cancelado exitosamente"))
                .andExpect(jsonPath("$.pedido.estado").value("CANCELADO"));

        assert stockDe(producto) == 10;
    }

    @Test
    void cancelarConfirmado_devuelve400() throws Exception {
        Producto producto = guardarProducto("Camiseta", "M", 1500, 10);
        JsonNode creado = crearPedido("compra@test.com", "099123456", producto.getId(), 1);
        String id = creado.path("pedido").path("id").asText();

        mockMvc.perform(put("/pedidos/" + id + "/confirmar-pago").header("Authorization", bearerAdmin()))
                .andExpect(status().isOk());

        mockMvc.perform(put("/pedidos/" + id + "/cancelar").header("Authorization", bearerAdmin()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("No se puede cancelar un pedido confirmado"));
    }

    @Test
    void cancelarYaCancelado_devuelve400() throws Exception {
        Producto producto = guardarProducto("Camiseta", "M", 1500, 10);
        JsonNode creado = crearPedido("compra@test.com", "099123456", producto.getId(), 1);
        String id = creado.path("pedido").path("id").asText();

        mockMvc.perform(put("/pedidos/" + id + "/cancelar").header("Authorization", bearerAdmin()))
                .andExpect(status().isOk());

        mockMvc.perform(put("/pedidos/" + id + "/cancelar").header("Authorization", bearerAdmin()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Este pedido ya fue cancelado"));
    }

    @Test
    void buscarPorCodigoYEmail_devuelvePedido() throws Exception {
        Producto producto = guardarProducto("Camiseta", "M", 1500, 10);
        JsonNode creado = crearPedido("compra@test.com", "099123456", producto.getId(), 2);
        String codigo = creado.path("pedido").path("codigo").asText();

        mockMvc.perform(get("/pedidos/buscar").param("codigo", codigo).param("email", "compra@test.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.codigo").value(codigo))
                .andExpect(jsonPath("$.items[0].producto.nombre").value("Camiseta"));
    }

    @Test
    void buscarSinCoincidencia_devuelve404() throws Exception {
        mockMvc.perform(get("/pedidos/buscar").param("codigo", "PED-XXXX").param("email", "x@test.com"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("No se encontro un pedido con esos datos"));
    }

    @Test
    void obtenerUno_devuelveDetalle() throws Exception {
        Producto producto = guardarProducto("Camiseta", "M", 1500, 10);
        JsonNode creado = crearPedido("compra@test.com", "099123456", producto.getId(), 2);
        String id = creado.path("pedido").path("id").asText();

        mockMvc.perform(get("/pedidos/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.totalCentavos").value(3000))
                .andExpect(jsonPath("$.items[0].cantidad").value(2));
    }

    @Test
    void listarPendientes_devuelveItemsCount() throws Exception {
        Producto producto = guardarProducto("Camiseta", "M", 1500, 10);
        crearPedido("a@test.com", "099123456", producto.getId(), 1);
        crearPedido("b@test.com", "098123456", producto.getId(), 2);

        mockMvc.perform(get("/pedidos/list-pendientes").header("Authorization", bearerAdmin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(2))
                .andExpect(jsonPath("$.pedidos[0].itemsCount").value(1))
                .andExpect(jsonPath("$.pedidos[1].itemsCount").value(1));
    }

    @Test
    void exportarCsv_devuelveBOMYEncabezado() throws Exception {
        Producto producto = guardarProducto("Camiseta", "M", 1500, 10);
        JsonNode creado = crearPedido("compra@test.com", "099123456", producto.getId(), 2);

        MvcResult result = mockMvc.perform(get("/pedidos/export").header("Authorization", bearerAdmin()))
                .andExpect(status().isOk())
                .andReturn();

        byte[] bytes = result.getResponse().getContentAsByteArray();
        assert bytes.length >= 3;
        assert bytes[0] == (byte) 0xEF && bytes[1] == (byte) 0xBB && bytes[2] == (byte) 0xBF;

        String csv = new String(bytes, StandardCharsets.UTF_8);
        assert csv.contains("codigo,fecha,email,telefono,estado,producto,talle,cantidad,precio_unitario_centavos,subtotal_centavos,total_pedido_centavos");
        assert csv.contains(creado.path("pedido").path("codigo").asText());
        assert csv.contains("Camiseta");
    }

    @Test
    void exportarCsv_requiereAutenticacion() throws Exception {
        mockMvc.perform(get("/pedidos/export"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void instruccionesPago_conConfig_devuelveDatos() throws Exception {
        guardarConfiguracion();
        Producto producto = guardarProducto("Camiseta", "M", 1500, 10);
        JsonNode creado = crearPedido("compra@test.com", "099123456", producto.getId(), 2);
        String id = creado.path("pedido").path("id").asText();

        mockMvc.perform(get("/pedidos/" + id + "/instrucciones-pago"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.banco").value("Banco Test"))
                .andExpect(jsonPath("$.cbu").value("0000003100000001234567"))
                .andExpect(jsonPath("$.numeroPedido").value(creado.path("pedido").path("codigo").asText()))
                .andExpect(jsonPath("$.totalFormateado", not(emptyString())))
                .andExpect(jsonPath("$.enlaceWhatsApp").value(containsString("https://wa.me/59899123456")));
    }

    @Test
    void instruccionesPago_sinConfig_devuelve400() throws Exception {
        Producto producto = guardarProducto("Camiseta", "M", 1500, 10);
        JsonNode creado = crearPedido("compra@test.com", "099123456", producto.getId(), 1);
        String id = creado.path("pedido").path("id").asText();

        mockMvc.perform(get("/pedidos/" + id + "/instrucciones-pago"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Datos de pago no disponibles"));
    }

    @Test
    void instruccionesPagoPedidoInexistente_devuelve404() throws Exception {
        mockMvc.perform(get("/pedidos/00000000-0000-0000-0000-000000000000/instrucciones-pago"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Pedido no encontrado"));
    }
}
