import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  MinLength,
  MaxLength,
  IsIn,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TALLES_VALIDOS, TalleValido } from '../talles.constant';

export class ActualizarProductoDto {
  @ApiPropertyOptional({ description: 'Nombre del producto (mínimo 3 caracteres)', example: 'Remera Algodón' })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(255)
  readonly nombre?: string;

  @ApiPropertyOptional({ description: 'Descripción del producto', example: 'Remera de algodón 100%' })
  @IsOptional()
  @IsString()
  readonly descripcion?: string;

  @ApiPropertyOptional({ description: 'Talle del producto', example: 'M', enum: TALLES_VALIDOS })
  @IsOptional()
  @IsIn(TALLES_VALIDOS, { message: 'Seleccione un talle valido' })
  readonly talle?: TalleValido;

  @ApiPropertyOptional({ description: 'Precio en centavos (mayor a cero)', example: 15000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'El precio debe ser mayor a cero' })
  readonly precioCentavos?: number;

  @ApiPropertyOptional({ description: 'Stock disponible', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  readonly stock?: number;
}
