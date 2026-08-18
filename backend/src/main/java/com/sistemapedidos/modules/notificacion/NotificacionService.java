package com.sistemapedidos.modules.notificacion;

import com.sistemapedidos.common.error.NotFoundException;
import com.sistemapedidos.domain.entity.Notificacion;
import com.sistemapedidos.domain.entity.Pedido;
import com.sistemapedidos.domain.repository.NotificacionRepository;
import com.sistemapedidos.modules.notificacion.dto.ListarNotificacionesDto;
import com.sistemapedidos.modules.notificacion.dto.NotificacionDetalle;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;

    @Transactional(readOnly = true)
    public List<NotificacionDetalle.NotificacionDto> listar(ListarNotificacionesDto filtros) {
        List<Notificacion> notificaciones = "unread".equals(filtros.filtro())
                ? notificacionRepository.findByLeidaFalseOrderByCreadoEnDesc()
                : notificacionRepository.findAllByOrderByCreadoEnDesc();
        return notificaciones.stream()
                .map(this::aDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public NotificacionDetalle obtenerDetalle(String id) {
        Notificacion notificacion = notificacionRepository.findByIdConPedido(id)
                .orElseThrow(() -> new NotFoundException("Notificacion no encontrada"));

        Pedido pedido = notificacion.getPedido();
        NotificacionDetalle.PedidoResumido pedidoResumido = pedido != null
                ? new NotificacionDetalle.PedidoResumido(
                        pedido.getId(),
                        pedido.getEmailComprador(),
                        pedido.getTelefonoComprador(),
                        pedido.getEstado().name(),
                        pedido.getTotalCentavos(),
                        pedido.getCodigo(),
                        pedido.getCreadoEn(),
                        pedido.getConfirmadoEn(),
                        pedido.getVencidoEn())
                : null;

        return new NotificacionDetalle(aDto(notificacion), pedidoResumido);
    }

    @Transactional
    public Map<String, Object> marcarComoLeida(String id) {
        Notificacion notificacion = notificacionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Notificacion no encontrada"));

        if (!notificacion.getLeida()) {
            notificacion.setLeida(true);
            notificacionRepository.save(notificacion);
        }

        return Map.of("id", notificacion.getId(), "leida", notificacion.getLeida(), "creadoEn", notificacion.getCreadoEn());
    }

    private NotificacionDetalle.NotificacionDto aDto(Notificacion notificacion) {
        return new NotificacionDetalle.NotificacionDto(
                notificacion.getId(),
                notificacion.getCanal().name(),
                notificacion.getMensaje(),
                notificacion.getLeida(),
                notificacion.getCreadoEn(),
                notificacion.getPedido() != null ? notificacion.getPedido().getId() : null);
    }
}
