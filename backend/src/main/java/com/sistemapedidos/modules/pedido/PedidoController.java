package com.sistemapedidos.modules.pedido;

import com.sistemapedidos.domain.entity.Pedido;
import com.sistemapedidos.modules.pedido.dto.CreatePedidoDto;
import com.sistemapedidos.modules.pedido.dto.ExportarPedidosQueryDto;
import com.sistemapedidos.modules.pedido.dto.PedidoDetalle;
import com.sistemapedidos.modules.pedido.dto.PedidoInstruccionesPagoDto;
import com.sistemapedidos.modules.pedido.dto.PedidoOperacionesDto;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    @GetMapping("/list-pendientes")
    public PedidoOperacionesDto.PaginadoPedidosPendientes listarPendientes(
            @RequestParam(defaultValue = "1") int pagina,
            @RequestParam(defaultValue = "20") int tamano) {
        return pedidoService.listarPendientes(pagina, tamano);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PedidoOperacionesDto.CreatePedidoResponse crear(@Valid @RequestBody CreatePedidoDto dto) {
        return pedidoService.crear(dto);
    }

    @GetMapping("/buscar")
    public PedidoDetalle buscarPorCodigoYEmail(@RequestParam String codigo, @RequestParam String email) {
        return pedidoService.buscarPorCodigoYEmail(codigo, email);
    }

    @GetMapping("/export")
    public void exportarCsv(ExportarPedidosQueryDto query, HttpServletResponse response) throws IOException {
        List<Pedido> pedidos = pedidoService.listarTodosParaExport(query);
        String csv = PedidoService.generarCsv(pedidos);

        response.setContentType("text/csv; charset=utf-8");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename=\"pedidos-" + LocalDate.now() + ".csv\"");
        response.getWriter().write(csv);
    }

    @GetMapping("/{id}")
    public PedidoDetalle obtenerUno(@PathVariable String id) {
        return pedidoService.obtenerUno(id);
    }

    @GetMapping("/{id}/instrucciones-pago")
    public PedidoInstruccionesPagoDto obtenerInstruccionesPago(@PathVariable String id) {
        return pedidoService.obtenerInstruccionesPago(id);
    }

    @PutMapping("/{id}/confirmar-pago")
    public PedidoOperacionesDto.ConfirmarPagoResult confirmarPago(@PathVariable String id) {
        return pedidoService.confirmarPago(id);
    }

    @PutMapping("/{id}/cancelar")
    public PedidoOperacionesDto.CancelarPedidoResponse cancelar(@PathVariable String id) {
        return pedidoService.cancelar(id);
    }
}
