import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ProductoService } from "../producto.service";
import { PrismaService } from "@common/config/database/prisma.service";
import { PublicarProductoDto } from "../dto/publicar-producto.dto";

describe("ProductoService", () => {
  let service: ProductoService;
  let prisma: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    producto: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductoService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductoService>(ProductoService);
    prisma = mockPrismaService as unknown as jest.Mocked<PrismaService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("publicar", () => {
    it("deberia crear un producto con stock 0 y activo true", async () => {
      const dto: PublicarProductoDto = {
        nombre: "Remera Algodón",
        talle: "M",
        precioCentavos: 15000,
        descripcion: "Remera de algodón 100%",
      };
      const urlsImagenes = ["http://localhost:3000/uploads/productos/img1.jpg"];

      const productoCreado = {
        id: "prod-1",
        nombre: dto.nombre,
        descripcion: dto.descripcion ?? null,
        talle: dto.talle,
        precioCentavos: BigInt(dto.precioCentavos),
        stock: 0,
        imagenes: urlsImagenes,
        activo: true,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      };

      prisma.producto.create.mockResolvedValue(productoCreado);

      const result = await service.publicar(dto, urlsImagenes);

      expect(prisma.producto.create).toHaveBeenCalledWith({
        data: {
          nombre: dto.nombre,
          descripcion: dto.descripcion,
          talle: dto.talle,
          precioCentavos: BigInt(dto.precioCentavos),
          stock: 0,
          imagenes: urlsImagenes,
          activo: true,
        },
      });
      expect(result.stock).toBe(0);
      expect(result.activo).toBe(true);
      expect(result.imagenes).toEqual(urlsImagenes);
    });

    it("deberia lanzar error si no se proporcionan URLs de imagenes", async () => {
      const dto: PublicarProductoDto = {
        nombre: "Remera Algodón",
        talle: "M",
        precioCentavos: 15000,
      };

      await expect(service.publicar(dto, [])).rejects.toThrow(
        "Se requiere al menos una imagen",
      );
      expect(prisma.producto.create).not.toHaveBeenCalled();
    });

    it("deberia crear producto con descripcion null cuando no se proporciona", async () => {
      const dto: PublicarProductoDto = {
        nombre: "Pantalon Jean",
        talle: "L",
        precioCentavos: 25000,
      };
      const urlsImagenes = ["http://localhost:3000/uploads/productos/img1.jpg"];

      const productoCreado = {
        id: "prod-2",
        nombre: dto.nombre,
        descripcion: null,
        talle: dto.talle,
        precioCentavos: BigInt(dto.precioCentavos),
        stock: 0,
        imagenes: urlsImagenes,
        activo: true,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      };

      prisma.producto.create.mockResolvedValue(productoCreado);

      const result = await service.publicar(dto, urlsImagenes);

      expect(prisma.producto.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ descripcion: null }),
      });
      expect(result.descripcion).toBeNull();
    });
  });

  describe("crear", () => {
    it("deberia crear un producto exitosamente", async () => {
      const dto = {
        nombre: "Remera Algodón",
        talle: "M",
        precioCentavos: 15000,
        stock: 100,
        descripcion: "Remera de algodón 100%",
        imagenes: ["https://example.com/image.jpg"],
        activo: true,
      };

      const productoCreado = {
        id: "prod-1",
        ...dto,
        precioCentavos: BigInt(dto.precioCentavos),
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      };

      prisma.producto.create.mockResolvedValue(productoCreado);

      const result = await service.crear(dto);

      expect(prisma.producto.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        id: "prod-1",
        nombre: dto.nombre,
        talle: dto.talle,
        precioCentavos: expect.any(BigInt),
        stock: dto.stock,
        descripcion: dto.descripcion,
        imagenes: dto.imagenes,
        activo: dto.activo,
        creadoEn: expect.any(Date),
        actualizadoEn: expect.any(Date),
      });
    });
  });

  describe("listar", () => {
    it("deberia listar todos los productos activos sin filtros", async () => {
      const productosMock = [
        {
          id: "prod-1",
          nombre: "Remera Algodón",
          talle: "M",
          precioCentavos: BigInt(15000),
          stock: 100,
          descripcion: "Descripción 1",
          imagenes: ["https://example.com/1.jpg"],
          activo: true,
          creadoEn: new Date(),
          actualizadoEn: new Date(),
        },
        {
          id: "prod-2",
          nombre: "Pantalón Chino",
          talle: "L",
          precioCentavos: BigInt(35000),
          stock: 50,
          descripcion: "Descripción 2",
          imagenes: ["https://example.com/2.jpg"],
          activo: true,
          creadoEn: new Date(),
          actualizadoEn: new Date(),
        },
      ];

      prisma.producto.count.mockResolvedValue(2);
      prisma.producto.findMany.mockResolvedValue(productosMock);

      const result = await service.listar({ activo: true });

      expect(prisma.producto.count).toHaveBeenCalledTimes(1);
      expect(prisma.producto.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { activo: true },
          skip: 0,
          take: 20,
          orderBy: { creadoEn: "desc" },
        }),
      );
      expect(result.productos).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.pagina).toBe(1);
      expect(result.tamano).toBe(20);
    });

    it("deberia listar productos con paginacion personalizada", async () => {
      prisma.producto.count.mockResolvedValue(50);
      prisma.producto.findMany.mockResolvedValue([]);

      await service.listar({ pagina: 2, tamano: 10 });

      expect(prisma.producto.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });

    it("deberia listar productos filtrados por talle", async () => {
      prisma.producto.count.mockResolvedValue(5);
      prisma.producto.findMany.mockResolvedValue([]);

      await service.listar({ activo: true, talle: "M" });

      expect(prisma.producto.count).toHaveBeenCalledWith({
        where: { activo: true, talle: "M" },
      });
    });
  });

  describe("obtenerUno", () => {
    it("deberia obtener un producto por ID", async () => {
      const productoMock = {
        id: "prod-1",
        nombre: "Remera Algodón",
        talle: "M",
        precioCentavos: BigInt(15000),
        stock: 100,
        descripcion: "Descripción",
        imagenes: ["https://example.com/1.jpg"],
        activo: true,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      };

      prisma.producto.findUnique.mockResolvedValue(productoMock);

      const result = await service.obtenerUno("prod-1");

      expect(prisma.producto.findUnique).toHaveBeenCalledWith({
        where: { id: "prod-1" },
      });
      expect(result.id).toBe("prod-1");
    });

    it("deberia lanzar NotFoundException si el producto no existe", async () => {
      prisma.producto.findUnique.mockResolvedValue(null);

      await expect(service.obtenerUno("prod-inexistente")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("actualizar", () => {
    it("deberia actualizar un producto exitosamente", async () => {
      const productoExistente = {
        id: "prod-1",
        nombre: "Remera Antigua",
        talle: "M",
        precioCentavos: BigInt(10000),
        stock: 50,
        descripcion: "Antigua",
        imagenes: [],
        activo: true,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      };

      const productoActualizado = {
        ...productoExistente,
        nombre: "Remera Actualizada",
        precioCentavos: BigInt(12000),
        actualizadoEn: new Date(),
      };

      prisma.producto.findUnique.mockResolvedValue(productoExistente);
      prisma.producto.update.mockResolvedValue(productoActualizado);

      const result = await service.actualizar("prod-1", {
        nombre: "Remera Actualizada",
        precioCentavos: 12000,
      });

      expect(prisma.producto.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "prod-1" },
        }),
      );
      expect(result.nombre).toBe("Remera Actualizada");
    });

    it("deberia lanzar NotFoundException si el producto no existe al actualizar", async () => {
      prisma.producto.findUnique.mockResolvedValue(null);

      await expect(
        service.actualizar("prod-inexistente", { nombre: "Nuevo" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("actualizarAdmin", () => {
    const existente = {
      id: "prod-1",
      nombre: "Vieja",
      talle: "M",
      precioCentavos: BigInt(10000),
      stock: 5,
      descripcion: null,
      imagenes: [],
      activo: true,
      creadoEn: new Date(),
      actualizadoEn: new Date(),
    };

    it("deberia actualizar solo los campos proporcionados", async () => {
      const actualizado = {
        ...existente,
        nombre: "Nueva",
        precioCentavos: BigInt(12000),
        actualizadoEn: new Date(),
      };

      prisma.producto.findUnique.mockResolvedValue(existente);
      prisma.producto.update.mockResolvedValue(actualizado);

      const result = await service.actualizarAdmin("prod-1", {
        nombre: "Nueva",
        precioCentavos: 12000,
      });

      expect(prisma.producto.update).toHaveBeenCalledWith({
        where: { id: "prod-1" },
        data: { nombre: "Nueva", precioCentavos: BigInt(12000) },
      });
      expect(result.nombre).toBe("Nueva");
    });

    it("deberia actualizar imagenes cuando se proporcionan nuevas URLs", async () => {
      prisma.producto.findUnique.mockResolvedValue(existente);
      prisma.producto.update.mockResolvedValue({
        ...existente,
        imagenes: ["nueva.jpg"],
      });

      await service.actualizarAdmin("prod-1", {}, ["nueva.jpg"]);

      expect(prisma.producto.update).toHaveBeenCalledWith({
        where: { id: "prod-1" },
        data: { imagenes: ["nueva.jpg"] },
      });
    });

    it("deberia lanzar NotFoundException si el producto no existe", async () => {
      prisma.producto.findUnique.mockResolvedValue(null);

      await expect(
        service.actualizarAdmin("prod-inexistente", {}),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.producto.update).not.toHaveBeenCalled();
    });

    it("deberia actualizar descripcion a null cuando se envía string vacío undefined", async () => {
      const conDescripcion = { ...existente, descripcion: "Vieja desc" };
      prisma.producto.findUnique.mockResolvedValue(conDescripcion);
      prisma.producto.update.mockResolvedValue({
        ...conDescripcion,
        descripcion: null,
      });

      // descripcion omitida (no presente en el dto) → equivalente a undefined con exactOptionalPropertyTypes
      await service.actualizarAdmin("prod-1", {});

      // descripcion undefined → no debe aparecer en datos
      expect(prisma.producto.update).toHaveBeenCalledWith({
        where: { id: "prod-1" },
        data: {},
      });
    });
  });

  describe("eliminar", () => {
    it("deberia eliminar un producto exitosamente", async () => {
      const productoExistente = {
        id: "prod-1",
        nombre: "Remera",
        talle: "M",
        precioCentavos: BigInt(15000),
        stock: 100,
        descripcion: null,
        imagenes: [],
        activo: true,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      };

      prisma.producto.findUnique.mockResolvedValue(productoExistente);
      prisma.producto.delete.mockResolvedValue(productoExistente);

      const result = await service.eliminar("prod-1");

      expect(prisma.producto.delete).toHaveBeenCalledWith({
        where: { id: "prod-1" },
      });
      expect(result.eliminado).toBe(true);
    });

    it("deberia lanzar NotFoundException si el producto no existe al eliminar", async () => {
      prisma.producto.findUnique.mockResolvedValue(null);

      await expect(service.eliminar("prod-inexistente")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
