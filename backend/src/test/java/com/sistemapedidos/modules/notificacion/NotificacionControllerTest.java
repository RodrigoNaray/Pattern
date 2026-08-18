package com.sistemapedidos.modules.notificacion;

import com.sistemapedidos.BaseIntegrationTest;
import com.sistemapedidos.domain.entity.Notificacion;
import com.sistemapedidos.domain.entity.Pedido;
import com.sistemapedidos.domain.entity.Producto;
import com.sistemapedidos.domain.enums.CanalNotificacion;
import com.sistemapedidos.domain.enums.EstadoPedido;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class NotificacionControllerTest extends BaseIntegrationTest {

    private Pedido guardarPedido(String codigo) {
        Pedido pedido = new Pedido();
        pedido.setEmailComprador("compra@test.com");
        pedido.setTelefonoComprador("099123456");
        pedido.setEstado(EstadoPedido.PENDIENTE_PAGO);
        pedido.setTotalCentavos(1000L);
        pedido.setCodigo(codigo);
        pedido.setVencidoEn(LocalDateTime.now(ZoneOffset.UTC).plusHours(48));
        return pedidoRepository.save(pedido);
    }

    private Notificacion guardarNotificacion(CanalNotificacion canal, String mensaje, boolean leida, Pedido pedido,
                                             LocalDateTime creadoEn) {
        Notificacion notificacion = new Notificacion();
        notificacion.setCanal(canal);
        notificacion.setMensaje(mensaje);
        notificacion.setLeida(leida);
        notificacion.setPedido(pedido);
        notificacion.setCreadoEn(creadoEn);
        return notificacionRepository.save(notificacion);
    }

    @Test
    void listar_devuelveTodasOrdenadasPorFechaDesc() throws Exception {
        Pedido pedido = guardarPedido("PED-001");
        LocalDateTime ahora = LocalDateTime.now(ZoneOffset.UTC);
        guardarNotificacion(CanalNotificacion.PANEL, "Nueva", false, pedido, ahora);
        guardarNotificacion(CanalNotificacion.EMAIL, "Antigua", true, pedido, ahora.minusHours(1));

        mockMvc.perform(get("/admin/notificaciones").header("Authorization", bearerAdmin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].mensaje").value("Nueva"))
                .andExpect(jsonPath("$[0].canal").value("PANEL"))
                .andExpect(jsonPath("$[0].pedidoId").value(pedido.getId()));
    }

    @Test
    void listarFiltroUnread_devuelveSoloNoLeidas() throws Exception {
        Pedido pedido = guardarPedido("PED-001");
        LocalDateTime ahora = LocalDateTime.now(ZoneOffset.UTC);
        guardarNotificacion(CanalNotificacion.PANEL, "Nueva", false, pedido, ahora);
        guardarNotificacion(CanalNotificacion.EMAIL, "Antigua", true, pedido, ahora.minusHours(1));

        mockMvc.perform(get("/admin/notificaciones").param("filtro", "unread").header("Authorization", bearerAdmin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].leida").value(false));
    }

    @Test
    void listarFiltroInvalido_devuelve400() throws Exception {
        mockMvc.perform(get("/admin/notificaciones").param("filtro", "no-valido").header("Authorization", bearerAdmin()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void obtenerDetalle_incluyePedido() throws Exception {
        Pedido pedido = guardarPedido("PED-001");
        Notificacion notificacion = guardarNotificacion(CanalNotificacion.PANEL, "Detalle", false, pedido,
                LocalDateTime.now(ZoneOffset.UTC));

        mockMvc.perform(get("/admin/notificaciones/" + notificacion.getId() + "/detalle")
                        .header("Authorization", bearerAdmin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.notificacion.id").value(notificacion.getId()))
                .andExpect(jsonPath("$.pedido.codigo").value("PED-001"))
                .andExpect(jsonPath("$.pedido.totalCentavos").value(1000));
    }

    @Test
    void obtenerDetalleInexistente_devuelve404() throws Exception {
        mockMvc.perform(get("/admin/notificaciones/no-existe/detalle").header("Authorization", bearerAdmin()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Notificacion no encontrada"));
    }

    @Test
    void marcarComoLeida_devuelve200_eIdempotente() throws Exception {
        Pedido pedido = guardarPedido("PED-001");
        Notificacion notificacion = guardarNotificacion(CanalNotificacion.PANEL, "Mensaje", false, pedido,
                LocalDateTime.now(ZoneOffset.UTC));

        mockMvc.perform(patch("/admin/notificaciones/" + notificacion.getId() + "/leida")
                        .header("Authorization", bearerAdmin())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.leida").value(true));

        mockMvc.perform(patch("/admin/notificaciones/" + notificacion.getId() + "/leida")
                        .header("Authorization", bearerAdmin())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.leida").value(true));
    }
}
