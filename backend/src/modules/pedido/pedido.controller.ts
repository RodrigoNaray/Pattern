import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { Res } from '@nestjs/common';
import { PedidoService, CreatePedidoResult } from './pedido.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { PedidoInstruccionesPagoDto } from './dto/pedido-instrucciones-pago.dto';
import { PedidoPendienteDto } from './dto/pedido-pendiente.dto';
import { CancelarPedidoResponse } from './dto/cancelar-pedido-response.dto';
import { ExportarPedidosQueryDto } from './dto/exportar-pedidos-query.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@ApiTags('pedidos')
@Controller('pedidos')
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('list-pendientes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar pedidos pendientes de pago (admin)' })
  @ApiResponse({ status: 200, description: 'Pedidos pendientes obtenidos' })
  async listarPendientes(
    @Query('pagina') pagina?: number,
    @Query('tamano') tamano?: number,
  ) {
    const filtros: { pagina?: number; tamano?: number } = {};
    if (pagina != null) filtros.pagina = pagina;
    if (tamano != null) filtros.tamano = tamano;
    return this.pedidoService.listarPendientes(filtros);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo pedido (público)' })
  @ApiResponse({ status: 201, description: 'Pedido creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Error de validación' })
  async crear(@Body() dto: CreatePedidoDto): Promise<{ mensaje: string; pedido: CreatePedidoResult }> {
    return this.pedidoService.crear(dto);
  }

  @Get('buscar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Buscar pedido por codigo y email (publico)' })
  @ApiResponse({ status: 200, description: 'Pedido encontrado' })
  @ApiResponse({ status: 404, description: 'No se encontro un pedido con esos datos' })
  async buscarPorCodigoYEmail(
    @Query('codigo') codigo: string,
    @Query('email') email: string,
  ) {
    return this.pedidoService.buscarPorCodigoYEmail(codigo, email);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('export')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exportar pedidos a CSV (admin)' })
  @ApiResponse({ status: 200, description: 'Archivo CSV con todos los pedidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async exportarCsv(
    @Query() query: ExportarPedidosQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    const pedidos = await this.pedidoService.listarTodosParaExport(query);
    const csv = PedidoService.generarCsv(pedidos, { agregarBOM: true });

    const fecha = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="pedidos-${fecha}.csv"`,
    );
    return csv;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un pedido por ID (público)' })
  @ApiResponse({ status: 200, description: 'Pedido encontrado' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  async obtenerUno(@Param('id') id: string) {
    return this.pedidoService.obtenerUno(id);
  }

  @Get(':id/instrucciones-pago')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener instrucciones de pago para un pedido' })
  @ApiResponse({ status: 200, description: 'Instrucciones de pago obtenidas' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  @ApiResponse({ status: 503, description: 'Datos de pago no disponibles' })
  async obtenerInstruccionesPago(@Param('id') pedidoId: string): Promise<PedidoInstruccionesPagoDto> {
    return this.pedidoService.obtenerInstruccionesPago(pedidoId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(':id/confirmar-pago')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirmar pago manualmente de un pedido (admin)' })
  @ApiResponse({ status: 200, description: 'Pago confirmado exitosamente' })
  @ApiResponse({ status: 400, description: 'Pedido ya confirmado o stock insuficiente' })
  @ApiResponse({ status: 404, description: 'Pedido o producto no encontrado' })
  async confirmarPago(@Param('id') id: string) {
    return this.pedidoService.confirmarPago(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put(':id/cancelar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar un pedido pendiente (admin)' })
  @ApiResponse({ status: 200, description: 'Pedido cancelado exitosamente' })
  @ApiResponse({ status: 400, description: 'No se puede cancelar un pedido confirmado o ya cancelado' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  async cancelar(@Param('id') id: string): Promise<CancelarPedidoResponse> {
    return this.pedidoService.cancelar(id);
  }
}