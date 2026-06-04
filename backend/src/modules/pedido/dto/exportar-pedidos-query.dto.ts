import { IsEnum, IsISO8601, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoPedido } from '@prisma/client';

export class ExportarPedidosQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrar por estado del pedido',
    enum: EstadoPedido,
  })
  @IsOptional()
  @IsEnum(EstadoPedido, {
    message: 'El estado debe ser PENDIENTE_PAGO, PAGO_CONFIRMADO o CANCELADO',
  })
  readonly estado?: EstadoPedido;

  @ApiPropertyOptional({
    description: 'Fecha desde (ISO 8601, inclusive)',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsISO8601()
  readonly desde?: string;

  @ApiPropertyOptional({
    description: 'Fecha hasta (ISO 8601, inclusive)',
    example: '2026-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsISO8601()
  readonly hasta?: string;
}
