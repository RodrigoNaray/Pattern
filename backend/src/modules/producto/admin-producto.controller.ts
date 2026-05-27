import {
  Controller,
  Post,
  Get,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";
import { memoryStorage } from "multer";
import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";
import { ProductoService } from "./producto.service";
import { ImagenService } from "./imagen.service";
import { PublicarProductoDto } from "./dto/publicar-producto.dto";
import { ActualizarProductoDto } from "./dto/actualizar-producto.dto";
import { CreateProductoDto } from "./dto/create-producto.dto";
import { UpdateProductoDto } from "./dto/update-producto.dto";

@ApiTags("admin/productos")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("admin/productos")
export class AdminProductoController {
  constructor(
    private readonly productoService: ProductoService,
    private readonly imagenService: ImagenService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FilesInterceptor("imagenes", 10, {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Publicar un nuevo producto (admin)" })
  @ApiBody({
    schema: {
      type: "object",
      required: ["nombre", "talle", "precioCentavos", "imagenes"],
      properties: {
        nombre: { type: "string", minLength: 3, example: "Remera Algodón" },
        descripcion: { type: "string", example: "Remera de algodón 100%" },
        talle: { type: "string", example: "M" },
        precioCentavos: { type: "number", example: 15000 },
        imagenes: {
          type: "array",
          items: { type: "string", format: "binary" },
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: "Producto publicado exitosamente" })
  @ApiResponse({ status: 400, description: "Datos inválidos o sin imágenes" })
  @ApiResponse({ status: 401, description: "No autenticado" })
  async publicar(
    @Body() dto: PublicarProductoDto,
    @UploadedFiles() archivos: Express.Multer.File[],
  ) {
    const archivosValidos = archivos ?? [];

    if (archivosValidos.length === 0) {
      throw new BadRequestException("Seleccione al menos una imagen valida");
    }

    const urlsImagenes = await this.imagenService.guardar(archivosValidos);
    const producto = await this.productoService.publicar(dto, urlsImagenes);

    return {
      mensaje: "Producto publicado exitosamente",
      producto,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Listar todos los productos (admin)" })
  @ApiResponse({ status: 200, description: "Lista de productos" })
  @ApiResponse({ status: 401, description: "No autenticado" })
  async listar() {
    return this.productoService.listar();
  }

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Obtener un producto por ID (admin)" })
  @ApiResponse({ status: 200, description: "Producto encontrado" })
  @ApiResponse({ status: 401, description: "No autenticado" })
  @ApiResponse({ status: 404, description: "Producto no encontrado" })
  async obtenerUno(@Param("id") id: string) {
    return this.productoService.obtenerUno(id);
  }

  @Post("draft")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Crear producto en borrador (admin)" })
  @ApiResponse({ status: 201, description: "Producto borrador creado" })
  @ApiResponse({ status: 401, description: "No autenticado" })
  async crearDraft(@Body() dto: CreateProductoDto) {
    const producto = await this.productoService.crear(dto);
    return { mensaje: "Producto borrador creado exitosamente", producto };
  }

  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FilesInterceptor("imagenes", 10, {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Actualizar un producto existente (admin)" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        nombre: { type: "string", minLength: 3, example: "Remera Algodón" },
        descripcion: { type: "string", example: "Remera de algodón 100%" },
        talle: { type: "string", example: "M" },
        precioCentavos: { type: "number", example: 15000 },
        stock: { type: "number", example: 10 },
        imagenes: {
          type: "array",
          items: { type: "string", format: "binary" },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Producto actualizado exitosamente",
  })
  @ApiResponse({
    status: 400,
    description: "Datos inválidos o imagen inválida",
  })
  @ApiResponse({ status: 401, description: "No autenticado" })
  @ApiResponse({ status: 404, description: "Producto no encontrado" })
  async actualizar(
    @Param("id") id: string,
    @Body() dto: ActualizarProductoDto,
    @UploadedFiles() archivos: Express.Multer.File[],
  ) {
    const archivosValidos = archivos ?? [];

    let urlsNuevasImagenes: string[] | undefined;
    let urlsImagenesAntiguas: string[] | undefined;

    if (archivosValidos.length > 0) {
      // Optimizamos para no llamar a obtenerUno() que construye una respuesta completa,
      // sino solo necesitamos las URLs de las imágenes actuales.
      const productoActual = await this.productoService.obtenerUno(id);
      urlsImagenesAntiguas = productoActual.imagenes;
      urlsNuevasImagenes = await this.imagenService.guardar(archivosValidos);
    }

    const producto = await this.productoService.actualizarAdmin(
      id,
      dto,
      urlsNuevasImagenes,
    );

    if (urlsImagenesAntiguas && urlsImagenesAntiguas.length > 0) {
      await this.imagenService.eliminar(urlsImagenesAntiguas);
    }

    return {
      mensaje: "Producto actualizado exitosamente",
      producto,
    };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Eliminar un producto (admin)" })
  @ApiResponse({ status: 200, description: "Producto eliminado" })
  @ApiResponse({ status: 401, description: "No autenticado" })
  @ApiResponse({ status: 404, description: "Producto no encontrado" })
  async eliminar(@Param("id") id: string) {
    await this.productoService.eliminar(id);
    return { mensaje: "Producto eliminado exitosamente" };
  }

  @Put(":id/desactivar")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Desactivar un producto (admin)" })
  @ApiResponse({
    status: 200,
    description: "Producto desactivado exitosamente",
  })
  @ApiResponse({ status: 400, description: "El producto ya está desactivado" })
  @ApiResponse({ status: 401, description: "No autenticado" })
  @ApiResponse({ status: 404, description: "Producto no encontrado" })
  async desactivar(@Param("id") id: string) {
    const producto = await this.productoService.desactivar(id);
    return {
      mensaje: "Producto desactivado exitosamente",
      producto,
    };
  }
}
