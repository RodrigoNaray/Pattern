import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AdminProductoController } from "@modules/producto/admin-producto.controller";
import { ProductoService } from "@modules/producto/producto.service";
import { ImagenService } from "@modules/producto/imagen.service";
import { CreateProductoDto } from "@modules/producto/dto/create-producto.dto";

function makeProducto(overrides: Record<string, unknown> = {}) {
  return {
    id: "prod-1",
    nombre: "Remera Algodón",
    descripcion: null,
    talle: "M",
    precioCentavos: 15000,
    stock: 100,
    imagenes: [] as string[],
    activo: true,
    creadoEn: new Date(),
    actualizadoEn: new Date(),
    ...overrides,
  };
}

describe("AdminProductoController", () => {
  let controller: AdminProductoController;
  let service: jest.Mocked<
    Pick<
      ProductoService,
      "crear" | "listar" | "obtenerUno" | "actualizarAdmin" | "eliminar"
    >
  >;

  const mockService = {
    crear: jest.fn(),
    listar: jest.fn(),
    obtenerUno: jest.fn(),
    actualizarAdmin: jest.fn(),
    eliminar: jest.fn(),
  };

  const mockImagenService = {
    guardar: jest.fn(),
    eliminar: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminProductoController],
      providers: [
        {
          provide: ProductoService,
          useValue: mockService,
        },
        {
          provide: ImagenService,
          useValue: mockImagenService,
        },
      ],
    }).compile();

    controller = module.get<AdminProductoController>(AdminProductoController);
    service = mockService as jest.Mocked<
      Pick<
        ProductoService,
        "crear" | "listar" | "obtenerUno" | "actualizarAdmin" | "eliminar"
      >
    >;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("crearDraft", () => {
    it("deberia delegar la creacion al servicio", async () => {
      const dto: CreateProductoDto = {
        nombre: "Remera Algodón",
        talle: "M",
        precioCentavos: 15000,
        stock: 100,
      };

      const productoCreado = makeProducto({ precioCentavos: 15000 });

      service.crear.mockResolvedValue(productoCreado);

      const result = await controller.crearDraft(dto);

      expect(service.crear).toHaveBeenCalledWith(dto);
      expect(result.producto).toBe(productoCreado);
    });
  });

  describe("listar", () => {
    it("deberia delegar la listadon al servicio", async () => {
      const productosMock = [makeProducto({ imagenes: ["https://example.com/1.jpg"] })];

      service.listar.mockResolvedValue({
        productos: productosMock,
        total: 1,
        pagina: 1,
        tamano: 20,
      });

      const result = await controller.listar();

      expect(service.listar).toHaveBeenCalledWith();
      expect(result.productos).toHaveLength(1);
    });
  });

  describe("obtenerUno", () => {
    it("deberia delegar la obtencion al servicio", async () => {
      const productoMock = makeProducto({ imagenes: ["https://example.com/1.jpg"] });

      service.obtenerUno.mockResolvedValue(productoMock);

      const result = await controller.obtenerUno("prod-1");

      expect(service.obtenerUno).toHaveBeenCalledWith("prod-1");
      expect(result.id).toBe("prod-1");
    });

    it("deberia propagar el NotFoundException del servicio", async () => {
      service.obtenerUno.mockRejectedValue(
        new NotFoundException("Producto no encontrado"),
      );

      await expect(controller.obtenerUno("prod-inexistente")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("actualizar", () => {
    it("deberia delegar la actualizacion al servicio", async () => {
      const updateDto = { nombre: "Remera Actualizada" };
      const productoActualizado = makeProducto({ nombre: "Remera Actualizada", imagenes: ["https://example.com/1.jpg"] });

      mockService.obtenerUno.mockResolvedValue(productoActualizado);
      service.actualizarAdmin.mockResolvedValue(productoActualizado);

      const result = await controller.actualizar("prod-1", updateDto, [] as any);

      expect(service.actualizarAdmin).toHaveBeenCalledWith("prod-1", updateDto, undefined);
      expect(result.producto.nombre).toBe("Remera Actualizada");
    });
  });

  describe("eliminar", () => {
    it("deberia delegar la eliminacion al servicio", async () => {
      const resultado = { id: "prod-1", eliminado: true };

      service.eliminar.mockResolvedValue(resultado);

      const result = await controller.eliminar("prod-1");

      expect(service.eliminar).toHaveBeenCalledWith("prod-1");
      expect(result.mensaje).toBe("Producto eliminado exitosamente");
    });
  });
});
