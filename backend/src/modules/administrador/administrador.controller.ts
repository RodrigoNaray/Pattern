import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  NotFoundException,
  BadRequestException,
  Req,
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { AuthService, AuthResponse } from "../auth/auth.service";
import { PrismaService } from "@common/config/database/prisma.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RegistrarAdminDto } from "../auth/dto/registrar-admin.dto";
import type { Request } from "express";
import type { AdminJwtUser } from "../auth/strategies/jwt.strategy";

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
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Listar todos los administradores" })
  @ApiResponse({ status: 200, description: "Lista de administradores" })
  async listar() {
    return this.prisma.administrador.findMany({
      select: { id: true, nombre: true, email: true, ultimoAccesoEn: true },
      orderBy: { creadoEn: "asc" },
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Obtener datos del administrador" })
  @ApiResponse({ status: 200, description: "Administrador encontrado" })
  @ApiResponse({ status: 404, description: "Administrador no encontrado" })
  async obtenerUno(@Param("id") id: string) {
    const admin = await this.prisma.administrador.findUnique({
      where: { id },
      select: { id: true, nombre: true, email: true, ultimoAccesoEn: true },
    });
    if (!admin) {
      throw new NotFoundException("Administrador no encontrado");
    }
    return admin;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Crear un nuevo administrador" })
  @ApiResponse({ status: 201, description: "Administrador creado" })
  @ApiResponse({ status: 400, description: "El email ya está registrado" })
  async crear(@Body() dto: RegistrarAdminDto) {
    return this.authService.registrarAdmin(dto.nombre, dto.email, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Actualizar nombre/email de un administrador" })
  @ApiResponse({ status: 200, description: "Administrador actualizado" })
  @ApiResponse({ status: 400, description: "Email ya en uso" })
  @ApiResponse({ status: 404, description: "Administrador no encontrado" })
  async actualizar(
    @Param("id") id: string,
    @Body() body: { nombre?: string; email?: string },
  ) {
    const admin = await this.prisma.administrador.findUnique({ where: { id } });
    if (!admin) {
      throw new NotFoundException("Administrador no encontrado");
    }

    if (body.email && body.email !== admin.email) {
      const existente = await this.prisma.administrador.findUnique({ where: { email: body.email } });
      if (existente) {
        throw new BadRequestException("El email ya está registrado");
      }
    }

    const data: Record<string, string> = {};
    if (body.nombre !== undefined) data.nombre = body.nombre;
    if (body.email !== undefined) data.email = body.email;

    return this.prisma.administrador.update({
      where: { id },
      data,
      select: { id: true, nombre: true, email: true, ultimoAccesoEn: true },
    });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Eliminar un administrador" })
  @ApiResponse({ status: 200, description: "Administrador eliminado" })
  @ApiResponse({ status: 400, description: "No puedes eliminarte a ti mismo" })
  @ApiResponse({ status: 404, description: "Administrador no encontrado" })
  async eliminar(@Param("id") id: string, @Req() req: Request) {
    const usuario = req.user as AdminJwtUser;
    if (usuario.id === id) {
      throw new BadRequestException("No puedes eliminarte a ti mismo");
    }

    const admin = await this.prisma.administrador.findUnique({ where: { id } });
    if (!admin) {
      throw new NotFoundException("Administrador no encontrado");
    }

    await this.prisma.administrador.delete({ where: { id } });
    return { mensaje: "Administrador eliminado exitosamente" };
  }
}
