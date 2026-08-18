package com.sistemapedidos.domain.entity;

import com.sistemapedidos.domain.entity.base.EntidadBase;
import com.sistemapedidos.domain.enums.EstadoPedido;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
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
@Table(name = "pedidos")
@Getter
@Setter
@NoArgsConstructor
public class Pedido extends EntidadBase {

    @Column(name = "emailComprador", nullable = false)
    private String emailComprador;

    @Column(name = "telefonoComprador", nullable = false)
    private String telefonoComprador;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "estado", columnDefinition = "EstadoPedido", nullable = false)
    private EstadoPedido estado = EstadoPedido.PENDIENTE_PAGO;

    @Column(name = "totalCentavos", nullable = false)
    private Long totalCentavos;

    @Column(name = "codigo", nullable = false, unique = true)
    private String codigo;

    @Column(name = "creadoEn", nullable = false)
    private LocalDateTime creadoEn;

    @Column(name = "confirmadoEn")
    private LocalDateTime confirmadoEn;

    @Column(name = "vencidoEn", nullable = false)
    private LocalDateTime vencidoEn;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PedidoItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Notificacion> notificaciones = new ArrayList<>();

    @PrePersist
    private void prePersistTimestamps() {
        if (creadoEn == null) {
            creadoEn = LocalDateTime.now(ZoneOffset.UTC);
        }
    }
}
