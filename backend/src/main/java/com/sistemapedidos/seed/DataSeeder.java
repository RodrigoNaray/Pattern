package com.sistemapedidos.seed;

import com.sistemapedidos.domain.entity.Administrador;
import com.sistemapedidos.domain.entity.ConfiguracionTienda;
import com.sistemapedidos.domain.entity.Notificacion;
import com.sistemapedidos.domain.entity.Pedido;
import com.sistemapedidos.domain.entity.PedidoItem;
import com.sistemapedidos.domain.entity.Producto;
import com.sistemapedidos.domain.enums.CanalNotificacion;
import com.sistemapedidos.domain.enums.EstadoPedido;
import com.sistemapedidos.domain.repository.AdministradorRepository;
import com.sistemapedidos.domain.repository.ConfiguracionTiendaRepository;
import com.sistemapedidos.domain.repository.PedidoRepository;
import com.sistemapedidos.domain.repository.ProductoRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app", name = "seed-enabled", havingValue = "true", matchIfMissing = true)
public class DataSeeder implements ApplicationRunner {

    private static final String ADMIN_EMAIL = "admin@tienda.com";

    private final AdministradorRepository administradorRepository;
    private final ConfiguracionTiendaRepository configuracionTiendaRepository;
    private final ProductoRepository productoRepository;
    private final PedidoRepository pedidoRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityManager entityManager;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedAdministrador();
        seedConfiguracion();
        seedProductos();
        seedPedidoEjemplo();
    }

    private void seedAdministrador() {
        if (administradorRepository.findByEmail(ADMIN_EMAIL).isPresent()) {
            return;
        }
        Administrador admin = new Administrador();
        admin.setNombre("Administrador");
        admin.setEmail(ADMIN_EMAIL);
        admin.setClaveHash(passwordEncoder.encode("admin123"));
        administradorRepository.save(admin);
    }

    private void seedConfiguracion() {
        if (configuracionTiendaRepository.findById("global").isPresent()) {
            return;
        }
        ConfiguracionTienda config = new ConfiguracionTienda();
        config.setId("global");
        config.setNombreTienda("Tienda de Ropa");
        config.setWhatsappContacto("+598991234567");
        config.setBanco("Banco de la Nacion Argentina");
        config.setCbu("0000003123000001234567");
        config.setAlias("tienda.ropa.pago");
        config.setTitular("Tienda de Ropa SRL");
        config.setMensajeTransferencia("Por favor enviar el comprobante por WhatsApp junto con el codigo de referencia.");
        config.setPedidoVencimientoHoras(48);
        config.setEstadoProductoBorrador(true);
        configuracionTiendaRepository.save(config);
    }

    private void seedProductos() {
        if (productoRepository.count() > 0) {
            return;
        }

        List<Producto> productos = List.of(
                producto("00000000-0000-0000-0000-000000000001", "Camiseta Basica",
                        "Camiseta de algodo organico, ideal para uso diario. Suave, comoda y transpirable.",
                        "M", 1500, 50,
                        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"),
                producto("00000000-0000-0000-0000-000000000002", "Pantalón Chino",
                        "Pantalon chino de corte clasico. Tela stretch de alta comodidad.",
                        "L", 3500, 30,
                        "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400&h=400&fit=crop"),
                producto("00000000-0000-0000-0000-000000000003", "Remera Deporte",
                        "Remera tecnica con tecnologia Dry-Fit para actividades deportivas.",
                        "S", 2800, 40,
                        "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400&h=400&fit=crop"),
                producto("00000000-0000-0000-0000-000000000004", "Campera Impermeable",
                        "Campera con capa impermeable y capucha integrada. Perfecta para la lluvia.",
                        "XL", 8500, 15,
                        "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400&h=400&fit=crop"),
                producto("00000000-0000-0000-0000-000000000005", "Bermuda Casual",
                        "Bermuda de algodon liviano con bolsillos laterales.",
                        "M", 2200, 35,
                        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop"),
                producto("00000000-0000-0000-0000-000000000006", "Sueter Lana",
                        "Sueter de lana merino con cuello redondo. Abrigado y elegante.",
                        "L", 4500, 20,
                        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop"));

        productoRepository.saveAll(productos);
    }

    private Producto producto(String id, String nombre, String descripcion, String talle,
                              long precioCentavos, int stock, String imagen) {
        Producto producto = new Producto();
        producto.setId(id);
        producto.setNombre(nombre);
        producto.setDescripcion(descripcion);
        producto.setTalle(talle);
        producto.setPrecioCentavos(precioCentavos);
        producto.setStock(stock);
        producto.setImagenes(List.of(imagen));
        producto.setActivo(true);
        return producto;
    }

    private void seedPedidoEjemplo() {
        if (pedidoRepository.count() > 0) {
            return;
        }

        Producto primerProducto = productoRepository.findById("00000000-0000-0000-0000-000000000001").orElse(null);
        if (primerProducto == null) {
            return;
        }

        LocalDateTime ahora = LocalDateTime.now(ZoneOffset.UTC);

        Pedido pedido = new Pedido();
        pedido.setId("11111111-1111-1111-1111-111111111111");
        pedido.setEmailComprador("cliente@ejemplo.com");
        pedido.setTelefonoComprador("+598987654321");
        pedido.setEstado(EstadoPedido.PENDIENTE_PAGO);
        pedido.setTotalCentavos(5000L);
        pedido.setCodigo("PEDIDO-001");
        pedido.setVencidoEn(ahora.plusHours(48));

        PedidoItem item = new PedidoItem();
        item.setPedido(pedido);
        item.setProducto(primerProducto);
        item.setCantidad(2);
        item.setPrecioUnitarioCentavos(2500L);
        item.setSubtotalCentavos(5000L);
        pedido.getItems().add(item);

        pedido.getNotificaciones().add(notificacion(
                "22222222-2222-2222-2222-222222222201", CanalNotificacion.PANEL,
                "Nuevo pedido recibido: PEDIDO-001", false, ahora.minusHours(2), pedido));
        pedido.getNotificaciones().add(notificacion(
                "22222222-2222-2222-2222-222222222202", CanalNotificacion.PANEL,
                "Pago confirmado para pedido: PEDIDO-001", false, ahora.minusHours(2).minusMinutes(30), pedido));
        pedido.getNotificaciones().add(notificacion(
                "22222222-2222-2222-2222-222222222203", CanalNotificacion.EMAIL,
                "Pedido PEDIDO-001 esta por vencer", true, ahora.minusHours(1), pedido));

        pedidoRepository.save(pedido);

        Notificacion sinPedido = new Notificacion();
        sinPedido.setId("22222222-2222-2222-2222-222222222204");
        sinPedido.setCanal(CanalNotificacion.PANEL);
        sinPedido.setMensaje("Stock del producto Camiseta Basica bajo de 20 unidades");
        sinPedido.setLeida(true);
        sinPedido.setCreadoEn(ahora.minusHours(24));
        notificacionPersistida(sinPedido);
    }

    private Notificacion notificacion(String id, CanalNotificacion canal, String mensaje,
                                      boolean leida, LocalDateTime creadoEn, Pedido pedido) {
        Notificacion notificacion = new Notificacion();
        notificacion.setId(id);
        notificacion.setCanal(canal);
        notificacion.setMensaje(mensaje);
        notificacion.setLeida(leida);
        notificacion.setCreadoEn(creadoEn);
        notificacion.setPedido(pedido);
        return notificacion;
    }

    private void notificacionPersistida(Notificacion notificacion) {
        entityManager.persist(notificacion);
    }
}
