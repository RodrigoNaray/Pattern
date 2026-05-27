import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@common/config/database/prisma.service';
import { ListarNotificacionesDto } from './dto/listar-notificaciones.dto';

export interface NotificacionDetalle {
  notificacion: {
    id: string;
    canal: string;
    mensaje: string;
    leida: boolean;
    creadoEn: Date;
    pedidoId: string | null;
  };
  pedido:
    | {
        id: string;
        emailComprador: string;
        telefonoComprador: string;
        estado: string;
        totalCentavos: number;
        codigo: string;
        creadoEn: Date;
        confirmadoEn: Date | null;
        vencidoEn: Date;
      }
    | null;
}

@Injectable()
export class NotificacionService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(filtros: ListarNotificacionesDto): Promise<
    Array<{
      id: string;
      canal: string;
      mensaje: string;
      leida: boolean;
      creadoEn: Date;
      pedidoId: string | null;
    }>
  > {
    const where: { leida?: boolean } = {};
    if (filtros.filtro === 'unread') {
      where.leida = false;
    }

    return this.prisma.notificacion.findMany({
      where,
      orderBy: { creadoEn: 'desc' },
    });
  }

  async obtenerDetalle(id: string): Promise<NotificacionDetalle> {
    const notificacion = await this.prisma.notificacion.findUnique({
      where: { id },
      include: { pedido: true },
    });

    if (!notificacion) {
      throw new NotFoundException('Notificación no encontrada');
    }

    const pedidoTransformado = notificacion.pedido
      ? {
          id: notificacion.pedido.id,
          emailComprador: notificacion.pedido.emailComprador,
          telefonoComprador: notificacion.pedido.telefonoComprador,
          estado: notificacion.pedido.estado,
          totalCentavos: Number(notificacion.pedido.totalCentavos),
          codigo: notificacion.pedido.codigo,
          creadoEn: notificacion.pedido.creadoEn,
          confirmadoEn: notificacion.pedido.confirmadoEn,
          vencidoEn: notificacion.pedido.vencidoEn,
        }
      : null;

    return {
      notificacion,
      pedido: pedidoTransformado,
    };
  }

  async marcarComoLeida(id: string): Promise<{
    id: string;
    leida: boolean;
    creadoEn: Date;
  }> {
    const notificacion = await this.prisma.notificacion.findUnique({
      where: { id },
    });

    if (!notificacion) {
      throw new NotFoundException('Notificación no encontrada');
    }

    if (notificacion.leida) {
      return notificacion;
    }

    return this.prisma.notificacion.update({
      where: { id },
      data: { leida: true },
      select: { id: true, leida: true, creadoEn: true },
    });
  }
}