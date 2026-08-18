package com.sistemapedidos.domain.entity.base;

import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@MappedSuperclass
@Getter
@Setter
public abstract class EntidadBase {

    @Id
    protected String id;

    @PrePersist
    protected void generarId() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
    }
}
