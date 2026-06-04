import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdministradorController } from '@modules/administrador/administrador.controller';
import { AuthService } from '@modules/auth/auth.service';
import { PrismaService } from '@common/config/database/prisma.service';

interface AdminJwtUser {
  id: string;
  email: string;
  rol: string;
}

describe('AdministradorController', () => {
  let controller: AdministradorController;
  let authService: AuthService;
  let prisma: PrismaService;

  const mockAuthService = {
    validarAdmin: jest.fn(),
    registrarAdmin: jest.fn(),
    resetPassword: jest.fn(),
  };

  const mockPrisma = {
    administrador: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdministradorController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    controller = module.get<AdministradorController>(AdministradorController);
    authService = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('debe delegar la autenticacion a AuthService.validarAdmin', async () => {
      const authResponse = { accessToken: 'tok-123', administrador: { id: 'a1', nombre: 'Admin', email: 'a@a.com' } };
      (mockAuthService.validarAdmin as jest.Mock).mockResolvedValue(authResponse);

      const result = await controller.login({ email: 'a@a.com', password: 'pwd123' });

      expect(mockAuthService.validarAdmin).toHaveBeenCalledWith('a@a.com', 'pwd123');
      expect(result).toEqual(authResponse);
    });
  });

  describe('listar', () => {
    it('debe devolver la lista de admins con campos publicos', async () => {
      const admins = [
        { id: 'a1', nombre: 'Admin 1', email: 'a1@a.com', ultimoAccesoEn: null },
        { id: 'a2', nombre: 'Admin 2', email: 'a2@a.com', ultimoAccesoEn: new Date() },
      ];
      (mockPrisma.administrador.findMany as jest.Mock).mockResolvedValue(admins);

      const result = await controller.listar();

      expect(mockPrisma.administrador.findMany).toHaveBeenCalledWith({
        select: { id: true, nombre: true, email: true, ultimoAccesoEn: true },
        orderBy: { creadoEn: 'asc' },
      });
      expect(result).toEqual(admins);
    });
  });

  describe('obtenerUno', () => {
    it('debe devolver un administrador por id', async () => {
      const admin = { id: 'a1', nombre: 'Admin', email: 'a@a.com', ultimoAccesoEn: null };
      (mockPrisma.administrador.findUnique as jest.Mock).mockResolvedValue(admin);

      const result = await controller.obtenerUno('a1');

      expect(result).toEqual(admin);
    });

    it('debe lanzar NotFoundException si el admin no existe', async () => {
      (mockPrisma.administrador.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(controller.obtenerUno('inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('crear', () => {
    it('debe delegar la creacion a AuthService.registrarAdmin', async () => {
      const dto = { nombre: 'Nuevo', email: 'nuevo@a.com', password: 'pwd12345' };
      const creado = { id: 'a-nuevo', nombre: 'Nuevo', email: 'nuevo@a.com' };
      (mockAuthService.registrarAdmin as jest.Mock).mockResolvedValue(creado);

      const result = await controller.crear(dto);

      expect(mockAuthService.registrarAdmin).toHaveBeenCalledWith('Nuevo', 'nuevo@a.com', 'pwd12345');
      expect(result).toEqual(creado);
    });
  });

  describe('actualizar', () => {
    it('debe actualizar solo el nombre', async () => {
      const existing = { id: 'a1', nombre: 'Viejo', email: 'a@a.com' };
      const updated = { id: 'a1', nombre: 'Nuevo', email: 'a@a.com', ultimoAccesoEn: null };
      (mockPrisma.administrador.findUnique as jest.Mock).mockResolvedValue(existing);
      (mockPrisma.administrador.update as jest.Mock).mockResolvedValue(updated);

      const result = await controller.actualizar('a1', { nombre: 'Nuevo' });

      expect(result).toEqual(updated);
      expect(mockPrisma.administrador.update).toHaveBeenCalledWith({
        where: { id: 'a1' },
        data: { nombre: 'Nuevo' },
        select: { id: true, nombre: true, email: true, ultimoAccesoEn: true },
      });
    });

    it('debe actualizar solo el email cuando es diferente', async () => {
      const existing = { id: 'a1', nombre: 'Admin', email: 'old@a.com' };
      (mockPrisma.administrador.findUnique as jest.Mock)
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(null);

      await controller.actualizar('a1', { email: 'new@a.com' });

      expect(mockPrisma.administrador.findUnique).toHaveBeenCalledTimes(2);
      expect(mockPrisma.administrador.update).toHaveBeenCalledWith({
        where: { id: 'a1' },
        data: { email: 'new@a.com' },
        select: { id: true, nombre: true, email: true, ultimoAccesoEn: true },
      });
    });

    it('debe lanzar BadRequestException si el email nuevo ya esta registrado', async () => {
      const existing = { id: 'a1', nombre: 'Admin', email: 'old@a.com' };
      const otro = { id: 'a2', nombre: 'Otro', email: 'new@a.com' };
      (mockPrisma.administrador.findUnique as jest.Mock)
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(otro);

      await expect(controller.actualizar('a1', { email: 'new@a.com' })).rejects.toThrow(BadRequestException);
      expect(mockPrisma.administrador.update).not.toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException si el admin no existe', async () => {
      (mockPrisma.administrador.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(controller.actualizar('inexistente', { nombre: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('eliminar', () => {
    it('debe eliminar un admin que no es el usuario actual', async () => {
      const existing = { id: 'a2', nombre: 'Otro', email: 'otro@a.com' };
      (mockPrisma.administrador.findUnique as jest.Mock).mockResolvedValue(existing);
      (mockPrisma.administrador.delete as jest.Mock).mockResolvedValue(existing);

      const req = { user: { id: 'a1', email: 'a1@a.com', rol: 'admin' } as AdminJwtUser };
      const result = await controller.eliminar('a2', req as any);

      expect(result).toEqual({ mensaje: 'Administrador eliminado exitosamente' });
      expect(mockPrisma.administrador.delete).toHaveBeenCalledWith({ where: { id: 'a2' } });
    });

    it('debe lanzar BadRequestException al intentar auto-eliminarse', async () => {
      const req = { user: { id: 'a1', email: 'a1@a.com', rol: 'admin' } as AdminJwtUser };

      await expect(controller.eliminar('a1', req as any)).rejects.toThrow(BadRequestException);
      expect(mockPrisma.administrador.delete).not.toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException si el admin a eliminar no existe', async () => {
      (mockPrisma.administrador.findUnique as jest.Mock).mockResolvedValue(null);
      const req = { user: { id: 'a1', email: 'a1@a.com', rol: 'admin' } as AdminJwtUser };

      await expect(controller.eliminar('inexistente', req as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('resetPassword', () => {
    it('debe delegar el reset a AuthService cuando el id es distinto al usuario', async () => {
      (mockAuthService.resetPassword as jest.Mock).mockResolvedValue({ mensaje: 'ok' });
      const req = { user: { id: 'a1', email: 'a1@a.com', rol: 'admin' } as AdminJwtUser };

      const result = await controller.resetPassword('a2', { nuevaPassword: 'pwd12345' }, req as any);

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith('a2', 'pwd12345');
      expect(result).toEqual({ mensaje: 'ok' });
    });

    it('debe lanzar BadRequestException al intentar resetear la propia contrasena', async () => {
      const req = { user: { id: 'a1', email: 'a1@a.com', rol: 'admin' } as AdminJwtUser };

      await expect(
        controller.resetPassword('a1', { nuevaPassword: 'pwd12345' }, req as any),
      ).rejects.toThrow(BadRequestException);
      expect(mockAuthService.resetPassword).not.toHaveBeenCalled();
    });
  });
});
