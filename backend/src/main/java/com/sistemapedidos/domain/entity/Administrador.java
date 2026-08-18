package com.sistemapedidos.domain.entity;

import com.sistemapedidos.domain.entity.base.EntidadBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Entity
@Table(name = "administradores")
@Getter
@Setter
@NoArgsConstructor
public class Administrador extends EntidadBase {

    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "claveHash", nullable = false)
    private String claveHash;

    @Column(name = "creadoEn", nullable = false)
    private LocalDateTime creadoEn;

    @Column(name = "ultimoAccesoEn")
    private LocalDateTime ultimoAccesoEn;

    @PrePersist
    private void prePersistTimestamps() {
        if (creadoEn == null) {
            creadoEn = LocalDateTime.now(ZoneOffset.UTC);
        }
    }
}
