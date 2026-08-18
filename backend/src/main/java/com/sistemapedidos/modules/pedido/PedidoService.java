package com.sistemapedidos.modules.pedido;

import com.sistemapedidos.common.error.BadRequestException;
import com.sistemapedidos.common.error.NotFoundException;
import com.sistemapedidos.domain.entity.ConfiguracionTienda;
import com.sistemapedidos.domain.entity.Notificacion;
import com.sistemapedidos.domain.entity.Pedido;
import com.sistemapedidos.domain.entity.PedidoItem;
import com.sistemapedidos.domain.entity.Producto;
import com.sistemapedidos.domain.enums.CanalNotificacion;
import com.sistemapedidos.domain.enums.EstadoPedido;
import com.sistemapedidos.domain.repository.ConfiguracionTiendaRepository;
import com.sistemapedidos.domain.repository.PedidoItemRepository;
import com.sistemapedidos.domain.repository.PedidoRepository;
import com.sistemapedidos.domain.repository.ProductoRepository;
import com.sistemapedidos.modules.pedido.dto.CreatePedidoDto;
import com.sistemapedidos.modules.pedido.dto.ExportarPedidosQueryDto;
import com.sistemapedidos.modules.pedido.dto.PedidoDetalle;
import com.sistemapedidos.modules.pedido.dto.PedidoInstruccionesPagoDto;
import com.sistemapedidos.modules.pedido.dto.PedidoOperacionesDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private static final DateTimeFormatter ISO_UTC = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    private static final String CARACTERES_CODIGO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final String EMAIL_REGEX = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$";

    private final PedidoRepository pedidoRepository;
    private final PedidoItemRepository pedidoItemRepository;
    private final ProductoRepository productoRepository;
    private final ConfiguracionTiendaRepository configuracionTiendaRepository;

    @Transactional
    public PedidoOperacionesDto.CreatePedidoResponse crear(CreatePedidoDto data) {
        if (!validarEmail(data.emailComprador())) {
            throw new BadRequestException("El email no tiene un formato valido");
        }
        if (data.telefonoComprador() == null || data.telefonoComprador().isBlank()) {
            throw new BadRequestException("El telefono es obligatorio");
        }
        if (data.items() == null || data.items().isEmpty()) {
            throw new BadRequestException("El carrito esta vacio");
        }

        String codigo = generarCodigoReferencia();
        LocalDateTime ahora = LocalDateTime.now(ZoneOffset.UTC);
        int vencimientoHoras = obtenerVencimientoHorasConfig();
        LocalDateTime vencidoEn = ahora.plusHours(vencimientoHoras);

        List<String> erroresStock = new ArrayList<>();
        Map<String, Producto> productosValidos = new HashMap<>();

        for (CreatePedidoDto.ItemDto item : data.items()) {
            Producto producto = productoRepository.findById(item.productoId())
                    .orElseThrow(() -> new NotFoundException("Producto con ID " + item.productoId() + " no encontrado"));

            if (producto.getStock() < item.cantidad()) {
                erroresStock.add(producto.getNombre() + " (talle: " + producto.getTalle()
                        + ", pedido: " + item.cantidad() + ", disponible: " + producto.getStock() + ")");
            } else {
                productosValidos.put(item.productoId(), producto);
            }
        }

        if (!erroresStock.isEmpty()) {
            throw new BadRequestException("Stock insuficiente: " + String.join("; ", erroresStock));
        }

        long totalCentavos = 0;
        Pedido pedido = new Pedido();
        pedido.setEmailComprador(data.emailComprador().trim());
        pedido.setTelefonoComprador(data.telefonoComprador().trim());
        pedido.setEstado(EstadoPedido.PENDIENTE_PAGO);
        pedido.setCodigo(codigo);
        pedido.setVencidoEn(vencidoEn);

        for (CreatePedidoDto.ItemDto item : data.items()) {
            Producto producto = productosValidos.get(item.productoId());

            long subtotal = producto.getPrecioCentavos() * item.cantidad();
            totalCentavos += subtotal;

            PedidoItem pedidoItem = new PedidoItem();
            pedidoItem.setPedido(pedido);
            pedidoItem.setProducto(producto);
            pedidoItem.setCantidad(item.cantidad());
            pedidoItem.setPrecioUnitarioCentavos(producto.getPrecioCentavos());
            pedidoItem.setSubtotalCentavos(subtotal);
            pedido.getItems().add(pedidoItem);
        }

        pedido.setTotalCentavos(totalCentavos);

        Notificacion notificacion = new Notificacion();
        notificacion.setCanal(CanalNotificacion.PANEL);
        notificacion.setMensaje("Nuevo pedido " + codigo + " recibido de " + pedido.getEmailComprador());
        notificacion.setPedido(pedido);
        pedido.getNotificaciones().add(notificacion);

        pedidoRepository.save(pedido);

        return new PedidoOperacionesDto.CreatePedidoResponse(
                "Pedido creado exitosamente",
                aResultadoCrear(pedido));
    }

    @Transactional(readOnly = true)
    public PedidoDetalle buscarPorCodigoYEmail(String codigo, String email) {
        Pedido pedido = pedidoRepository.findByCodigoYEmailConItems(codigo.trim(), email.trim().toLowerCase())
                .orElseThrow(() -> new NotFoundException("No se encontro un pedido con esos datos"));
        return construirPedidoDetalle(pedido);
    }

    @Transactional(readOnly = true)
    public PedidoDetalle obtenerUno(String id) {
        Pedido pedido = pedidoRepository.findByIdConItems(id)
                .orElseThrow(() -> new NotFoundException("Pedido no encontrado"));
        return construirPedidoDetalle(pedido);
    }

    @Transactional
    public PedidoOperacionesDto.ConfirmarPagoResult confirmarPago(String id) {
        Pedido pedido = pedidoRepository.findByIdConItems(id)
                .orElseThrow(() -> new NotFoundException("Pedido no encontrado"));

        if (pedido.getEstado() == EstadoPedido.PAGO_CONFIRMADO) {
            throw new BadRequestException("Este pedido ya fue confirmado");
        }

        List<String> productosInsuficientes = new ArrayList<>();
        List<String> productosNoEncontrados = new ArrayList<>();

        for (PedidoItem item : pedido.getItems()) {
            Optional<Producto> opcional = productoRepository.findById(item.getProducto().getId());
            if (opcional.isEmpty()) {
                productosNoEncontrados.add(item.getProducto().getId());
                continue;
            }
            Producto producto = opcional.get();
            if (producto.getStock() < item.getCantidad()) {
                productosInsuficientes.add(producto.getNombre() + " (pedido: " + item.getCantidad()
                        + ", disponible: " + producto.getStock() + ")");
            }
        }

        if (!productosNoEncontrados.isEmpty()) {
            throw new NotFoundException("Producto no encontrado: " + String.join(", ", productosNoEncontrados));
        }
        if (!productosInsuficientes.isEmpty()) {
            throw new BadRequestException("Stock insuficiente: " + String.join(", ", productosInsuficientes));
        }

        LocalDateTime confirmadoEn = LocalDateTime.now(ZoneOffset.UTC);
        pedido.setEstado(EstadoPedido.PAGO_CONFIRMADO);
        pedido.setConfirmadoEn(confirmadoEn);

        for (PedidoItem item : pedido.getItems()) {
            Producto producto = productoRepository.findByIdParaActualizar(item.getProducto().getId())
                    .orElseThrow(() -> new NotFoundException("Producto no encontrado: " + item.getProducto().getId()));

            if (producto.getStock() < item.getCantidad()) {
                throw new BadRequestException("Stock insuficiente: " + producto.getNombre()
                        + " (pedido: " + item.getCantidad() + ", disponible: " + producto.getStock() + ")");
            }

            producto.setStock(producto.getStock() - item.getCantidad());
            if (producto.getStock() <= 0) {
                producto.setActivo(false);
            }
        }

        pedido.getNotificaciones().add(crearNotificacion(
                CanalNotificacion.EMAIL,
                "Tu pedido " + pedido.getCodigo() + " fue confirmado. Pago recibido exitosamente.",
                pedido));
        pedido.getNotificaciones().add(crearNotificacion(
                CanalNotificacion.PANEL,
                "Pago del pedido " + pedido.getCodigo() + " confirmado por el administrador",
                pedido));

        pedidoRepository.save(pedido);

        return new PedidoOperacionesDto.ConfirmarPagoResult(
                pedido.getId(),
                pedido.getCodigo(),
                EstadoPedido.PAGO_CONFIRMADO.name(),
                confirmadoEn,
                pedido.getTotalCentavos());
    }

    @Transactional
    public PedidoOperacionesDto.CancelarPedidoResponse cancelar(String id) {
        Pedido pedido = pedidoRepository.findByIdConItems(id)
                .orElseThrow(() -> new NotFoundException("Pedido no encontrado"));

        if (pedido.getEstado() == EstadoPedido.PAGO_CONFIRMADO) {
            throw new BadRequestException("No se puede cancelar un pedido confirmado");
        }
        if (pedido.getEstado() == EstadoPedido.CANCELADO) {
            throw new BadRequestException("Este pedido ya fue cancelado");
        }

        pedido.setEstado(EstadoPedido.CANCELADO);

        pedido.getNotificaciones().add(crearNotificacion(
                CanalNotificacion.EMAIL,
                "Tu pedido " + pedido.getCodigo() + " fue cancelado.",
                pedido));
        pedido.getNotificaciones().add(crearNotificacion(
                CanalNotificacion.PANEL,
                "Pedido " + pedido.getCodigo() + " cancelado por el administrador",
                pedido));

        pedidoRepository.save(pedido);

        return new PedidoOperacionesDto.CancelarPedidoResponse(
                "Pedido cancelado exitosamente",
                new PedidoOperacionesDto.CancelarPedidoResult(
                        pedido.getId(),
                        pedido.getCodigo(),
                        EstadoPedido.CANCELADO.name(),
                        pedido.getTotalCentavos()));
    }

    @Transactional(readOnly = true)
    public PedidoOperacionesDto.PaginadoPedidosPendientes listarPendientes(int pagina, int tamano) {
        int paginaSegura = Math.max(pagina, 1);
        int tamanoSeguro = Math.max(tamano, 1);

        Page<Pedido> page = pedidoRepository.findByEstadoOrderByCreadoEnDesc(
                EstadoPedido.PENDIENTE_PAGO,
                PageRequest.of(paginaSegura - 1, tamanoSeguro));

        List<String> ids = page.getContent().stream().map(Pedido::getId).toList();
        Map<String, Long> conteos = new HashMap<>();
        if (!ids.isEmpty()) {
            for (Object[] fila : pedidoItemRepository.countAgrupado(ids)) {
                conteos.put((String) fila[0], (Long) fila[1]);
            }
        }

        List<PedidoOperacionesDto.PedidoPendienteDto> pedidos = page.getContent().stream()
                .map(p -> new PedidoOperacionesDto.PedidoPendienteDto(
                        p.getId(),
                        p.getCodigo(),
                        p.getEmailComprador(),
                        p.getTelefonoComprador(),
                        p.getTotalCentavos(),
                        p.getCreadoEn(),
                        p.getVencidoEn(),
                        conteos.getOrDefault(p.getId(), 0L).intValue()))
                .toList();

        return new PedidoOperacionesDto.PaginadoPedidosPendientes(pedidos, page.getTotalElements(), paginaSegura, tamanoSeguro);
    }

    @Transactional(readOnly = true)
    public List<Pedido> listarTodosParaExport(ExportarPedidosQueryDto filtros) {
        EstadoPedido estado = null;
        if (filtros.estado() != null && !filtros.estado().isBlank()) {
            try {
                estado = EstadoPedido.valueOf(filtros.estado());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("El estado debe ser PENDIENTE_PAGO, PAGO_CONFIRMADO o CANCELADO");
            }
        }

        LocalDateTime desde = parsearFecha(filtros.desde());
        LocalDateTime hasta = parsearFecha(filtros.hasta());

        List<Pedido> pedidos = pedidoRepository.findAll(
                PedidoSpecifications.paraExport(estado, desde, hasta),
                org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "creadoEn"));

        Map<String, Pedido> unicos = new LinkedHashMap<>();
        for (Pedido pedido : pedidos) {
            unicos.putIfAbsent(pedido.getId(), pedido);
        }
        return new ArrayList<>(unicos.values());
    }

    public static String generarCsv(List<Pedido> pedidos) {
        StringBuilder sb = new StringBuilder();
        sb.append('\uFEFF');
        sb.append("codigo,fecha,email,telefono,estado,producto,talle,cantidad,precio_unitario_centavos,subtotal_centavos,total_pedido_centavos");
        sb.append("\r\n");

        for (Pedido pedido : pedidos) {
            String totalCentavos = String.valueOf(pedido.getTotalCentavos());
            String fechaIso = pedido.getCreadoEn().format(ISO_UTC);

            for (PedidoItem item : pedido.getItems()) {
                String[] fila = {
                        pedido.getCodigo(),
                        fechaIso,
                        pedido.getEmailComprador(),
                        pedido.getTelefonoComprador(),
                        pedido.getEstado().name(),
                        item.getProducto().getNombre(),
                        item.getProducto().getTalle(),
                        String.valueOf(item.getCantidad()),
                        String.valueOf(item.getPrecioUnitarioCentavos()),
                        String.valueOf(item.getSubtotalCentavos()),
                        totalCentavos
                };
                for (int i = 0; i < fila.length; i++) {
                    if (i > 0) sb.append(',');
                    sb.append(escaparCsv(fila[i]));
                }
                sb.append("\r\n");
            }
        }
        return sb.toString();
    }

    @Transactional(readOnly = true)
    public PedidoInstruccionesPagoDto obtenerInstruccionesPago(String pedidoId) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new NotFoundException("Pedido no encontrado"));

        ConfiguracionTienda configuracion = configuracionTiendaRepository.findById("global").orElse(null);
        if (configuracion == null) {
            throw new BadRequestException("Datos de pago no disponibles");
        }

        String banco = nvl(configuracion.getBanco());
        String cbu = nvl(configuracion.getCbu());
        String alias = nvl(configuracion.getAlias());
        String titular = nvl(configuracion.getTitular());
        String whatsappContacto = nvl(configuracion.getWhatsappContacto());

        if (banco.isBlank() || cbu.isBlank() || alias.isBlank() || titular.isBlank() || whatsappContacto.isBlank()) {
            throw new BadRequestException("Datos de pago no disponibles");
        }

        String whatsappNumeros = whatsappContacto.replaceAll("[^0-9]", "");
        String mensajeReferencia = encodeURIComponent(
                "Hola! Quiero enviar el comprobante de transferencia del pedido " + pedido.getCodigo() + ".");
        String enlaceWhatsApp = "https://wa.me/" + whatsappNumeros + "?text=" + mensajeReferencia;

        return new PedidoInstruccionesPagoDto(
                banco,
                cbu,
                alias,
                titular,
                nvl(configuracion.getMensajeTransferencia()),
                whatsappContacto,
                pedido.getCodigo(),
                formatearPrecioUYU(pedido.getTotalCentavos()),
                pedido.getEstado().name(),
                enlaceWhatsApp);
    }

    private PedidoOperacionesDto.CreatePedidoResult aResultadoCrear(Pedido pedido) {
        return new PedidoOperacionesDto.CreatePedidoResult(
                pedido.getId(),
                pedido.getCodigo(),
                pedido.getEmailComprador(),
                pedido.getTelefonoComprador(),
                pedido.getEstado().name(),
                pedido.getTotalCentavos(),
                pedido.getItems().stream().map(this::aItemResumen).toList(),
                pedido.getCreadoEn(),
                pedido.getVencidoEn());
    }

    private PedidoDetalle construirPedidoDetalle(Pedido pedido) {
        return new PedidoDetalle(
                pedido.getId(),
                pedido.getCodigo(),
                pedido.getEmailComprador(),
                pedido.getTelefonoComprador(),
                pedido.getEstado().name(),
                pedido.getTotalCentavos(),
                pedido.getCreadoEn(),
                pedido.getConfirmadoEn(),
                pedido.getVencidoEn(),
                pedido.getItems().stream().map(this::aItemDetalle).toList());
    }

    private PedidoOperacionesDto.CreatePedidoResult.Item aItemResumen(PedidoItem item) {
        return new PedidoOperacionesDto.CreatePedidoResult.Item(
                item.getId(),
                item.getProducto().getId(),
                item.getCantidad(),
                item.getPrecioUnitarioCentavos(),
                item.getSubtotalCentavos(),
                new PedidoOperacionesDto.CreatePedidoResult.Item.Producto(
                        item.getProducto().getNombre(),
                        item.getProducto().getTalle()));
    }

    private PedidoDetalle.Item aItemDetalle(PedidoItem item) {
        return new PedidoDetalle.Item(
                item.getId(),
                item.getProducto().getId(),
                item.getCantidad(),
                item.getPrecioUnitarioCentavos(),
                item.getSubtotalCentavos(),
                new PedidoDetalle.Item.Producto(
                        item.getProducto().getNombre(),
                        item.getProducto().getTalle()));
    }

    private Notificacion crearNotificacion(CanalNotificacion canal, String mensaje, Pedido pedido) {
        Notificacion notificacion = new Notificacion();
        notificacion.setCanal(canal);
        notificacion.setMensaje(mensaje);
        notificacion.setPedido(pedido);
        return notificacion;
    }

    private boolean validarEmail(String email) {
        return email != null && email.matches(EMAIL_REGEX);
    }

    private String generarCodigoReferencia() {
        ThreadLocalRandom random = ThreadLocalRandom.current();
        StringBuilder codigo = new StringBuilder("PED-");
        for (int i = 0; i < 8; i++) {
            codigo.append(CARACTERES_CODIGO.charAt(random.nextInt(CARACTERES_CODIGO.length())));
        }
        return codigo.toString();
    }

    private int obtenerVencimientoHorasConfig() {
        return configuracionTiendaRepository.findById("global")
                .map(c -> c.getPedidoVencimientoHoras() != null ? c.getPedidoVencimientoHoras() : 48)
                .orElse(48);
    }

    private LocalDateTime parsearFecha(String valor) {
        if (valor == null || valor.isBlank()) return null;
        try {
            return java.time.Instant.parse(valor).atZone(ZoneOffset.UTC).toLocalDateTime();
        } catch (Exception e) {
            throw new BadRequestException("La fecha debe tener formato ISO 8601 (ej: 2026-01-01T00:00:00.000Z)");
        }
    }

    private String formatearPrecioUYU(long centavos) {
        NumberFormat formateador = NumberFormat.getCurrencyInstance(new Locale("es", "UY"));
        formateador.setMinimumFractionDigits(0);
        formateador.setMaximumFractionDigits(0);
        return formateador.format(java.math.BigDecimal.valueOf(centavos, 2));
    }

    private String encodeURIComponent(String valor) {
        return URLEncoder.encode(valor, StandardCharsets.UTF_8)
                .replace("+", "%20")
                .replace("%21", "!");
    }

    private static String escaparCsv(String valor) {
        if (valor == null) return "";
        if (valor.matches(".*[\",\\r\\n].*")) {
            return "\"" + valor.replace("\"", "\"\"") + "\"";
        }
        return valor;
    }

    private static String nvl(String valor) {
        return valor != null ? valor : "";
    }
}
