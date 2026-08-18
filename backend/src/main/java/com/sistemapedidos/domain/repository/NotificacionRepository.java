package com.sistemapedidos.domain.repository;

import com.sistemapedidos.domain.entity.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface NotificacionRepository extends JpaRepository<Notificacion, String> {

    List<Notificacion> findAllByOrderByCreadoEnDesc();

    List<Notificacion> findByLeidaFalseOrderByCreadoEnDesc();

    @Query("SELECT n FROM Notificacion n LEFT JOIN FETCH n.pedido WHERE n.id = :id")
    Optional<Notificacion> findByIdConPedido(@Param("id") String id);
}
