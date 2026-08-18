package com.sistemapedidos.modules.configuracion;

import com.sistemapedidos.domain.entity.ConfiguracionTienda;
import com.sistemapedidos.domain.repository.ConfiguracionTiendaRepository;
import com.sistemapedidos.modules.configuracion.dto.ConfiguracionTiendaResponse;
import com.sistemapedidos.modules.configuracion.dto.ConfigurarTiendaDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ConfiguracionTiendaService {

    public static final String ID_GLOBAL = "global";

    private final ConfiguracionTiendaRepository configuracionTiendaRepository;

    @Transactional
    public ConfiguracionTiendaResponse obtener() {
        ConfiguracionTienda configuracion = configuracionTiendaRepository.findById(ID_GLOBAL)
                .orElseGet(() -> {
                    ConfiguracionTienda nueva = new ConfiguracionTienda();
                    nueva.setId(ID_GLOBAL);
                    return configuracionTiendaRepository.save(nueva);
                });
        return mapearRespuesta(configuracion);
    }

    @Transactional
    public ConfiguracionTiendaResponse actualizar(ConfigurarTiendaDto dto) {
        ConfiguracionTienda configuracion = configuracionTiendaRepository.findById(ID_GLOBAL)
                .orElseGet(() -> {
                    ConfiguracionTienda nueva = new ConfiguracionTienda();
                    nueva.setId(ID_GLOBAL);
                    return nueva;
                });

        if (dto.nombreTienda() != null) configuracion.setNombreTienda(dto.nombreTienda());
        if (dto.whatsappContacto() != null) configuracion.setWhatsappContacto(dto.whatsappContacto());
        if (dto.banco() != null) configuracion.setBanco(dto.banco());
        if (dto.cbu() != null) configuracion.setCbu(dto.cbu());
        if (dto.alias() != null) configuracion.setAlias(dto.alias());
        if (dto.titular() != null) configuracion.setTitular(dto.titular());
        if (dto.mensajeTransferencia() != null) configuracion.setMensajeTransferencia(dto.mensajeTransferencia());
        if (dto.pedidoVencimientoHoras() != null) configuracion.setPedidoVencimientoHoras(dto.pedidoVencimientoHoras());
        if (dto.estadoProductoBorrador() != null) configuracion.setEstadoProductoBorrador(dto.estadoProductoBorrador());

        configuracionTiendaRepository.save(configuracion);
        return mapearRespuesta(configuracion);
    }

    private ConfiguracionTiendaResponse mapearRespuesta(ConfiguracionTienda config) {
        return new ConfiguracionTiendaResponse(
                config.getId(),
                config.getNombreTienda(),
                config.getWhatsappContacto(),
                config.getBanco(),
                config.getCbu(),
                config.getAlias(),
                config.getTitular(),
                config.getMensajeTransferencia(),
                config.getPedidoVencimientoHoras(),
                config.getEstadoProductoBorrador(),
                config.getActualizadoEn());
    }
}
