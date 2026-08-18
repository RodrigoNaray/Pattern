package com.sistemapedidos.modules.auth;

import com.sistemapedidos.BaseIntegrationTest;
import com.sistemapedidos.domain.entity.Administrador;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.emptyString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthControllerTest extends BaseIntegrationTest {

    @Test
    void loginValido_devuelveTokenYAdmin() throws Exception {
        guardarAdminConId(ADMIN_ID, ADMIN_EMAIL);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@tienda.com\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken", not(emptyString())))
                .andExpect(jsonPath("$.admin.id").value(ADMIN_ID))
                .andExpect(jsonPath("$.admin.nombre").value("Admin admin@tienda.com"))
                .andExpect(jsonPath("$.admin.email").value(ADMIN_EMAIL))
                .andExpect(jsonPath("$.admin.claveHash").doesNotExist());
    }

    @Test
    void loginEmailNoRegistrado_devuelve401() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"nadie@test.com\",\"password\":\"password123\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Email no registrado"));
    }

    @Test
    void loginClaveIncorrecta_devuelve401() throws Exception {
        guardarAdmin(ADMIN_EMAIL);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"admin@tienda.com\",\"password\":\"clave-incorrecta\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Clave incorrecta"));
    }

    @Test
    void loginCamposVacios_devuelve400() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"\",\"password\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("El email es obligatorio"));
    }

    @Test
    void registrarAdmin_creaAdministrador() throws Exception {
        mockMvc.perform(post("/auth/registrar-admin")
                        .header("Authorization", bearerAdmin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Nuevo Admin\",\"email\":\"nuevo@test.com\",\"password\":\"password123\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", not(emptyString())))
                .andExpect(jsonPath("$.nombre").value("Nuevo Admin"))
                .andExpect(jsonPath("$.email").value("nuevo@test.com"));

        assert administradorRepository.findByEmail("nuevo@test.com").isPresent();
    }

    @Test
    void registrarAdminEmailDuplicado_devuelve400() throws Exception {
        guardarAdmin(ADMIN_EMAIL);

        mockMvc.perform(post("/auth/registrar-admin")
                        .header("Authorization", bearerAdmin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Otro\",\"email\":\"admin@tienda.com\",\"password\":\"password123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("El email ya esta registrado"));
    }

    @Test
    void registrarAdminPasswordCorta_devuelve400() throws Exception {
        mockMvc.perform(post("/auth/registrar-admin")
                        .header("Authorization", bearerAdmin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Otro\",\"email\":\"otro@test.com\",\"password\":\"corta\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("La contrasena debe tener al menos 8 caracteres"));
    }

    @Test
    void cambiarPassword_conActualCorrecta_actualiza() throws Exception {
        guardarAdminConId(ADMIN_ID, ADMIN_EMAIL);

        mockMvc.perform(post("/auth/cambiar-password")
                        .header("Authorization", bearerAdmin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"password123\",\"newPassword\":\"nuevaPassword456\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensaje").value("Contrasena actualizada exitosamente"));

        Administrador admin = administradorRepository.findById(ADMIN_ID).orElseThrow();
        assert passwordEncoder.matches("nuevaPassword456", admin.getClaveHash());
    }

    @Test
    void cambiarPasswordActualIncorrecta_devuelve401() throws Exception {
        guardarAdminConId(ADMIN_ID, ADMIN_EMAIL);

        mockMvc.perform(post("/auth/cambiar-password")
                        .header("Authorization", bearerAdmin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"currentPassword\":\"incorrecta\",\"newPassword\":\"nuevaPassword456\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("La contrasena actual es incorrecta"));
    }
}
