package com.sistemapedidos.modules.producto;

import com.sistemapedidos.domain.entity.Producto;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public final class ProductoSpecifications {

    private ProductoSpecifications() {
    }

    public static Specification<Producto> filtros(Boolean activo, String talle, String q) {
        return (root, query, cb) -> {
            List<Predicate> predicados = new ArrayList<>();
            if (activo != null) {
                predicados.add(cb.equal(root.get("activo"), activo));
            }
            if (talle != null && !talle.isBlank()) {
                predicados.add(cb.equal(root.get("talle"), talle));
            }
            if (q != null && !q.isBlank()) {
                predicados.add(cb.like(cb.lower(root.get("nombre")), "%" + q.trim().toLowerCase() + "%"));
            }
            return cb.and(predicados.toArray(new Predicate[0]));
        };
    }
}
