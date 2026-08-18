package com.sistemapedidos.modules.administrador;

import com.sistemapedidos.BaseIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.emptyString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AdministradorControllerTest extends BaseIntegrationTest {

    @Test
    void login_devuelveToken() throws Exception {
        guardarAdmin(ADMIN_EMAIL);

        mockMvc.perform(post("/administradores/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@tienda.com\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", not(emptyString())));
    }

    @Test
    void listar_requiereAutenticacion() throws Exception {
        mockMvc.perform(get("/administradores"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void listar_devuelveAdministradoresSinClaveHash() throws Exception {
        guardarAdmin("a@test.com");
        guardarAdmin("b@test.com");

        mockMvc.perform(get("/administradores").header("Authorization", bearerAdmin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].email").value("a@test.com"))
                .andExpect(jsonPath("$[0].claveHash").doesNotExist());
    }

    @Test
    void obtenerUno_inexistente_devuelve404() throws Exception {
        mockMvc.perform(get("/administradores/no-existe").header("Authorization", bearerAdmin()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Administrador no encontrado"));
    }

    @Test
    void crear_devuelve201() throws Exception {
        mockMvc.perform(post("/administradores")
                        .header("Authorization", bearerAdmin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Carlos\",\"email\":\"carlos@test.com\",\"password\":\"password123\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("carlos@test.com"));
    }

    @Test
    void crearEmailDuplicado_devuelve400() throws Exception {
        guardarAdmin(ADMIN_EMAIL);

        mockMvc.perform(post("/administradores")
                        .header("Authorization", bearerAdmin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Carlos\",\"email\":\"admin@tienda.com\",\"password\":\"password123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("El email ya esta registrado"));
    }

    @Test
    void actualizar_cambiaNombreYEmail() throws Exception {
        String id = guardarAdmin("viejo@test.com").getId();

        mockMvc.perform(patch("/administradores/" + id)
                        .header("Authorization", bearerAdmin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Nuevo Nombre\",\"email\":\"nuevo@test.com\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Nuevo Nombre"))
                .andExpect(jsonPath("$.email").value("nuevo@test.com"));
    }

    @Test
    void actualizarEmailEnUso_devuelve400() throws Exception {
        guardarAdmin(ADMIN_EMAIL);
        String id = guardarAdmin("otro@test.com").getId();

        mockMvc.perform(patch("/administradores/" + id)
                        .header("Authorization", bearerAdmin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@tienda.com\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("El email ya esta registrado"));
    }

    @Test
    void actualizarInexistente_devuelve404() throws Exception {
        mockMvc.perform(patch("/administradores/no-existe")
                        .header("Authorization", bearerAdmin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"X\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void resetPassword_aSiMismo_devuelve400() throws Exception {
        guardarAdminConId(ADMIN_ID, ADMIN_EMAIL);

        mockMvc.perform(post("/administradores/" + ADMIN_ID + "/reset-password")
                        .header("Authorization", bearerAdmin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nuevaPassword\":\"otraPassword123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("No puedes resetear tu propia contrasena")));
    }

    @Test
    void resetPassword_aOtro_devuelve200() throws Exception {
        guardarAdminConId(ADMIN_ID, ADMIN_EMAIL);
        String id = guardarAdmin("otro@test.com").getId();

        mockMvc.perform(post("/administradores/" + id + "/reset-password")
                        .header("Authorization", bearerAdmin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nuevaPassword\":\"otraPassword123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensaje").value("Contrasena reseteada exitosamente"));
    }

    @Test
    void eliminar_aSiMismo_devuelve400() throws Exception {
        guardarAdminConId(ADMIN_ID, ADMIN_EMAIL);

        mockMvc.perform(delete("/administradores/" + ADMIN_ID).header("Authorization", bearerAdmin()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("No puedes eliminarte a ti mismo"));
    }

    @Test
    void eliminar_aOtro_devuelve200() throws Exception {
        guardarAdminConId(ADMIN_ID, ADMIN_EMAIL);
        String id = guardarAdmin("otro@test.com").getId();

        mockMvc.perform(delete("/administradores/" + id).header("Authorization", bearerAdmin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensaje").value("Administrador eliminado exitosamente"));

        assert administradorRepository.findById(id).isEmpty();
    }
}
