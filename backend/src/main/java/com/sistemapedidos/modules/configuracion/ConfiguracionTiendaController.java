package com.sistemapedidos.modules.configuracion;

import com.sistemapedidos.modules.configuracion.dto.ConfiguracionTiendaResponse;
import com.sistemapedidos.modules.configuracion.dto.ConfigurarTiendaDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/admin/configuracion")
@RequiredArgsConstructor
public class ConfiguracionTiendaController {

    private final ConfiguracionTiendaService configuracionService;

    @GetMapping
    public ConfiguracionTiendaResponse obtener() {
        return configuracionService.obtener();
    }

    @PutMapping
    public Map<String, Object> actualizar(@Valid @RequestBody ConfigurarTiendaDto dto) {
        ConfiguracionTiendaResponse configuracion = configuracionService.actualizar(dto);
        return Map.of("mensaje", "Configuracion actualizada exitosamente", "configuracion", configuracion);
    }
}
