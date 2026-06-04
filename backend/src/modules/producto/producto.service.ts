import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@common/config/database/prisma.service";
import { CreateProductoDto } from "./dto/create-producto.dto";
import { UpdateProductoDto } from "./dto/update-producto.dto";
import { PublicarProductoDto } from "./dto/publicar-producto.dto";
import { ActualizarProductoDto } from "./dto/actualizar-producto.dto";

@Injectable()
export class ProductoService {
  constructor(private readonly prisma: PrismaService) {}

  async publicar(dto: PublicarProductoDto, urlsImagenes: string[]) {
    if (urlsImagenes.length === 0) {
      throw new BadRequestException("Se requiere al menos una imagen");
    }

    const producto = await this.prisma.producto.create({
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion ?? null,
        talle: dto.talle,
        precioCentavos: BigInt(dto.precioCentavos),
        stock: dto.stock ?? 0,
        imagenes: urlsImagenes,
        activo: true,
      },
    });

    return this.construirRespuesta(producto);
  }

  async crear(data: CreateProductoDto) {
    const datosPrisma = this.mapearParaPrisma(data);
    const producto = await this.prisma.producto.create({ data: datosPrisma });
    return this.construirRespuesta(producto);
  }

  async listar(params?: {
    activo?: boolean | undefined;
    talle?: string | undefined;
    q?: string | undefined;
    pagina?: number | undefined;
    tamano?: number | undefined;
  }) {
    const { activo, talle, q, pagina = 1, tamano = 20 } = params ?? {};
    const where: Record<string, unknown> = {};
    if (activo !== undefined) where.activo = activo;
    if (talle) where.talle = talle;
    if (q && q.trim()) {
      where.nombre = { contains: q.trim(), mode: 'insensitive' };
    }

    const [total, productos] = await Promise.all([
      this.prisma.producto.count({ where }),
      this.prisma.producto.findMany({
        where,
        skip: (pagina - 1) * tamano,
        take: tamano,
        orderBy: { creadoEn: "desc" },
      }),
    ]);

    return {
      productos: productos.map(this.construirRespuesta),
      total,
      pagina,
      tamano,
    };
  }

  async obtenerUno(id: string) {
    const producto = await this.prisma.producto.findUnique({ where: { id } });
    if (!producto) throw new NotFoundException("Producto no encontrado");
    return this.construirRespuesta(producto);
  }

  async actualizar(id: string, data: UpdateProductoDto) {
    const existente = await this.prisma.producto.findUnique({ where: { id } });
    if (!existente) throw new NotFoundException("Producto no encontrado");
    const datosPrisma = this.mapearUpdateParaPrisma(data);
    const producto = await this.prisma.producto.update({
      where: { id },
      data: datosPrisma,
    });
    return this.construirRespuesta(producto);
  }

  async actualizarAdmin(
    id: string,
    dto: ActualizarProductoDto,
    urlsNuevasImagenes?: string[],
  ) {
    const existente = await this.prisma.producto.findUnique({ where: { id } });
    if (!existente) throw new NotFoundException("Producto no encontrado");

    const datos: Record<string, unknown> = {};
    if (dto.nombre !== undefined) datos.nombre = dto.nombre;
    if (dto.descripcion !== undefined)
      datos.descripcion = dto.descripcion ?? null;
    if (dto.talle !== undefined) datos.talle = dto.talle;
    if (dto.precioCentavos !== undefined)
      datos.precioCentavos = BigInt(dto.precioCentavos);
    if (dto.stock !== undefined) datos.stock = dto.stock;
    if (urlsNuevasImagenes !== undefined) datos.imagenes = urlsNuevasImagenes;

    const producto = await this.prisma.producto.update({
      where: { id },
      data: datos,
    });

    return this.construirRespuesta(producto);
  }

  async desactivar(id: string) {
    const producto = await this.prisma.producto.findUnique({ where: { id } });
    if (!producto) throw new NotFoundException("Producto no encontrado");
    if (producto.activo === false)
      throw new BadRequestException("Este producto ya está desactivado");

    const productoActualizado = await this.prisma.producto.update({
      where: { id },
      data: { activo: false },
    });

    return this.construirRespuesta(productoActualizado);
  }

  async eliminar(id: string) {
    const existente = await this.prisma.producto.findUnique({ where: { id } });
    if (!existente) throw new NotFoundException("Producto no encontrado");
    await this.prisma.producto.delete({ where: { id } });
    return { id, eliminado: true };
  }

  private mapearParaPrisma(data: CreateProductoDto) {
    return {
      nombre: data.nombre,
      talle: data.talle,
      precioCentavos: BigInt(data.precioCentavos),
      stock: data.stock,
      descripcion: data.descripcion ?? null,
      imagenes: data.imagenes ?? [],
      activo: data.activo ?? true,
    };
  }

  private mapearUpdateParaPrisma(data: UpdateProductoDto) {
    const datos: Record<string, unknown> = {};
    if (data.nombre !== undefined) datos.nombre = data.nombre;
    if (data.talle !== undefined) datos.talle = data.talle;
    if (data.precioCentavos !== undefined)
      datos.precioCentavos = BigInt(data.precioCentavos);
    if (data.stock !== undefined) datos.stock = data.stock;
    if (data.descripcion !== undefined)
      datos.descripcion = data.descripcion ?? null;
    if (data.imagenes !== undefined) datos.imagenes = data.imagenes;
    if (data.activo !== undefined) datos.activo = data.activo;
    return datos;
  }

  private construirRespuesta(p: {
    id: string;
    nombre: string;
    descripcion: string | null;
    talle: string;
    precioCentavos: bigint | number;
    stock: number;
    imagenes: string[];
    activo: boolean;
    creadoEn: Date;
    actualizadoEn: Date;
  }): {
    id: string;
    nombre: string;
    descripcion: string | null;
    talle: string;
    precioCentavos: number;
    stock: number;
    imagenes: string[];
    activo: boolean;
    creadoEn: Date;
    actualizadoEn: Date;
  } {
    const precioNum: number = typeof p.precioCentavos === 'bigint'
      ? Number(p.precioCentavos)
      : p.precioCentavos;

    return {
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      talle: p.talle,
      precioCentavos: precioNum,
      stock: p.stock,
      imagenes: p.imagenes,
      activo: p.activo,
      creadoEn: p.creadoEn,
      actualizadoEn: p.actualizadoEn,
    };
  }
}
