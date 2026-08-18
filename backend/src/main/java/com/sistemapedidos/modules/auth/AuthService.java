package com.sistemapedidos.modules.auth;

import com.sistemapedidos.common.error.BadRequestException;
import com.sistemapedidos.common.error.UnauthorizedException;
import com.sistemapedidos.domain.entity.Administrador;
import com.sistemapedidos.domain.repository.AdministradorRepository;
import com.sistemapedidos.modules.auth.dto.AuthResponse;
import com.sistemapedidos.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final int MIN_PASSWORD_LENGTH = 8;

    private final AdministradorRepository administradorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse validarAdmin(String email, String password) {
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            throw new UnauthorizedException("Complete todos los campos");
        }

        Administrador admin = administradorRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Email no registrado"));

        if (!passwordEncoder.matches(password, admin.getClaveHash())) {
            throw new UnauthorizedException("Clave incorrecta");
        }

        admin.setUltimoAccesoEn(LocalDateTime.now(ZoneOffset.UTC));
        administradorRepository.save(admin);

        String token = jwtService.generarToken(admin.getId(), admin.getEmail(), "admin");
        return new AuthResponse(token, new AuthResponse.AdminBasic(admin.getId(), admin.getNombre(), admin.getEmail()));
    }

    @Transactional
    public AuthResponse.AdminBasic registrarAdmin(String nombre, String email, String password) {
        if (administradorRepository.findByEmail(email).isPresent()) {
            throw new BadRequestException("El email ya esta registrado");
        }
        if (password == null || password.length() < MIN_PASSWORD_LENGTH) {
            throw new BadRequestException("La contrasena debe tener al menos 8 caracteres");
        }

        Administrador admin = new Administrador();
        admin.setNombre(nombre);
        admin.setEmail(email);
        admin.setClaveHash(passwordEncoder.encode(password));
        administradorRepository.save(admin);

        return new AuthResponse.AdminBasic(admin.getId(), admin.getNombre(), admin.getEmail());
    }

    @Transactional
    public Map<String, String> cambiarPassword(String adminId, String currentPassword, String newPassword) {
        if (newPassword == null || newPassword.length() < MIN_PASSWORD_LENGTH) {
            throw new UnauthorizedException("La nueva contrasena debe tener al menos 8 caracteres");
        }

        Administrador admin = administradorRepository.findById(adminId)
                .orElseThrow(() -> new UnauthorizedException("Administrador no encontrado"));

        if (!passwordEncoder.matches(currentPassword, admin.getClaveHash())) {
            throw new UnauthorizedException("La contrasena actual es incorrecta");
        }

        admin.setClaveHash(passwordEncoder.encode(newPassword));
        administradorRepository.save(admin);

        return Map.of("mensaje", "Contrasena actualizada exitosamente");
    }

    @Transactional
    public Map<String, String> resetPassword(String adminId, String nuevaPassword) {
        if (nuevaPassword == null || nuevaPassword.length() < MIN_PASSWORD_LENGTH) {
            throw new UnauthorizedException("La nueva contrasena debe tener al menos 8 caracteres");
        }

        Administrador admin = administradorRepository.findById(adminId)
                .orElseThrow(() -> new UnauthorizedException("Administrador no encontrado"));

        admin.setClaveHash(passwordEncoder.encode(nuevaPassword));
        administradorRepository.save(admin);

        return Map.of("mensaje", "Contrasena reseteada exitosamente");
    }
}
