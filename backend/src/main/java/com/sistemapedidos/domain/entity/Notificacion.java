package com.sistemapedidos.domain.entity;

import com.sistemapedidos.domain.entity.base.EntidadBase;
import com.sistemapedidos.domain.enums.CanalNotificacion;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Entity
@Table(name = "notificaciones")
@Getter
@Setter
@NoArgsConstructor
public class Notificacion extends EntidadBase {

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "canal", columnDefinition = "CanalNotificacion", nullable = false)
    private CanalNotificacion canal;

    @Column(name = "mensaje", nullable = false)
    private String mensaje;

    @Column(name = "leida", nullable = false)
    private Boolean leida = false;

    @Column(name = "creadoEn", nullable = false)
    private LocalDateTime creadoEn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedidoId")
    private Pedido pedido;

    @PrePersist
    private void prePersistTimestamps() {
        if (creadoEn == null) {
            creadoEn = LocalDateTime.now(ZoneOffset.UTC);
        }
    }
}
