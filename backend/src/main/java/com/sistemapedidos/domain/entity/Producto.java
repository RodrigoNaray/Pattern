package com.sistemapedidos.domain.entity;

import com.sistemapedidos.domain.entity.base.EntidadBase;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "productos")
@Getter
@Setter
@NoArgsConstructor
public class Producto extends EntidadBase {

    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "talle", nullable = false)
    private String talle;

    @Column(name = "precioCentavos", nullable = false)
    private Long precioCentavos;

    @Column(name = "stock", nullable = false)
    private Integer stock;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "imagenes", columnDefinition = "text[]")
    private List<String> imagenes = new ArrayList<>();

    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @Column(name = "creadoEn", nullable = false)
    private LocalDateTime creadoEn;

    @Column(name = "actualizadoEn", nullable = false)
    private LocalDateTime actualizadoEn;

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PedidoItem> items = new ArrayList<>();

    @PrePersist
    private void prePersistTimestamps() {
        LocalDateTime ahora = LocalDateTime.now(ZoneOffset.UTC);
        if (creadoEn == null) {
            creadoEn = ahora;
        }
        if (actualizadoEn == null) {
            actualizadoEn = ahora;
        }
    }

    @PreUpdate
    private void preUpdateTimestamps() {
        actualizadoEn = LocalDateTime.now(ZoneOffset.UTC);
    }
}
