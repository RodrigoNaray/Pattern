import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '@modules/auth/auth.service';
import { PrismaService } from '@common/config/database/prisma.service';
import bcrypt from 'bcrypt';

jest.mock('bcrypt', () => {
  const mock = { compare: jest.fn(), hash: jest.fn() };
  return { __esModule: true, default: mock, ...mock };
});

const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let prismaMock: Partial<PrismaService>;
  let jwtMock: Partial<JwtService>;

  beforeEach(() => {
    jest.clearAllMocks();

    prismaMock = {
      administrador: {
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        findFirst: jest.fn(),
        findFirstOrThrow: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        aggregate: jest.fn(),
        groupBy: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        upsert: jest.fn(),
        deleteMany: jest.fn(),
      },
    } as any;

    jwtMock = {
      sign: jest.fn(() => 'mocked-token'),
    };

    service = new AuthService(
      prismaMock as unknown as PrismaService,
      jwtMock as JwtService,
      new ConfigService(),
    );
  });

  describe('validarAdmin', () => {
    it('debe lanzar error cuando email y password vacíos', async () => {
      await expect(service.validarAdmin('', '')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.validarAdmin('', '')).rejects.toThrow(
        'Complete todos los campos',
      );
    });

    it('debe lanzar error cuando solo email vacío', async () => {
      await expect(service.validarAdmin('', 'password123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('debe lanzar error cuando solo password vacío', async () => {
      await expect(service.validarAdmin('test@test.com', '')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('debe lanzar error cuando email no registrado', async () => {
      (prismaMock.administrador!.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.validarAdmin('test@test.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.validarAdmin('test@test.com', 'password123'),
      ).rejects.toThrow('Email no registrado');
    });

    it('debe lanzar error cuando password incorrecto', async () => {
      (bcryptMock.compare as jest.Mock).mockResolvedValue(false);

      (prismaMock.administrador!.findUnique as jest.Mock).mockResolvedValue({
        id: 'admin-1',
        email: 'test@test.com',
        claveHash: 'hashed-wrong',
        nombre: 'Admin',
      });

      await expect(
        service.validarAdmin('test@test.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.validarAdmin('test@test.com', 'wrong-password'),
      ).rejects.toThrow('Clave incorrecta');
    });

    it('debe devolver token y datos del admin cuando es exitoso', async () => {
      const adminData = {
        id: 'admin-1',
        email: 'test@test.com',
        claveHash: 'hashed-correct',
        nombre: 'Admin Test',
      };
      (prismaMock.administrador!.findUnique as jest.Mock).mockResolvedValue(
        adminData,
      );
      (bcryptMock.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validarAdmin('test@test.com', 'correct-pass');

      expect(result).toHaveProperty('accessToken', 'mocked-token');
      expect(result.admin).toEqual({
        id: adminData.id,
        nombre: adminData.nombre,
        email: adminData.email,
      });
      expect((prismaMock.administrador!.update as jest.Mock).mock.calls[0][0]).toEqual({
        where: { id: adminData.id },
        data: { ultimoAccesoEn: expect.any(Date) },
      });
    });
  });

  describe('registrarAdmin', () => {
    it('debe lanzar error cuando email ya registrado', async () => {
      (prismaMock.administrador!.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing',
        email: 'test@test.com',
      });

      await expect(
        service.registrarAdmin('Test', 'test@test.com', 'password123'),
      ).rejects.toThrow('El email ya está registrado');
    });

    it('debe lanzar error cuando password tiene menos de 8 caracteres', async () => {
      await expect(
        service.registrarAdmin('Test', 'new@test.com', 'short'),
      ).rejects.toThrow('La contraseña debe tener al menos 8 caracteres');
    });

    it('debe crear un admin exitosamente cuando el email no existe', async () => {
      (prismaMock.administrador!.findUnique as jest.Mock).mockResolvedValue(
        null,
      );
      (prismaMock.administrador!.create as jest.Mock).mockResolvedValue({
        id: 'new-admin',
        nombre: 'Nuevo Admin',
        email: 'new@test.com',
      });

      const result = await service.registrarAdmin(
        'Nuevo Admin',
        'new@test.com',
        'password123',
      );

      expect(result).toEqual({
        id: 'new-admin',
        nombre: 'Nuevo Admin',
        email: 'new@test.com',
      });
      expect((prismaMock.administrador!.create as jest.Mock).mock.calls[0][0]).toEqual(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'new@test.com',
          }),
        }),
      );
    });
  });

  describe('cambiarPassword', () => {
    it('debe lanzar error cuando la nueva contraseña tiene menos de 8 caracteres', async () => {
      await expect(
        service.cambiarPassword('admin-1', 'current123', 'short'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.cambiarPassword('admin-1', 'current123', 'short'),
      ).rejects.toThrow('La nueva contraseña debe tener al menos 8 caracteres');
    });

    it('debe lanzar error cuando el administrador no existe', async () => {
      (prismaMock.administrador!.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.cambiarPassword('inexistente', 'current123', 'newPassword123'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.cambiarPassword('inexistente', 'current123', 'newPassword123'),
      ).rejects.toThrow('Administrador no encontrado');
    });

    it('debe lanzar error cuando la contraseña actual es incorrecta', async () => {
      (prismaMock.administrador!.findUnique as jest.Mock).mockResolvedValue({
        id: 'admin-1',
        email: 'test@test.com',
        claveHash: 'hashed-correct',
        nombre: 'Test',
      });
      (bcryptMock.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.cambiarPassword('admin-1', 'wrong-current', 'newPassword123'),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.cambiarPassword('admin-1', 'wrong-current', 'newPassword123'),
      ).rejects.toThrow('La contraseña actual es incorrecta');
    });

    it('debe actualizar la contraseña cuando la actual es correcta', async () => {
      (prismaMock.administrador!.findUnique as jest.Mock).mockResolvedValue({
        id: 'admin-1',
        email: 'test@test.com',
        claveHash: 'hashed-current',
        nombre: 'Test',
      });
      (bcryptMock.compare as jest.Mock).mockResolvedValue(true);
      (bcryptMock.hash as jest.Mock).mockResolvedValue('hashed-new');
      (prismaMock.administrador!.update as jest.Mock).mockResolvedValue({});

      const result = await service.cambiarPassword('admin-1', 'current123', 'newPassword123');

      expect(result).toEqual({ mensaje: 'Contraseña actualizada exitosamente' });
      expect(bcryptMock.compare).toHaveBeenCalledWith('current123', 'hashed-current');
      expect(bcryptMock.hash).toHaveBeenCalledWith('newPassword123', 12);
      expect(prismaMock.administrador!.update).toHaveBeenCalledWith({
        where: { id: 'admin-1' },
        data: { claveHash: 'hashed-new' },
      });
    });
  });
});