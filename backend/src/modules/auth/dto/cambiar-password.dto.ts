import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CambiarPasswordDto {
  @ApiProperty({ description: 'Contrasena actual del administrador', example: 'MiPassword123!' })
  @IsString()
  @IsNotEmpty()
  readonly currentPassword: string;

  @ApiProperty({ description: 'Nueva contrasena (minimo 8 caracteres)', example: 'NuevaPassword456!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  readonly newPassword: string;

  constructor(currentPassword: string, newPassword: string) {
    this.currentPassword = currentPassword;
    this.newPassword = newPassword;
  }
}
