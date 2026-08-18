package com.sistemapedidos.modules.administrador;

import com.sistemapedidos.modules.auth.dto.AuthResponse;
import com.sistemapedidos.modules.administrador.dto.ResetPasswordDto;
import com.sistemapedidos.modules.auth.AuthService;
import com.sistemapedidos.modules.auth.dto.LoginAdminDto;
import com.sistemapedidos.modules.auth.dto.RegistrarAdminDto;
import com.sistemapedidos.common.error.BadRequestException;
import com.sistemapedidos.common.error.NotFoundException;
import com.sistemapedidos.domain.entity.Administrador;
import com.sistemapedidos.domain.repository.AdministradorRepository;
import com.sistemapedidos.security.SecurityUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/administradores")
@RequiredArgsConstructor
public class AdministradorController {

    private final AuthService authService;
    private final AdministradorRepository administradorRepository;

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginAdminDto dto) {
        return authService.validarAdmin(dto.email(), dto.password());
    }

    @GetMapping
    public List<AdminDto> listar() {
        return administradorRepository.findAllByOrderByCreadoEnAsc().stream()
                .map(this::aDto)
                .toList();
    }

    @GetMapping("/{id}")
    public AdminDto obtenerUno(@PathVariable String id) {
        return administradorRepository.findById(id)
                .map(this::aDto)
                .orElseThrow(() -> new NotFoundException("Administrador no encontrado"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse.AdminBasic crear(@Valid @RequestBody RegistrarAdminDto dto) {
        return authService.registrarAdmin(dto.nombre(), dto.email(), dto.password());
    }

    @PatchMapping("/{id}")
    public AdminDto actualizar(@PathVariable String id, @RequestBody ActualizarAdminBody body) {
        Administrador admin = administradorRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Administrador no encontrado"));

        if (body.email() != null && !body.email().equals(admin.getEmail())) {
            if (administradorRepository.findByEmail(body.email()).isPresent()) {
                throw new BadRequestException("El email ya esta registrado");
            }
            admin.setEmail(body.email());
        }
        if (body.nombre() != null) {
            admin.setNombre(body.nombre());
        }

        administradorRepository.save(admin);
        return aDto(admin);
    }

    @PostMapping("/{id}/reset-password")
    public Map<String, String> resetPassword(@PathVariable String id,
                                             @Valid @RequestBody ResetPasswordDto dto,
                                             Authentication authentication) {
        SecurityUser usuario = (SecurityUser) authentication.getPrincipal();
        if (usuario.id().equals(id)) {
            throw new BadRequestException("No puedes resetear tu propia contrasena. Usa la opcion 'Mi cuenta' para cambiarla.");
        }
        return authService.resetPassword(id, dto.nuevaPassword());
    }

    @DeleteMapping("/{id}")
    public Map<String, String> eliminar(@PathVariable String id, Authentication authentication) {
        SecurityUser usuario = (SecurityUser) authentication.getPrincipal();
        if (usuario.id().equals(id)) {
            throw new BadRequestException("No puedes eliminarte a ti mismo");
        }

        Administrador admin = administradorRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Administrador no encontrado"));
        administradorRepository.delete(admin);

        return Map.of("mensaje", "Administrador eliminado exitosamente");
    }

    private AdminDto aDto(Administrador admin) {
        return new AdminDto(admin.getId(), admin.getNombre(), admin.getEmail(), admin.getUltimoAccesoEn());
    }

    public record AdminDto(String id, String nombre, String email, LocalDateTime ultimoAccesoEn) {
    }

    public record ActualizarAdminBody(String nombre, String email) {
    }
}
