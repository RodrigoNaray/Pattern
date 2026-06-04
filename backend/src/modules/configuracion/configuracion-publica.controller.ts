import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConfiguracionTiendaService } from './configuracion-tienda.service';

@ApiTags('configuracion-tienda')
@Controller('configuracion-tienda')
export class ConfiguracionPublicaController {
  constructor(private readonly configuracionService: ConfiguracionTiendaService) {}

  @Get('publica')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener datos publicos de la tienda' })
  @ApiResponse({ status: 200, description: 'Datos publicos de la tienda' })
  async obtenerPublica() {
    const config = await this.configuracionService.obtener();
    return {
      nombreTienda: config.nombreTienda,
      whatsappContacto: config.whatsappContacto,
    };
  }
}
