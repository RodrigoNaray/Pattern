import {
  Controller,
  Get,
  Put,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { ConfiguracionTiendaService } from './configuracion-tienda.service';
import { ConfigurarTiendaDto } from './dto/configurar-tienda.dto';

@ApiTags('admin/configuracion')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/configuracion')
export class ConfiguracionTiendaController {
  constructor(private readonly configuracionService: ConfiguracionTiendaService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener configuración de la tienda' })
  @ApiResponse({ status: 200, description: 'Configuración obtenida exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async obtener() {
    return this.configuracionService.obtener();
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar configuración de la tienda' })
  @ApiResponse({ status: 200, description: 'Configuración actualizada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async actualizar(@Body() dto: ConfigurarTiendaDto) {
    const configuracion = await this.configuracionService.actualizar(dto);
    return { mensaje: 'Configuración actualizada exitosamente', configuracion };
  }
}