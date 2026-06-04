import { Test, TestingModule } from '@nestjs/testing';
import { PedidoService } from '@modules/pedido/pedido.service';
import { PrismaService } from '@common/config/database/prisma.service';
import { CreatePedidoDto } from '@modules/pedido/dto/create-pedido.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PedidoService', () => {
  let service: PedidoService;
  let prisma: any;

  const mockProducto: any = {
    id: 'prod-1',
    nombre: 'Camiseta básica',
    talle: 'M',
    precioCentavos: 15000,
    stock: 10,
    activo: true,
    creadoEn: new Date(),
    actualizadoEn: new Date(),
    imagenes: [],
  };

  const mockPedido: any = {
    id: 'pedido-1',
    codigo: 'PED-ABC123XY',
    emailComprador: 'comprador@email.com',
    telefonoComprador: '+59899123456',
    estado: 'PENDIENTE_PAGO',
    totalCentavos: 30000,
    creadoEn: new Date(),
    confirmadoEn: null,
    vencidoEn: new Date(Date.now() + 48 * 60 * 60 * 1000),
  };

  const mockPedidoWithItems: any = {
    ...mockPedido,
    items: [
      {
        id: 'item-1',
        pedidoId: 'pedido-1',
        productoId: 'prod-1',
        cantidad: 2,
        precioUnitarioCentavos: 15000,
        subtotalCentavos: 30000,
        producto: {
          nombre: 'Camiseta básica',
          talle: 'M',
        },
      },
    ],
  };

  const mockCreatePedidoDto: CreatePedidoDto = {
    emailComprador: 'comprador@email.com',
    telefonoComprador: '+59899123456',
    items: [
      {
        productoId: 'prod-1',
        cantidad: 2,
      },
    ],
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    prisma = {
      pedido: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      notificacion: {
        create: jest.fn(),
      },
      producto: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      configuracionTienda: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn((fn: (tx: any) => any) => fn(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PedidoService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<PedidoService>(PedidoService);
  });

  describe('crear', () => {
    it('debería crear un pedido exitosamente', async () => {
      prisma.producto.findUnique.mockResolvedValue(mockProducto);
      prisma.pedido.create.mockResolvedValue(mockPedidoWithItems as any);
      prisma.notificacion.create.mockResolvedValue({ id: 'notif-1' } as any);

      const result = await service.crear(mockCreatePedidoDto);

      expect(result.mensaje).toBe('Pedido creado exitosamente');
      expect(result.pedido).toBeDefined();
      expect(result.pedido.codigo).toBe('PED-ABC123XY');
      expect(result.pedido.totalCentavos).toBe(30000);
      expect(result.pedido.estado).toBe('PENDIENTE_PAGO');
      expect(result.pedido.items).toHaveLength(1);
      expect(result.pedido.items.at(0)?.cantidad).toBe(2);

      expect(prisma.pedido.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          emailComprador: 'comprador@email.com',
          estado: 'PENDIENTE_PAGO',
        }),
        include: expect.any(Object),
      });

      expect(prisma.notificacion.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          mensaje: expect.stringContaining('Nuevo pedido PED-'),
        }),
      });
    });

    it('debería crear un pedido con múltiples items', async () => {
      const producto2 = {
        ...mockProducto,
        id: 'prod-2',
        nombre: 'Pantalón recto',
        precioCentavos: 25000,
      };

      prisma.producto.findUnique
        .mockResolvedValueOnce(mockProducto)
        .mockResolvedValueOnce(producto2);

      const pedidoConDosItems = {
        ...mockPedidoWithItems,
        totalCentavos: 55000,
        items: [
          {
            id: 'item-1',
            pedidoId: 'pedido-1',
            productoId: 'prod-1',
            cantidad: 2,
            precioUnitarioCentavos: 15000,
            subtotalCentavos: 30000,
            producto: { nombre: 'Camiseta básica', talle: 'M' },
          },
          {
            id: 'item-2',
            pedidoId: 'pedido-1',
            productoId: 'prod-2',
            cantidad: 1,
            precioUnitarioCentavos: 25000,
            subtotalCentavos: 25000,
            producto: { nombre: 'Pantalón recto', talle: 'L' },
          },
        ],
      };

      prisma.pedido.create.mockResolvedValue(pedidoConDosItems as any);
      prisma.notificacion.create.mockResolvedValue({ id: 'notif-1' } as any);

      const dtoMulti: CreatePedidoDto = {
        emailComprador: 'otro@email.com',
        telefonoComprador: '+59899111111',
        items: [
          { productoId: 'prod-1', cantidad: 2 },
          { productoId: 'prod-2', cantidad: 1 },
        ],
      };

      const result = await service.crear(dtoMulti);

      expect(result.pedido.totalCentavos).toBe(55000);
      expect(result.pedido.items).toHaveLength(2);
    });

    it('debería lanzar excepción cuando el email es inválido', async () => {
      await expect(
        service.crear({ ...mockCreatePedidoDto, emailComprador: 'email-invalido' }),
      ).rejects.toThrow(BadRequestException);

      await expect(service.crear({ ...mockCreatePedidoDto, emailComprador: '' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debería lanzar excepción cuando el teléfono está vacío', async () => {
      await expect(service.crear({ ...mockCreatePedidoDto, telefonoComprador: '' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debería lanzar excepción cuando el carrito está vacío', async () => {
      await expect(service.crear({ ...mockCreatePedidoDto, items: [] })).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar NotFoundException cuando un producto no existe', async () => {
      prisma.producto.findUnique.mockResolvedValue(null);

      await expect(service.crear(mockCreatePedidoDto)).rejects.toThrow(NotFoundException);
      expect(prisma.producto.findUnique).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        select: expect.objectContaining({
          id: true,
          nombre: true,
          talle: true,
          precioCentavos: true,
          stock: true,
        }),
      });
    });

    it('debería lanzar BadRequestException cuando el stock es insuficiente', async () => {
      const productoStockBajo = {
        ...mockProducto,
        stock: 1,
      };

      prisma.producto.findUnique.mockResolvedValue(productoStockBajo);

      await expect(
        service.crear({ ...mockCreatePedidoDto, items: [{ productoId: 'prod-1', cantidad: 5 }] }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debería rechazar el segundo pedido cuando dos clientes compiten por el último par', async () => {
      // Simula race condition: stock=1, dos pedidos de cantidad=1.
      // El contador compartido simula la garantia de la transaccion: el
      // primer pedido decrementa el stock antes que el segundo lo lea.
      let stockActual = 1;
      prisma.producto.findUnique.mockImplementation(() =>
        Promise.resolve({ ...mockProducto, stock: stockActual }),
      );
      prisma.producto.update.mockImplementation((args: { data: { stock: { decrement: number } } }) => {
        stockActual -= args.data.stock.decrement;
        return Promise.resolve({ ...mockProducto, stock: stockActual });
      });
      prisma.pedido.create.mockResolvedValue(mockPedidoWithItems as any);
      prisma.notificacion.create.mockResolvedValue({ id: 'notif-1' } as any);

      const dtoCliente1: CreatePedidoDto = {
        ...mockCreatePedidoDto,
        emailComprador: 'cliente1@email.com',
        items: [{ productoId: 'prod-1', cantidad: 1 }],
      };
      const dtoCliente2: CreatePedidoDto = {
        ...mockCreatePedidoDto,
        emailComprador: 'cliente2@email.com',
        items: [{ productoId: 'prod-1', cantidad: 1 }],
      };

      const primer = await service.crear(dtoCliente1);
      const segundo = service.crear(dtoCliente2);

      await expect(segundo).rejects.toThrow(BadRequestException);
      expect(primer.mensaje).toBe('Pedido creado exitosamente');
    });
  });

  describe('obtenerUno', () => {
    it('debería retornar un pedido si existe', async () => {
      prisma.pedido.findUnique.mockResolvedValue(mockPedidoWithItems as any);

      const result = await service.obtenerUno('pedido-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('pedido-1');
      expect(result.codigo).toBe('PED-ABC123XY');
      expect(result.items).toHaveLength(1);
      expect(prisma.pedido.findUnique).toHaveBeenCalledWith({
        where: { id: 'pedido-1' },
        include: { items: { include: { producto: true } } },
      });
    });

    it('debería lanzar NotFoundException cuando el pedido no existe', async () => {
      prisma.pedido.findUnique.mockResolvedValue(null);

      await expect(service.obtenerUno('pedido-inexistente')).rejects.toThrow(NotFoundException);
    });
  });

  describe('buscarPorCodigoYEmail', () => {
    it('debe retornar el detalle del pedido cuando codigo y email coinciden', async () => {
      prisma.pedido.findFirst.mockResolvedValue(mockPedidoWithItems as any);

      const result = await service.buscarPorCodigoYEmail('PED-ABC123XY', 'comprador@email.com');

      expect(result).toBeDefined();
      expect(result.codigo).toBe('PED-ABC123XY');
      expect(result.emailComprador).toBe('comprador@email.com');
      expect(prisma.pedido.findFirst).toHaveBeenCalledWith({
        where: {
          codigo: 'PED-ABC123XY',
          emailComprador: 'comprador@email.com',
        },
        include: { items: { include: { producto: true } } },
      });
    });

    it('debe normalizar el email a minusculas y trimear ambos campos', async () => {
      prisma.pedido.findFirst.mockResolvedValue(mockPedidoWithItems as any);

      await service.buscarPorCodigoYEmail('  PED-ABC123XY  ', '  COMPRADOR@EMAIL.COM  ');

      expect(prisma.pedido.findFirst).toHaveBeenCalledWith({
        where: {
          codigo: 'PED-ABC123XY',
          emailComprador: 'comprador@email.com',
        },
        include: { items: { include: { producto: true } } },
      });
    });

    it('debe lanzar NotFoundException cuando no encuentra el pedido', async () => {
      prisma.pedido.findFirst.mockResolvedValue(null);

      await expect(service.buscarPorCodigoYEmail('NO-EXISTE', 'otro@email.com'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('listarTodosParaExport', () => {
    it('debe llamar a prisma.pedido.findMany sin filtros cuando no se pasan', async () => {
      prisma.pedido.findMany.mockResolvedValue([mockPedidoWithItems] as any);

      const result = await service.listarTodosParaExport();

      expect(result).toHaveLength(1);
      expect(prisma.pedido.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { creadoEn: 'desc' },
        include: {
          items: {
            include: {
              producto: { select: { nombre: true, talle: true } },
            },
          },
        },
      });
    });

    it('debe filtrar por estado y rango de fechas cuando se pasan', async () => {
      prisma.pedido.findMany.mockResolvedValue([] as any);

      await service.listarTodosParaExport({
        estado: 'PAGO_CONFIRMADO',
        desde: '2026-01-01T00:00:00.000Z',
        hasta: '2026-12-31T23:59:59.999Z',
      });

      expect(prisma.pedido.findMany).toHaveBeenCalledWith({
        where: {
          estado: 'PAGO_CONFIRMADO',
          creadoEn: {
            gte: new Date('2026-01-01T00:00:00.000Z'),
            lte: new Date('2026-12-31T23:59:59.999Z'),
          },
        },
        orderBy: { creadoEn: 'desc' },
        include: {
          items: {
            include: {
              producto: { select: { nombre: true, talle: true } },
            },
          },
        },
      });
    });

    it('debe incluir solo el limite superior (lte) cuando solo se pasa hasta', async () => {
      prisma.pedido.findMany.mockResolvedValue([] as any);

      await service.listarTodosParaExport({ hasta: '2026-06-30T00:00:00.000Z' });

      expect(prisma.pedido.findMany).toHaveBeenCalledWith({
        where: {
          creadoEn: { lte: new Date('2026-06-30T00:00:00.000Z') },
        },
        orderBy: { creadoEn: 'desc' },
        include: {
          items: {
            include: {
              producto: { select: { nombre: true, talle: true } },
            },
          },
        },
      });
    });
  });

  describe('listarPendientes', () => {
    it('debería retornar pedidos pendientes ordenados por fecha DESC', async () => {
      const mockPedidosPendientes = [
        {
          id: 'pedido-1',
          codigo: 'PED-AAA111',
          emailComprador: 'a@email.com',
          telefonoComprador: '+59899000000',
          estado: 'PENDIENTE_PAGO',
          totalCentavos: 15000,
          creadoEn: new Date('2026-01-10'),
          vencidoEn: new Date('2026-01-12'),
          _count: { items: 1 },
        },
        {
          id: 'pedido-2',
          codigo: 'PED-BBB222',
          emailComprador: 'b@email.com',
          telefonoComprador: '+59899111111',
          estado: 'PENDIENTE_PAGO',
          totalCentavos: 25000,
          creadoEn: new Date('2026-01-09'),
          vencidoEn: new Date('2026-01-11'),
          _count: { items: 2 },
        },
      ];

      prisma.pedido.findMany.mockResolvedValue(mockPedidosPendientes as any);

      const result = await service.listarPendientes();

      const pedidos = result.pedidos as any;
      expect(pedidos).toHaveLength(2);
      expect(pedidos[0].codigo).toBe('PED-AAA111');
      expect(pedidos[1].codigo).toBe('PED-BBB222');
      expect(pedidos[0].itemsCount).toBe(1);
      expect(pedidos[1].itemsCount).toBe(2);
      expect(pedidos[0].totalCentavos).toBe(15000);
      expect(prisma.pedido.findMany).toHaveBeenCalledWith({
        where: { estado: 'PENDIENTE_PAGO' },
        orderBy: { creadoEn: 'desc' },
        skip: 0,
        take: 20,
        include: {
          _count: {
            select: { items: true },
          },
        },
      });
    });

    it('debería retornar array vacío cuando no hay pedidos pendientes', async () => {
      prisma.pedido.findMany.mockResolvedValue([]);

      const result = await service.listarPendientes();

      expect(result.pedidos).toEqual([]);
    });
  });

  describe('confirmarPago', () => {
    it('debería confirmar el pago y descontar stock correctamente', async () => {
      const pedidoConfirmable: any = {
        ...mockPedido,
        estado: 'PENDIENTE_PAGO',
        items: [
          {
            id: 'item-1',
            pedidoId: 'pedido-1',
            productoId: 'prod-1',
            cantidad: 2,
            precioUnitarioCentavos: 15000,
            subtotalCentavos: 30000,
            producto: { nombre: 'Camiseta básica', talle: 'M' },
          },
        ],
      };

      const mockProductoTx = {
        id: 'prod-1',
        nombre: 'Camiseta básica',
        stock: 10,
      };

      const mockProductoUpdate = { nombre: 'Camiseta básica', stock: 8 };

      const mockTx = {
        pedido: {
          findUnique: jest.fn().mockResolvedValue(pedidoConfirmable),
          update: jest.fn().mockResolvedValue({ ...pedidoConfirmable, estado: 'PAGO_CONFIRMADO', confirmadoEn: new Date() }),
        },
        producto: {
          findUnique: jest.fn().mockResolvedValue(mockProductoTx),
          update: jest.fn().mockResolvedValue(mockProductoUpdate),
        },
        notificacion: {
          create: jest.fn().mockResolvedValue({ id: 'notif-2' }),
        },
      };

      prisma.pedido.findUnique.mockResolvedValue(pedidoConfirmable);
      prisma.producto.findUnique.mockResolvedValue(mockProductoTx);
      prisma.$transaction.mockImplementation(async (fn: any) => fn(mockTx));

      const result = await service.confirmarPago('pedido-1');

      expect(result.estado).toBe('PAGO_CONFIRMADO');
      expect(result.confirmadoEn).toBeDefined();
      expect(mockTx.producto.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { stock: { decrement: 2 } },
        select: { nombre: true, stock: true },
      });
      expect(mockTx.notificacion.create).toHaveBeenCalledTimes(2);
      expect(mockTx.notificacion.create).toHaveBeenNthCalledWith(1, {
        data: {
          canal: 'EMAIL',
          mensaje: 'Tu pedido PED-ABC123XY fue confirmado. Pago recibido exitosamente.',
          pedidoId: 'pedido-1',
        },
      });
      expect(mockTx.notificacion.create).toHaveBeenNthCalledWith(2, {
        data: {
          canal: 'PANEL',
          mensaje: 'Pago del pedido PED-ABC123XY confirmado por el administrador',
          pedidoId: 'pedido-1',
        },
      });
    });

    it('debería marcar producto inactivo cuando stock llega a cero', async () => {
      const pedidoConfirmable: any = {
        ...mockPedido,
        estado: 'PENDIENTE_PAGO',
        items: [
          {
            id: 'item-1',
            pedidoId: 'pedido-1',
            productoId: 'prod-1',
            cantidad: 10,
            precioUnitarioCentavos: 15000,
            subtotalCentavos: 150000,
            producto: { nombre: 'Camiseta básica', talle: 'M' },
          },
        ],
      };

      const mockProductoTx = {
        id: 'prod-1',
        nombre: 'Camiseta básica',
        stock: 10,
      };

      const mockTx = {
        pedido: {
          findUnique: jest.fn().mockResolvedValue(pedidoConfirmable),
          update: jest.fn().mockResolvedValue({ ...pedidoConfirmable, estado: 'PAGO_CONFIRMADO', confirmadoEn: new Date() }),
        },
        producto: {
          findUnique: jest.fn().mockResolvedValue(mockProductoTx),
          update: jest
            .fn()
            .mockResolvedValueOnce({ nombre: 'Camiseta básica', stock: 0 })
            .mockResolvedValueOnce({ nombre: 'Camiseta básica', activo: false }),
        },
        notificacion: {
          create: jest.fn().mockResolvedValue({ id: 'notif-2' }),
        },
      };

      prisma.pedido.findUnique.mockResolvedValue(pedidoConfirmable);
      prisma.producto.findUnique.mockResolvedValue(mockProductoTx);
      prisma.$transaction.mockImplementation(async (fn: any) => fn(mockTx));

      const result = await service.confirmarPago('pedido-1');

      expect(result.estado).toBe('PAGO_CONFIRMADO');
      expect(mockTx.producto.update).toHaveBeenCalledTimes(2);
      expect(mockTx.producto.update).toHaveBeenLastCalledWith({
        where: { id: 'prod-1' },
        data: { activo: false },
      });
    });

    it('debería lanzar excepción cuando el pedido ya está confirmado', async () => {
      const yaConfirmado = {
        ...mockPedido,
        estado: 'PAGO_CONFIRMADO',
        confirmadoEn: new Date(),
        items: [],
      };

      prisma.pedido.findUnique.mockResolvedValue(yaConfirmado as any);

      await expect(service.confirmarPago('pedido-1')).rejects.toThrow(BadRequestException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException cuando el pedido no existe', async () => {
      prisma.pedido.findUnique.mockResolvedValue(null);

      await expect(service.confirmarPago('pedido-inexistente')).rejects.toThrow(NotFoundException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException cuando un producto no existe', async () => {
      const pedidoConfirmable: any = {
        ...mockPedido,
        estado: 'PENDIENTE_PAGO',
        items: [
          {
            id: 'item-1',
            pedidoId: 'pedido-1',
            productoId: 'prod-inexistente',
            cantidad: 2,
            precioUnitarioCentavos: 15000,
            subtotalCentavos: 30000,
            producto: { nombre: 'Camiseta no existe', talle: 'M' },
          },
        ],
      };

      prisma.pedido.findUnique.mockResolvedValue(pedidoConfirmable);
      prisma.producto.findUnique.mockResolvedValue(null);

      await expect(service.confirmarPago('pedido-1')).rejects.toThrow(NotFoundException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException cuando el stock es insuficiente', async () => {
      const pedidoConfirmable: any = {
        ...mockPedido,
        estado: 'PENDIENTE_PAGO',
        items: [
          {
            id: 'item-1',
            pedidoId: 'pedido-1',
            productoId: 'prod-1',
            cantidad: 15,
            precioUnitarioCentavos: 15000,
            subtotalCentavos: 225000,
            producto: { nombre: 'Camiseta básica', talle: 'M' },
          },
        ],
      };

      const productoStockBajo = {
        ...mockProducto,
        stock: 5,
      };

      prisma.pedido.findUnique.mockResolvedValue(pedidoConfirmable);
      prisma.producto.findUnique.mockResolvedValue(productoStockBajo);

      await expect(service.confirmarPago('pedido-1')).rejects.toThrow(BadRequestException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('cancelar', () => {
    it('debería cancelar el pedido y restaurar stock exitosamente', async () => {
      const pedidoCancelable: any = {
        ...mockPedido,
        estado: 'PENDIENTE_PAGO',
        totalCentavos: 55000,
        items: [
          {
            id: 'item-1',
            pedidoId: 'pedido-1',
            productoId: 'prod-1',
            cantidad: 2,
            precioUnitarioCentavos: 15000,
            subtotalCentavos: 30000,
          },
          {
            id: 'item-2',
            pedidoId: 'pedido-1',
            productoId: 'prod-2',
            cantidad: 1,
            precioUnitarioCentavos: 25000,
            subtotalCentavos: 25000,
          },
        ],
      };

      const mockPedidoCancelado: any = {
        id: 'pedido-1',
        codigo: 'PED-ABC123XY',
        estado: 'CANCELADO',
        totalCentavos: 55000,
      };

      const mockTx = {
        pedido: {
          findUnique: jest.fn().mockResolvedValue(pedidoCancelable),
          update: jest.fn().mockResolvedValue(mockPedidoCancelado),
        },
        producto: {
          findUnique: jest.fn().mockResolvedValue({ id: 'prod-1', nombre: 'Camiseta básica', stock: 10 }),
          update: jest
            .fn()
            .mockResolvedValueOnce({ id: 'prod-1', nombre: 'Camiseta básica', stock: 12 })
            .mockResolvedValueOnce({ id: 'prod-2', nombre: 'Pantalón recto', stock: 6 }),
        },
        notificacion: {
          create: jest.fn().mockResolvedValue({ id: 'notif-3' }),
        },
      };

      prisma.pedido.findUnique.mockResolvedValue(pedidoCancelable);
      prisma.$transaction.mockImplementation(async (fn: any) => fn(mockTx));

      const result = await service.cancelar('pedido-1');

      expect(result.mensaje).toBe('Pedido cancelado exitosamente');
      expect(result.pedido.estado).toBe('CANCELADO');
      expect(result.pedido.codigo).toBe('PED-ABC123XY');
      expect(result.pedido.totalCentavos).toBe(55000);

      expect(mockTx.pedido.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'pedido-1' },
          data: { estado: 'CANCELADO' },
        }),
      );

      expect(mockTx.producto.update).toHaveBeenNthCalledWith(1, {
        where: { id: 'prod-1' },
        data: { stock: { increment: 2 } },
      });

      expect(mockTx.producto.update).toHaveBeenNthCalledWith(2, {
        where: { id: 'prod-2' },
        data: { stock: { increment: 1 } },
      });

      expect(mockTx.notificacion.create).toHaveBeenNthCalledWith(1, {
        data: {
          canal: 'EMAIL',
          mensaje: 'Tu pedido PED-ABC123XY fue cancelado.',
          pedidoId: 'pedido-1',
        },
      });

      expect(mockTx.notificacion.create).toHaveBeenNthCalledWith(2, {
        data: {
          canal: 'PANEL',
          mensaje: 'Pedido PED-ABC123XY cancelado por el administrador',
          pedidoId: 'pedido-1',
        },
      });
    });

    it('debería lanzar BadRequestException cuando el pedido ya está confirmado', async () => {
      const yaConfirmado = {
        ...mockPedido,
        estado: 'PAGO_CONFIRMADO',
        confirmadoEn: new Date(),
        items: [],
      };

      prisma.pedido.findUnique.mockResolvedValue(yaConfirmado as any);

      await expect(service.cancelar('pedido-1')).rejects.toThrow(BadRequestException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('debería lanzar BadRequestException cuando el pedido ya está cancelado', async () => {
      const yaCancelado = {
        ...mockPedido,
        estado: 'CANCELADO',
        items: [],
      };

      prisma.pedido.findUnique.mockResolvedValue(yaCancelado as any);

      await expect(service.cancelar('pedido-1')).rejects.toThrow(BadRequestException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException cuando el pedido no existe', async () => {
      prisma.pedido.findUnique.mockResolvedValue(null);

      await expect(service.cancelar('pedido-inexistente')).rejects.toThrow(NotFoundException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('generarCsv', () => {
    const pedidoBase = {
      codigo: 'PED-ABC123',
      emailComprador: 'cliente@ejemplo.com',
      telefonoComprador: '099123456',
      estado: 'PENDIENTE_PAGO',
      totalCentavos: 30000,
      creadoEn: new Date('2026-06-04T15:30:00.000Z'),
    };

    it('debe generar una fila por cada item con headers en la primera linea', () => {
      const pedidos = [
        {
          ...pedidoBase,
          items: [
            {
              cantidad: 2,
              precioUnitarioCentavos: 15000,
              subtotalCentavos: 30000,
              producto: { nombre: 'Remera basica', talle: 'M' },
            },
          ],
        },
      ];

      const csv = PedidoService.generarCsv(pedidos as any);
      const lineas = csv.replace(/^\uFEFF/, '').trim().split('\r\n');

      expect(lineas[0]).toBe(
        'codigo,fecha,email,telefono,estado,producto,talle,cantidad,precio_unitario_centavos,subtotal_centavos,total_pedido_centavos',
      );
      expect(lineas[1]).toBe(
        'PED-ABC123,2026-06-04T15:30:00.000Z,cliente@ejemplo.com,099123456,PENDIENTE_PAGO,Remera basica,M,2,15000,30000,30000',
      );
    });

    it('debe escapar comillas y comillas internas duplicadas (RFC 4180)', () => {
      const pedidos = [
        {
          ...pedidoBase,
          items: [
            {
              cantidad: 1,
              precioUnitarioCentavos: 1000,
              subtotalCentavos: 1000,
              producto: { nombre: 'Remera "edicion limitada", algodon', talle: 'L' },
            },
          ],
        },
      ];

      const csv = PedidoService.generarCsv(pedidos as any);
      const lineas = csv.replace(/^\uFEFF/, '').trim().split('\r\n');

      expect(lineas[1]).toContain('"Remera ""edicion limitada"", algodon"');
    });

    it('debe omitir pedidos sin items (no genera filas vacias)', () => {
      const pedidos = [
        {
          ...pedidoBase,
          codigo: 'PED-CON-ITEM',
          items: [
            {
              cantidad: 1,
              precioUnitarioCentavos: 5000,
              subtotalCentavos: 5000,
              producto: { nombre: 'Pantalon', talle: 'S' },
            },
          ],
        },
        {
          ...pedidoBase,
          codigo: 'PED-SIN-ITEM',
          items: [],
        },
      ];

      const csv = PedidoService.generarCsv(pedidos as any);
      const lineas = csv.replace(/^\uFEFF/, '').trim().split('\r\n');

      expect(lineas).toHaveLength(2);
      expect(lineas[1]).toContain('PED-CON-ITEM');
      expect(csv).not.toContain('PED-SIN-ITEM');
    });

    it('debe incluir BOM UTF-8 al inicio para compatibilidad con Excel', () => {
      const pedidos = [
        {
          ...pedidoBase,
          items: [
            {
              cantidad: 1,
              precioUnitarioCentavos: 1000,
              subtotalCentavos: 1000,
              producto: { nombre: 'Test', talle: 'M' },
            },
          ],
        },
      ];

      const csvConBOM = PedidoService.generarCsv(pedidos as any);
      const csvSinBOM = PedidoService.generarCsv(pedidos as any, { agregarBOM: false });

      expect(csvConBOM.charCodeAt(0)).toBe(0xfeff);
      expect(csvSinBOM.charCodeAt(0)).not.toBe(0xfeff);
    });
  });
});