package com.sistemapedidos;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sistemapedidos.domain.entity.Administrador;
import com.sistemapedidos.domain.entity.ConfiguracionTienda;
import com.sistemapedidos.domain.entity.Producto;
import com.sistemapedidos.domain.repository.AdministradorRepository;
import com.sistemapedidos.domain.repository.ConfiguracionTiendaRepository;
import com.sistemapedidos.domain.repository.NotificacionRepository;
import com.sistemapedidos.domain.repository.PedidoRepository;
import com.sistemapedidos.domain.repository.ProductoRepository;
import com.sistemapedidos.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class BaseIntegrationTest {

    public static final String ADMIN_ID = "admin-test";
    public static final String ADMIN_EMAIL = "admin@tienda.com";
    public static final String ADMIN_PASSWORD = "password123";

    @Autowired
    protected MockMvc mockMvc;
    @Autowired
    protected ObjectMapper objectMapper;
    @Autowired
    protected JdbcTemplate jdbcTemplate;
    @Autowired
    protected JwtService jwtService;
    @Autowired
    protected PasswordEncoder passwordEncoder;
    @Autowired
    protected AdministradorRepository administradorRepository;
    @Autowired
    protected ProductoRepository productoRepository;
    @Autowired
    protected ConfiguracionTiendaRepository configuracionTiendaRepository;
    @Autowired
    protected PedidoRepository pedidoRepository;
    @Autowired
    protected NotificacionRepository notificacionRepository;

    @BeforeEach
    void limpiarBaseDeDatos() {
        jdbcTemplate.execute("DELETE FROM notificaciones");
        jdbcTemplate.execute("DELETE FROM pedido_items");
        jdbcTemplate.execute("DELETE FROM pedidos");
        jdbcTemplate.execute("DELETE FROM productos");
        jdbcTemplate.execute("DELETE FROM administradores");
        jdbcTemplate.execute("DELETE FROM configuraciones");
    }

    protected String tokenAdmin() {
        return jwtService.generarToken(ADMIN_ID, ADMIN_EMAIL, "admin");
    }

    protected String bearerAdmin() {
        return "Bearer " + tokenAdmin();
    }

    protected Administrador guardarAdmin(String email) {
        return guardarAdminConId(null, email);
    }

    protected Administrador guardarAdminConId(String id, String email) {
        Administrador admin = new Administrador();
        if (id != null) {
            admin.setId(id);
        }
        admin.setNombre("Admin " + email);
        admin.setEmail(email);
        admin.setClaveHash(passwordEncoder.encode(ADMIN_PASSWORD));
        return administradorRepository.save(admin);
    }

    protected Producto guardarProducto(String nombre, String talle, long precioCentavos, int stock) {
        return guardarProducto(nombre, talle, precioCentavos, stock, true);
    }

    protected Producto guardarProducto(String nombre, String talle, long precioCentavos, int stock, boolean activo) {
        Producto producto = new Producto();
        producto.setNombre(nombre);
        producto.setTalle(talle);
        producto.setPrecioCentavos(precioCentavos);
        producto.setStock(stock);
        producto.setImagenes(List.of("https://img.test/foto.png"));
        producto.setActivo(activo);
        return productoRepository.save(producto);
    }

    protected ConfiguracionTienda guardarConfiguracion() {
        ConfiguracionTienda config = new ConfiguracionTienda();
        config.setId("global");
        config.setNombreTienda("Tienda Test");
        config.setWhatsappContacto("+59899123456");
        config.setBanco("Banco Test");
        config.setCbu("0000003100000001234567");
        config.setAlias("tienda.test.pago");
        config.setTitular("Tienda Test SRL");
        config.setMensajeTransferencia("Enviar comprobante por WhatsApp.");
        return configuracionTiendaRepository.save(config);
    }
}
