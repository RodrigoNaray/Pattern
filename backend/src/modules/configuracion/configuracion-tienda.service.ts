import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@common/config/database/prisma.service';
import { ConfigurarTiendaDto } from './dto/configurar-tienda.dto';

export interface ConfiguracionTiendaResponse {
  id: string;
  nombreTienda: string | null;
  whatsappContacto: string | null;
  banco: string | null;
  cbu: string | null;
  alias: string | null;
  titular: string | null;
  mensajeTransferencia: string | null;
  pedidoVencimientoHoras: number;
  estadoProductoBorrador: boolean;
  actualizadoEn: Date;
}

@Injectable()
export class ConfiguracionTiendaService {
  constructor(private readonly prisma: PrismaService) {}

  async obtener(): Promise<ConfiguracionTiendaResponse> {
    let configuracion = await this.prisma.configuracionTienda.findUnique({
      where: { id: 'global' },
    });

    if (!configuracion) {
      configuracion = await this.prisma.configuracionTienda.create({
        data: {
          id: 'global',
          nombreTienda: null,
          whatsappContacto: null,
          banco: null,
          cbu: null,
          alias: null,
          titular: null,
          mensajeTransferencia: null,
          pedidoVencimientoHoras: 48,
          estadoProductoBorrador: true,
        },
      });
    }

    return this.mapearRespuesta(configuracion);
  }

  async actualizar(dto: ConfigurarTiendaDto): Promise<ConfiguracionTiendaResponse> {
    const datosActualizacion: Record<string, unknown> = {};

    if (dto.nombreTienda !== undefined) datosActualizacion.nombreTienda = dto.nombreTienda;
    if (dto.whatsappContacto !== undefined) datosActualizacion.whatsappContacto = dto.whatsappContacto;
    if (dto.banco !== undefined) datosActualizacion.banco = dto.banco;
    if (dto.cbu !== undefined) datosActualizacion.cbu = dto.cbu;
    if (dto.alias !== undefined) datosActualizacion.alias = dto.alias;
    if (dto.titular !== undefined) datosActualizacion.titular = dto.titular;
    if (dto.mensajeTransferencia !== undefined) datosActualizacion.mensajeTransferencia = dto.mensajeTransferencia;
    if (dto.pedidoVencimientoHoras !== undefined) datosActualizacion.pedidoVencimientoHoras = dto.pedidoVencimientoHoras;
    if (dto.estadoProductoBorrador !== undefined) datosActualizacion.estadoProductoBorrador = dto.estadoProductoBorrador;

    const configuracion = await this.prisma.configuracionTienda.update({
      where: { id: 'global' },
      data: datosActualizacion,
    });

    return this.mapearRespuesta(configuracion);
  }

  private mapearRespuesta(
    config: {
      id: string;
      nombreTienda: string | null;
      whatsappContacto: string | null;
      banco: string | null;
      cbu: string | null;
      alias: string | null;
      titular: string | null;
      mensajeTransferencia: string | null;
      pedidoVencimientoHoras: number;
      estadoProductoBorrador: boolean;
      actualizadoEn: Date;
    },
  ): ConfiguracionTiendaResponse {
    return {
      id: config.id,
      nombreTienda: config.nombreTienda,
      whatsappContacto: config.whatsappContacto,
      banco: config.banco,
      cbu: config.cbu,
      alias: config.alias,
      titular: config.titular,
      mensajeTransferencia: config.mensajeTransferencia,
      pedidoVencimientoHoras: config.pedidoVencimientoHoras,
      estadoProductoBorrador: config.estadoProductoBorrador,
      actualizadoEn: config.actualizadoEn,
    };
  }
}