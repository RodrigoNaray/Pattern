import {
  Controller,
  Post,
  Body,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { ProductoService } from './producto.service';
import { ImagenService } from './imagen.service';
import { PublicarProductoDto } from './dto/publicar-producto.dto';

@ApiTags('admin/productos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/productos')
export class AdminProductoController {
  constructor(
    private readonly productoService: ProductoService,
    private readonly imagenService: ImagenService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FilesInterceptor('imagenes', 10, {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Publicar un nuevo producto (admin)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['nombre', 'talle', 'precioCentavos', 'imagenes'],
      properties: {
        nombre: { type: 'string', minLength: 3, example: 'Remera Algodón' },
        descripcion: { type: 'string', example: 'Remera de algodón 100%' },
        talle: { type: 'string', example: 'M' },
        precioCentavos: { type: 'number', example: 15000 },
        imagenes: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Producto publicado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o sin imágenes' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async publicar(
    @Body() dto: PublicarProductoDto,
    @UploadedFiles() archivos: Express.Multer.File[],
  ) {
    const archivosValidos = archivos ?? [];

    if (archivosValidos.length === 0) {
      throw new BadRequestException('Seleccione al menos una imagen valida');
    }

    const urlsImagenes = await this.imagenService.guardar(archivosValidos);
    const producto = await this.productoService.publicar(dto, urlsImagenes);

    return {
      mensaje: 'Producto publicado exitosamente',
      producto,
    };
  }
}
