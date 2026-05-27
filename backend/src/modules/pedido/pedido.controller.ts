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
import { PedidoService, CreatePedidoResult } from './pedido.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { PedidoInstruccionesPagoDto } from './dto/pedido-instrucciones-pago.dto';
import { PedidoPendienteDto } from './dto/pedido-pendiente.dto';
import { CancelarPedidoResponse } from './dto/cancelar-pedido-response.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@ApiTags('pedidos')
@Controller('pedidos')
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo pedido (público)' })
  @ApiResponse({ status: 201, description: 'Pedido creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Error de validación' })
  async crear(@Body() dto: CreatePedidoDto): Promise<{ mensaje: string; pedido: CreatePedidoResult }> {
    return this.pedidoService.crear(dto);
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