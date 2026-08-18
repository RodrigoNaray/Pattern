package com.sistemapedidos.modules.pedido.dto;

public record PedidoInstruccionesPagoDto(
        String banco,
        String cbu,
        String alias,
        String titular,
        String mensajeTransferencia,
        String whatsappContacto,
        String numeroPedido,
        String totalFormateado,
        String estadoPedido,
        String enlaceWhatsApp) {
}
