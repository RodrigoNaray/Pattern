import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@common/config/database/prisma.service';
import bcrypt from 'bcrypt';

export interface AdminCreateResult {
  id: string;
  nombre: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  admin: AdminCreateResult;
}

export interface AdminBasic {
  id: string;
  email: string;
  claveHash: string;
  nombre: string;
}

const SALT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private async hashearPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async validarAdmin(email: string, password: string): Promise<AuthResponse> {
    if (!email || !password) {
      throw new UnauthorizedException('Complete todos los campos');
    }

    const admin = await this.prisma.administrador.findUnique({ where: { email } });
    if (!admin) {
      throw new UnauthorizedException('Email no registrado');
    }

    const passwordMatch = await bcrypt.compare(password, admin.claveHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Clave incorrecta');
    }

    await this.prisma.administrador.update({
      where: { id: admin.id },
      data: { ultimoAccesoEn: new Date() },
    });

    const payload = { sub: admin.id, email: admin.email, rol: 'admin' as const };

    return {
      accessToken: this.jwtService.sign(payload),
      admin: { id: admin.id, nombre: admin.nombre, email: admin.email },
    };
  }

  async registrarAdmin(nombre: string, email: string, password: string): Promise<AdminCreateResult> {
    const existingAdmin = await this.prisma.administrador.findUnique({ where: { email } });
    if (existingAdmin) {
      throw new Error('El email ya está registrado');
    }

    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    const hashedPassword = await this.hashearPassword(password);

    return this.prisma.administrador.create({
      data: { nombre, email, claveHash: hashedPassword },
    });
  }

  async cambiarPassword(
    adminId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ mensaje: string }> {
    if (!newPassword || newPassword.length < MIN_PASSWORD_LENGTH) {
      throw new UnauthorizedException('La nueva contraseña debe tener al menos 8 caracteres');
    }

    const admin = await this.prisma.administrador.findUnique({ where: { id: adminId } });
    if (!admin) {
      throw new UnauthorizedException('Administrador no encontrado');
    }

    const passwordMatch = await bcrypt.compare(currentPassword, admin.claveHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    const newHash = await this.hashearPassword(newPassword);
    await this.prisma.administrador.update({
      where: { id: adminId },
      data: { claveHash: newHash },
    });

    return { mensaje: 'Contraseña actualizada exitosamente' };
  }

  async resetPassword(
    adminId: string,
    nuevaPassword: string,
  ): Promise<{ mensaje: string }> {
    if (!nuevaPassword || nuevaPassword.length < MIN_PASSWORD_LENGTH) {
      throw new UnauthorizedException('La nueva contraseña debe tener al menos 8 caracteres');
    }

    const admin = await this.prisma.administrador.findUnique({ where: { id: adminId } });
    if (!admin) {
      throw new UnauthorizedException('Administrador no encontrado');
    }

    const newHash = await this.hashearPassword(nuevaPassword);
    await this.prisma.administrador.update({
      where: { id: adminId },
      data: { claveHash: newHash },
    });

    return { mensaje: 'Contrasena reseteada exitosamente' };
  }
}