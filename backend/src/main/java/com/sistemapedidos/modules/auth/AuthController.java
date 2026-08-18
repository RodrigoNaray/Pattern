package com.sistemapedidos.modules.auth;

import com.sistemapedidos.modules.auth.dto.AuthResponse;
import com.sistemapedidos.modules.auth.dto.CambiarPasswordDto;
import com.sistemapedidos.modules.auth.dto.LoginAdminDto;
import com.sistemapedidos.modules.auth.dto.RegistrarAdminDto;
import com.sistemapedidos.security.SecurityUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @GetMapping("/admin/login")
    public Map<String, String> getAdminLogin() {
        return Map.of("message", "admin/login");
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginAdminDto dto) {
        return authService.validarAdmin(dto.email(), dto.password());
    }

    @PostMapping("/registrar-admin")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse.AdminBasic registrarAdmin(@Valid @RequestBody RegistrarAdminDto dto) {
        return authService.registrarAdmin(dto.nombre(), dto.email(), dto.password());
    }

    @PostMapping("/cambiar-password")
    public Map<String, String> cambiarPassword(Authentication authentication,
                                               @Valid @RequestBody CambiarPasswordDto dto) {
        SecurityUser usuario = (SecurityUser) authentication.getPrincipal();
        return authService.cambiarPassword(usuario.id(), dto.currentPassword(), dto.newPassword());
    }
}
