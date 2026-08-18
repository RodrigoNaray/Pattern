package com.sistemapedidos.modules.pedido;

import com.sistemapedidos.domain.entity.Pedido;
import com.sistemapedidos.domain.entity.PedidoItem;
import com.sistemapedidos.domain.enums.EstadoPedido;
import jakarta.persistence.criteria.Fetch;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public final class PedidoSpecifications {

    private PedidoSpecifications() {
    }

    public static Specification<Pedido> paraExport(EstadoPedido estado, LocalDateTime desde, LocalDateTime hasta) {
        return (root, query, cb) -> {
            Fetch<Pedido, PedidoItem> items = root.fetch("items", JoinType.LEFT);
            items.fetch("producto", JoinType.LEFT);

            List<Predicate> predicados = new ArrayList<>();
            if (estado != null) {
                predicados.add(cb.equal(root.get("estado"), estado));
            }
            if (desde != null) {
                predicados.add(cb.greaterThanOrEqualTo(root.get("creadoEn"), desde));
            }
            if (hasta != null) {
                predicados.add(cb.lessThanOrEqualTo(root.get("creadoEn"), hasta));
            }
            return cb.and(predicados.toArray(new Predicate[0]));
        };
    }
}
