import { IsOptional, IsString, IsNumber, IsBoolean, Min } from 'class-validator';

export class ConfigurarTiendaDto {
  @IsOptional()
  @IsString()
  nombreTienda?: string;

  @IsOptional()
  @IsString()
  whatsappContacto?: string;

  @IsOptional()
  @IsString()
  banco?: string;

  @IsOptional()
  @IsString()
  cbu?: string;

  @IsOptional()
  @IsString()
  alias?: string;

  @IsOptional()
  @IsString()
  titular?: string;

  @IsOptional()
  @IsString()
  mensajeTransferencia?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  pedidoVencimientoHoras?: number;

  @IsOptional()
  @IsBoolean()
  estadoProductoBorrador?: boolean;
}