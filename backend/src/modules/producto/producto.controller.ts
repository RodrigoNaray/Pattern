import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProductoService } from './producto.service';

@ApiTags('productos')
@Controller('productos')
export class ProductoController {
  constructor(private readonly productoService: ProductoService) {}

  @Get()
  @ApiOperation({ summary: 'Listar productos del catálogo público' })
  async listar(
    @Query('activo') activo?: boolean,
    @Query('talle') talle?: string,
    @Query('pagina') pagina?: number,
    @Query('tamano') tamano?: number,
  ) {
    const filtros: { activo?: boolean; talle?: string; pagina?: number; tamano?: number } = {};
    if (activo !== undefined) filtros.activo = activo;
    if (talle !== undefined) filtros.talle = talle;
    if (pagina !== undefined) filtros.pagina = pagina;
    if (tamano !== undefined) filtros.tamano = tamano;
    return this.productoService.listar(filtros);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  async obtenerUno(@Param('id') id: string) {
    return this.productoService.obtenerUno(id);
  }
}
