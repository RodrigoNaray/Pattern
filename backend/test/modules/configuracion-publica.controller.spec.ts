import { Test, TestingModule } from '@nestjs/testing';
import { ConfiguracionPublicaController } from '@modules/configuracion/configuracion-publica.controller';
import { ConfiguracionTiendaService } from '@modules/configuracion/configuracion-tienda.service';

describe('ConfiguracionPublicaController', () => {
  let controller: ConfiguracionPublicaController;
  let service: ConfiguracionTiendaService;

  const mockService = {
    obtener: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfiguracionPublicaController],
      providers: [
        {
          provide: ConfiguracionTiendaService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ConfiguracionPublicaController>(ConfiguracionPublicaController);
    service = module.get<ConfiguracionTiendaService>(ConfiguracionTiendaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe devolver solo los campos publicos (nombreTienda y whatsappContacto)', async () => {
    (service.obtener as jest.Mock).mockResolvedValue({
      id: 'global',
      nombreTienda: 'Tienda Publica',
      whatsappContacto: '59899123456',
      banco: 'Banco Secreto',
      cbu: '0000123456789012345678',
      alias: 'secreto.alias',
      titular: 'Tienda SA',
      mensajeTransferencia: 'Mensaje interno',
      pedidoVencimientoHoras: 48,
      estadoProductoBorrador: true,
      actualizadoEn: new Date(),
    });

    const resultado = await controller.obtenerPublica();

    expect(resultado).toEqual({
      nombreTienda: 'Tienda Publica',
      whatsappContacto: '59899123456',
    });
    expect(resultado).not.toHaveProperty('banco');
    expect(resultado).not.toHaveProperty('cbu');
    expect(resultado).not.toHaveProperty('alias');
    expect(resultado).not.toHaveProperty('titular');
  });

  it('debe devolver whatsappContacto null si no fue configurado', async () => {
    (service.obtener as jest.Mock).mockResolvedValue({
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
    });

    const resultado = await controller.obtenerPublica();

    expect(resultado).toEqual({
      nombreTienda: null,
      whatsappContacto: null,
    });
  });
});
