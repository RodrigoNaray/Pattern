import { Test, TestingModule } from '@nestjs/testing';
import { ConfiguracionTiendaController } from '@modules/configuracion/configuracion-tienda.controller';
import { ConfiguracionTiendaService } from '@modules/configuracion/configuracion-tienda.service';
import { ConfigurarTiendaDto } from '@modules/configuracion/dto/configurar-tienda.dto';

describe('ConfiguracionTiendaController', () => {
  let controller: ConfiguracionTiendaController;
  let service: ConfiguracionTiendaService;

  const mockConfiguracionTiendaService = {
    obtener: jest.fn(),
    actualizar: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfiguracionTiendaController],
      providers: [
        {
          provide: ConfiguracionTiendaService,
          useValue: mockConfiguracionTiendaService,
        },
      ],
    }).compile();

    controller = module.get<ConfiguracionTiendaController>(ConfiguracionTiendaController);
    service = module.get<ConfiguracionTiendaService>(ConfiguracionTiendaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('obtener', () => {
    it('deberia retornar la configuracion de la tienda', async () => {
      const configRespuesta = {
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

      (service.obtener as jest.Mock).mockResolvedValue(configRespuesta);

      const resultado = await controller.obtener();

      expect(service.obtener).toHaveBeenCalled();
      expect(resultado).toEqual(configRespuesta);
    });
  });

  describe('actualizar', () => {
    it('deberia actualizar la configuracion y retornar mensaje de confirmacion', async () => {
      const dto: ConfigurarTiendaDto = {
        nombreTienda: 'Tienda Actualizada',
        whatsappContacto: '598999999999',
      };

      const configActualizada = {
        id: 'global',
        nombreTienda: 'Tienda Actualizada',
        whatsappContacto: '598999999999',
        banco: null,
        cbu: null,
        alias: null,
        titular: null,
        mensajeTransferencia: null,
        pedidoVencimientoHoras: 48,
        estadoProductoBorrador: true,
        actualizadoEn: new Date(),
      };

      (service.actualizar as jest.Mock).mockResolvedValue(configActualizada);

      const resultado = await controller.actualizar(dto);

      expect(service.actualizar).toHaveBeenCalledWith(dto);
      expect(resultado.mensaje).toBe('Configuración actualizada exitosamente');
      expect(resultado.configuracion.nombreTienda).toBe('Tienda Actualizada');
      expect(resultado.configuracion.whatsappContacto).toBe('598999999999');
    });

    it('deberia actualizar solo los campos proporcionados', async () => {
      const dto: ConfigurarTiendaDto = {
        banco: 'Nuevo Banco',
      };

      const configActualizada = {
        id: 'global',
        nombreTienda: 'Mi Tienda',
        whatsappContacto: '59899123456',
        banco: 'Nuevo Banco',
        cbu: null,
        alias: null,
        titular: null,
        mensajeTransferencia: null,
        pedidoVencimientoHoras: 48,
        estadoProductoBorrador: true,
        actualizadoEn: new Date(),
      };

      (service.actualizar as jest.Mock).mockResolvedValue(configActualizada);

      const resultado = await controller.actualizar(dto);

      expect(service.actualizar).toHaveBeenCalledWith(dto);
      expect(resultado.configuracion.banco).toBe('Nuevo Banco');
    });
  });
});