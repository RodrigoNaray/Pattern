package com.sistemapedidos.domain.entity;

import com.sistemapedidos.domain.entity.base.EntidadBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Entity
@Table(name = "configuraciones")
@Getter
@Setter
@NoArgsConstructor
public class ConfiguracionTienda extends EntidadBase {

    @Column(name = "nombreTienda")
    private String nombreTienda;

    @Column(name = "whatsappContacto")
    private String whatsappContacto;

    @Column(name = "banco")
    private String banco;

    @Column(name = "cbu")
    private String cbu;

    @Column(name = "alias")
    private String alias;

    @Column(name = "titular")
    private String titular;

    @Column(name = "mensajeTransferencia")
    private String mensajeTransferencia;

    @Column(name = "actualizadoEn", nullable = false)
    private LocalDateTime actualizadoEn;

    @Column(name = "pedidoVencimientoHoras", nullable = false)
    private Integer pedidoVencimientoHoras = 48;

    @Column(name = "estadoProductoBorrador", nullable = false)
    private Boolean estadoProductoBorrador = true;

    @PrePersist
    private void prePersistTimestamps() {
        if (actualizadoEn == null) {
            actualizadoEn = LocalDateTime.now(ZoneOffset.UTC);
        }
    }

    @PreUpdate
    private void preUpdateTimestamps() {
        actualizadoEn = LocalDateTime.now(ZoneOffset.UTC);
    }
}
