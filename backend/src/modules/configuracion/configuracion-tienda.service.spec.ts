import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ConfiguracionTiendaService } from './configuracion-tienda.service';
import { PrismaService } from '@common/config/database/prisma.service';
import { ConfigurarTiendaDto } from './dto/configurar-tienda.dto';

describe('ConfiguracionTiendaService', () => {
  let service: ConfiguracionTiendaService;
  let prisma: PrismaService;

  const mockPrismaService = {
    configuracionTienda: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfiguracionTiendaService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ConfiguracionTiendaService>(ConfiguracionTiendaService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('obtener', () => {
    it('deberia retornar la configuracion existente', async () => {
      const configExistente = {
        id: 'global',
        nombreTienda: 'Mi Tienda',
        whatsappContacto: '59899123456',
        banco: 'Banco de la Nacion',
        cbu: '0000123456789012345678',
        alias: 'mi.tienda.alias',
        titular: 'Mi Tienda SA',
        mensajeTransferencia: 'Transferir a esta cuenta',
        pedidoVencimientoHoras: 48,
        estadoProductoBorrador: true,
        actualizadoEn: new Date(),
      };

      (prisma.configuracionTienda.findUnique as jest.Mock).mockResolvedValue(configExistente);

      const resultado = await service.obtener();

      expect(prisma.configuracionTienda.findUnique).toHaveBeenCalledWith({
        where: { id: 'global' },
      });
      expect(resultado).toEqual(expect.objectContaining({
        id: 'global',
        nombreTienda: 'Mi Tienda',
        whatsappContacto: '59899123456',
      }));
    });

    it('deberia crear una instancia si no existe', async () => {
      (prisma.configuracionTienda.findUnique as jest.Mock).mockResolvedValue(null);

      const configCreada = {
        id: 'global',
        nombreTienda: null,
        whatsappContacto: null,
        banco: null,
        cbu: null,
        alias: null,
        titular: null,
        mensajeTransferencia: null,
        pedidoVencimientoHoras: 48,
        estadoProductoBorrador: true,
        actualizadoEn: new Date(),
      };

      (prisma.configuracionTienda.create as jest.Mock).mockResolvedValue(configCreada);

      const resultado = await service.obtener();

      expect(prisma.configuracionTienda.create).toHaveBeenCalledWith({
        data: {
          id: 'global',
          nombreTienda: null,
          whatsappContacto: null,
          banco: null,
          cbu: null,
          alias: null,
          titular: null,
          mensajeTransferencia: null,
          pedidoVencimientoHoras: 48,
          estadoProductoBorrador: true,
        },
      });
      expect(resultado.id).toBe('global');
    });
  });

  describe('actualizar', () => {
    it('deberia actualizar solo los campos enviados', async () => {
      const dto: ConfigurarTiendaDto = {
        nombreTienda: 'Nueva Tienda',
        whatsappContacto: '598998888777',
      };

      const configActualizada = {
        id: 'global',
        nombreTienda: 'Nueva Tienda',
        whatsappContacto: '598998888777',
        banco: null,
        cbu: null,
        alias: null,
        titular: null,
        mensajeTransferencia: null,
        pedidoVencimientoHoras: 48,
        estadoProductoBorrador: true,
        actualizadoEn: new Date(),
      };

      (prisma.configuracionTienda.update as jest.Mock).mockResolvedValue(configActualizada);

      const resultado = await service.actualizar(dto);

      expect(prisma.configuracionTienda.update).toHaveBeenCalledWith({
        where: { id: 'global' },
        data: {
          nombreTienda: 'Nueva Tienda',
          whatsappContacto: '598998888777',
        },
      });
      expect(resultado.nombreTienda).toBe('Nueva Tienda');
      expect(resultado.whatsappContacto).toBe('598998888777');
    });

    it('deberia actualizar todos los campos', async () => {
      const dto: ConfigurarTiendaDto = {
        nombreTienda: 'Tienda Completa',
        whatsappContacto: '598111222333',
        banco: 'Banco ABC',
        cbu: '1111222233334444',
        alias: 'tienda.abc',
        titular: 'Tienda ABC SRL',
        mensajeTransferencia: 'Pago por transferencia',
        pedidoVencimientoHoras: 72,
        estadoProductoBorrador: false,
      };

      const configActualizada = {
        id: 'global',
        nombreTienda: 'Tienda Completa',
        whatsappContacto: '598111222333',
        banco: 'Banco ABC',
        cbu: '1111222233334444',
        alias: 'tienda.abc',
        titular: 'Tienda ABC SRL',
        mensajeTransferencia: 'Pago por transferencia',
        pedidoVencimientoHoras: 72,
        estadoProductoBorrador: false,
        actualizadoEn: new Date(),
      };

      (prisma.configuracionTienda.update as jest.Mock).mockResolvedValue(configActualizada);

      const resultado = await service.actualizar(dto);

      expect(prisma.configuracionTienda.update).toHaveBeenCalledWith({
        where: { id: 'global' },
        data: dto,
      });
      expect(resultado.pedidoVencimientoHoras).toBe(72);
      expect(resultado.estadoProductoBorrador).toBe(false);
    });
  });
});