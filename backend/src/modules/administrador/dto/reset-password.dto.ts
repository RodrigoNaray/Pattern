import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Nueva contrasena para el administrador (minimo 8 caracteres)', example: 'NuevaPassword123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  readonly nuevaPassword: string;

  constructor(nuevaPassword: string) {
    this.nuevaPassword = nuevaPassword;
  }
}
