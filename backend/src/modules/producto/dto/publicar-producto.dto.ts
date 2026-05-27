import { IsString, IsNumber, IsOptional, Min, MinLength, MaxLength, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TALLES_VALIDOS, TalleValido } from '../talles.constant';

export class PublicarProductoDto {
  @ApiProperty({ description: 'Nombre del producto (mínimo 3 caracteres)', example: 'Remera Algodón' })
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(255)
  readonly nombre: string;

  @ApiPropertyOptional({ description: 'Descripción del producto', example: 'Remera de algodón 100%' })
  @IsOptional()
  @IsString()
  readonly descripcion?: string | undefined;

  @ApiProperty({
    description: 'Talle del producto',
    example: 'M',
    enum: TALLES_VALIDOS,
  })
  @IsIn(TALLES_VALIDOS, { message: 'Seleccione un talle valido' })
  readonly talle: TalleValido;

  @ApiProperty({ description: 'Precio en centavos (mayor a cero)', example: 15000 })
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'El precio debe ser mayor a cero' })
  readonly precioCentavos: number;

  @ApiPropertyOptional({ description: 'Stock inicial', example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly stock?: number;

  constructor(
    nombre: string,
    talle: TalleValido,
    precioCentavos: number,
    descripcion?: string | undefined,
  ) {
    this.nombre = nombre;
    this.talle = talle;
    this.precioCentavos = precioCentavos;
    this.descripcion = descripcion;
  }
}
