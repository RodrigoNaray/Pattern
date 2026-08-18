package com.sistemapedidos.modules.configuracion;

import com.sistemapedidos.modules.configuracion.dto.ConfiguracionTiendaResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/configuracion-tienda")
@RequiredArgsConstructor
public class ConfiguracionPublicaController {

    private final ConfiguracionTiendaService configuracionService;

    @GetMapping("/publica")
    public ConfiguracionTiendaResponse.ConfiguracionPublica obtenerPublica() {
        ConfiguracionTiendaResponse config = configuracionService.obtener();
        return new ConfiguracionTiendaResponse.ConfiguracionPublica(
                config.nombreTienda(),
                config.whatsappContacto());
    }
}
