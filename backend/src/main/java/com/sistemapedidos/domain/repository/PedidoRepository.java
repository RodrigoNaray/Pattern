package com.sistemapedidos.domain.repository;

import com.sistemapedidos.domain.entity.Pedido;
import com.sistemapedidos.domain.enums.EstadoPedido;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PedidoRepository extends JpaRepository<Pedido, String>, JpaSpecificationExecutor<Pedido> {

    Optional<Pedido> findByCodigo(String codigo);

    Page<Pedido> findByEstadoOrderByCreadoEnDesc(EstadoPedido estado, Pageable pageable);

    long countByEstado(EstadoPedido estado);

    @Query("SELECT p FROM Pedido p LEFT JOIN FETCH p.items i LEFT JOIN FETCH i.producto WHERE p.id = :id")
    Optional<Pedido> findByIdConItems(@Param("id") String id);

    @Query("SELECT p FROM Pedido p LEFT JOIN FETCH p.items i LEFT JOIN FETCH i.producto WHERE p.codigo = :codigo AND p.emailComprador = :email")
    Optional<Pedido> findByCodigoYEmailConItems(@Param("codigo") String codigo, @Param("email") String email);
}
