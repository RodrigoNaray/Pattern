package com.sistemapedidos.modules.notificacion;

import com.sistemapedidos.modules.notificacion.dto.ListarNotificacionesDto;
import com.sistemapedidos.modules.notificacion.dto.NotificacionDetalle;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/notificaciones")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificacionService notificacionService;

    @GetMapping
    public List<NotificacionDetalle.NotificacionDto> listar(@Valid ListarNotificacionesDto filtros) {
        return notificacionService.listar(filtros);
    }

    @GetMapping("/{id}/detalle")
    public NotificacionDetalle obtenerDetalle(@PathVariable String id) {
        return notificacionService.obtenerDetalle(id);
    }

    @PatchMapping("/{id}/leida")
    public Map<String, Object> marcarComoLeida(@PathVariable String id) {
        return notificacionService.marcarComoLeida(id);
    }
}
