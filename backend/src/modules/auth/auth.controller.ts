import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginAdminDto } from './dto/login-admin.dto';
import { RegistrarAdminDto } from './dto/registrar-admin.dto';
import { CambiarPasswordDto } from './dto/cambiar-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AdminJwtUser } from './strategies/jwt.strategy';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Formulario de inicio de sesión como administrador' })
  @ApiResponse({ status: 200, description: 'Formulario de login renderizado' })
  getAdminLogin() {
    return { message: 'admin/login' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión como administrador' })
  @ApiBody({
    type: LoginAdminDto,
    description: 'Credenciales de inicio de sesión',
  })
  @ApiResponse({ status: 200, description: 'Sesión iniciada correctamente' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() dto: LoginAdminDto) {
    return this.authService.validarAdmin(dto.email, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('registrar-admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nuevo administrador' })
  @ApiResponse({ status: 201, description: 'Administrador registrado' })
  async registrarAdmin(@Body() dto: RegistrarAdminDto) {
    return this.authService.registrarAdmin(dto.nombre, dto.email, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('cambiar-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cambiar contrasena del administrador autenticado' })
  @ApiBody({ type: CambiarPasswordDto })
  @ApiResponse({ status: 200, description: 'Contrasena actualizada' })
  @ApiResponse({ status: 401, description: 'Contrasena actual incorrecta o nueva invalida' })
  async cambiarPassword(@Req() req: Request, @Body() dto: CambiarPasswordDto) {
    const usuario = req.user as AdminJwtUser;
    return this.authService.cambiarPassword(usuario.id, dto.currentPassword, dto.newPassword);
  }
}