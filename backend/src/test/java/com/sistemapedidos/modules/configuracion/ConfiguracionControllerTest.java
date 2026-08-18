package com.sistemapedidos.modules.configuracion;

import com.sistemapedidos.BaseIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ConfiguracionControllerTest extends BaseIntegrationTest {

    @Test
    void obtener_creaConfiguracionGlobalSiNoExiste() throws Exception {
        mockMvc.perform(get("/admin/configuracion").header("Authorization", bearerAdmin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("global"))
                .andExpect(jsonPath("$.pedidoVencimientoHoras").value(48))
                .andExpect(jsonPath("$.estadoProductoBorrador").value(true));

        assert configuracionTiendaRepository.findById("global").isPresent();
    }

    @Test
    void obtener_requiereAutenticacion() throws Exception {
        mockMvc.perform(get("/admin/configuracion"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void actualizar_modificaCamposParciales() throws Exception {
        guardarConfiguracion();

        mockMvc.perform(put("/admin/configuracion")
                        .header("Authorization", bearerAdmin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"banco\":\"Banco Nuevo\",\"pedidoVencimientoHoras\":72}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensaje").value("Configuracion actualizada exitosamente"))
                .andExpect(jsonPath("$.configuracion.banco").value("Banco Nuevo"))
                .andExpect(jsonPath("$.configuracion.pedidoVencimientoHoras").value(72))
                .andExpect(jsonPath("$.configuracion.whatsappContacto").value("+59899123456"));
    }

    @Test
    void obtenerPublica_devuelveSoloDatosPublicos() throws Exception {
        guardarConfiguracion();

        mockMvc.perform(get("/configuracion-tienda/publica"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombreTienda").value("Tienda Test"))
                .andExpect(jsonPath("$.whatsappContacto").value("+59899123456"))
                .andExpect(jsonPath("$.banco").doesNotExist());
    }
}
