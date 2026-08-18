package com.sistemapedidos.domain.repository;

import com.sistemapedidos.domain.entity.PedidoItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface PedidoItemRepository extends JpaRepository<PedidoItem, String> {

    List<PedidoItem> findAllByPedidoIdIn(Collection<String> pedidoIds);

    @Query("SELECT pi.pedido.id, COUNT(pi) FROM PedidoItem pi WHERE pi.pedido.id IN :ids GROUP BY pi.pedido.id")
    List<Object[]> countAgrupado(@Param("ids") Collection<String> ids);
}
