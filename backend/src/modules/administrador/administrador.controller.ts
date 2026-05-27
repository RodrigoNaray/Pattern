import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  UseGuards,
  NotFoundException,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { AuthService, AuthResponse, AdminCreateResult } from "../auth/auth.service";
import { PrismaService } from "@common/config/database/prisma.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("administradores")
@Controller("administradores")
export class AdministradorController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Iniciar sesión como administrador" })
  @ApiResponse({ status: 200, description: "Login exitoso" })
  @ApiResponse({ status: 401, description: "Credenciales inválidas" })
  async login(@Body() body: { email: string; password: string }): Promise<AuthResponse> {
    return this.authService.validarAdmin(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Obtener datos del administrador" })
  @ApiResponse({ status: 200, description: "Administrador encontrado" })
  @ApiResponse({ status: 404, description: "Administrador no encontrado" })
  async obtenerUno(@Param("id") id: string) {
    const admin = await this.prisma.administrador.findUnique({ where: { id }, select: { id: true, nombre: true, email: true } });
    if (!admin) {
      throw new NotFoundException("Administrador no encontrado");
    }
    return admin;
  }
}