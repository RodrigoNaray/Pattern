import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AdminProductoController } from "../admin-producto.controller";
import { ProductoService } from "../producto.service";
import { ImagenService } from "../imagen.service";
import { PublicarProductoDto } from "../dto/publicar-producto.dto";
import { ActualizarProductoDto } from "../dto/actualizar-producto.dto";
import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";

const mockProductoService = {
  publicar: jest.fn(),
  listar: jest.fn(),
  obtenerUno: jest.fn(),
  actualizarAdmin: jest.fn(),
};

const mockImagenService = {
  guardar: jest.fn(),
  eliminar: jest.fn(),
};

const mockJwtAuthGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

describe("AdminProductoController", () => {
  let controller: AdminProductoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminProductoController],
      providers: [
        { provide: ProductoService, useValue: mockProductoService },
        { provide: ImagenService, useValue: mockImagenService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<AdminProductoController>(AdminProductoController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("publicar", () => {
    const dto: PublicarProductoDto = {
      nombre: "Remera Algodón",
      talle: "M",
      precioCentavos: 15000,
      descripcion: "Remera de algodón 100%",
    };

    const archivos: Express.Multer.File[] = [
      {
        fieldname: "imagenes",
        originalname: "foto.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        size: 100000,
        buffer: Buffer.from("fake-image-data"),
        stream: null as never,
        destination: "",
        filename: "",
        path: "",
      },
    ];

    const productoPublicado = {
      id: "prod-1",
      nombre: "Remera Algodón",
      descripcion: "Remera de algodón 100%",
      talle: "M",
      precioCentavos: BigInt(15000),
      stock: 0,
      imagenes: ["http://localhost:3000/uploads/productos/uuid.jpg"],
      activo: true,
      creadoEn: new Date(),
      actualizadoEn: new Date(),
    };

    it("deberia publicar un producto exitosamente y retornar 201 con mensaje", async () => {
      const urlsImagenes = ["http://localhost:3000/uploads/productos/uuid.jpg"];
      mockImagenService.guardar.mockResolvedValue(urlsImagenes);
      mockProductoService.publicar.mockResolvedValue(productoPublicado);

      const result = await controller.publicar(dto, archivos);

      expect(mockImagenService.guardar).toHaveBeenCalledWith(archivos);
      expect(mockProductoService.publicar).toHaveBeenCalledWith(
        dto,
        urlsImagenes,
      );
      expect(result.mensaje).toBe("Producto publicado exitosamente");
      expect(result.producto).toEqual(productoPublicado);
    });

    it("deberia lanzar BadRequestException si no se suben imagenes", async () => {
      await expect(controller.publicar(dto, [])).rejects.toThrow(
        BadRequestException,
      );
      expect(mockImagenService.guardar).not.toHaveBeenCalled();
    });

    it("deberia lanzar BadRequestException si el array de archivos es undefined", async () => {
      await expect(
        controller.publicar(dto, undefined as unknown as Express.Multer.File[]),
      ).rejects.toThrow(BadRequestException);
      expect(mockImagenService.guardar).not.toHaveBeenCalled();
    });

    it("deberia propagar el error del ImagenService si la imagen es invalida", async () => {
      mockImagenService.guardar.mockRejectedValue(
        new BadRequestException("Seleccione al menos una imagen valida"),
      );

      await expect(controller.publicar(dto, archivos)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("deberia propagar el error del ProductoService", async () => {
      const urlsImagenes = ["http://localhost:3000/uploads/productos/uuid.jpg"];
      mockImagenService.guardar.mockResolvedValue(urlsImagenes);
      mockProductoService.publicar.mockRejectedValue(
        new Error("Error de base de datos"),
      );

      await expect(controller.publicar(dto, archivos)).rejects.toThrow(
        "Error de base de datos",
      );
    });
  });

  describe("listar", () => {
    it("deberia listar todos los productos y delegarlos al servicio", async () => {
      mockProductoService.listar.mockResolvedValue({
        productos: [],
        total: 0,
        pagina: 1,
        tamano: 20,
      });

      await controller.listar();

      expect(mockProductoService.listar).toHaveBeenCalledWith();
    });
  });

  describe("obtenerUno", () => {
    it("deberia obtener un producto por ID", async () => {
      const producto = {
        id: "prod-1",
        nombre: "Remera Algodón",
        descripcion: null,
        talle: "M",
        precioCentavos: BigInt(10000),
        stock: 5,
        imagenes: [],
        activo: true,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      };
      mockProductoService.obtenerUno.mockResolvedValue(producto);

      const result = await controller.obtenerUno("prod-1");

      expect(mockProductoService.obtenerUno).toHaveBeenCalledWith("prod-1");
      expect(result.id).toBe("prod-1");
    });

    it("deberia propagar NotFoundException del servicio", async () => {
      mockProductoService.obtenerUno.mockRejectedValue(
        new NotFoundException("Producto no encontrado"),
      );

      await expect(controller.obtenerUno("prod-inexistente")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("actualizar", () => {
    const productoActual = {
      id: "prod-1",
      nombre: "Remera Antigua",
      descripcion: null,
      talle: "M",
      precioCentavos: BigInt(10000),
      stock: 5,
      imagenes: ["http://localhost:3000/uploads/productos/old.jpg"],
      activo: true,
      creadoEn: new Date(),
      actualizadoEn: new Date(),
    };

    const productoActualizado = {
      ...productoActual,
      nombre: "Remera Actualizada",
      precioCentavos: BigInt(12000),
      actualizadoEn: new Date(),
    };

    it("deberia actualizar un producto sin nuevas imagenes", async () => {
      mockProductoService.actualizarAdmin.mockResolvedValue(
        productoActualizado,
      );

      const dto: ActualizarProductoDto = {
        nombre: "Remera Actualizada",
        precioCentavos: 12000,
      };
      const result = await controller.actualizar("prod-1", dto, []);

      expect(mockProductoService.obtenerUno).not.toHaveBeenCalled();
      expect(mockImagenService.guardar).not.toHaveBeenCalled();
      expect(mockProductoService.actualizarAdmin).toHaveBeenCalledWith(
        "prod-1",
        dto,
        undefined,
      );
      expect(result.mensaje).toBe("Producto actualizado exitosamente");
      expect(result.producto).toEqual(productoActualizado);
    });

    it("deberia actualizar un producto reemplazando imagenes", async () => {
      const archivos: Express.Multer.File[] = [
        {
          fieldname: "imagenes",
          originalname: "nueva.jpg",
          encoding: "7bit",
          mimetype: "image/jpeg",
          size: 100000,
          buffer: Buffer.from("fake-image-data"),
          stream: null as never,
          destination: "",
          filename: "",
          path: "",
        },
      ];
      const nuevasUrls = ["http://localhost:3000/uploads/productos/new.jpg"];

      mockProductoService.obtenerUno.mockResolvedValue(productoActual);
      mockImagenService.guardar.mockResolvedValue(nuevasUrls);
      mockProductoService.actualizarAdmin.mockResolvedValue({
        ...productoActualizado,
        imagenes: nuevasUrls,
      });
      mockImagenService.eliminar.mockResolvedValue(undefined);

      const dto: ActualizarProductoDto = { nombre: "Remera Actualizada" };
      const result = await controller.actualizar("prod-1", dto, archivos);

      expect(mockProductoService.obtenerUno).toHaveBeenCalledWith("prod-1");
      expect(mockImagenService.guardar).toHaveBeenCalledWith(archivos);
      expect(mockProductoService.actualizarAdmin).toHaveBeenCalledWith(
        "prod-1",
        dto,
        nuevasUrls,
      );
      expect(mockImagenService.eliminar).toHaveBeenCalledWith([
        "http://localhost:3000/uploads/productos/old.jpg",
      ]);
      expect(result.mensaje).toBe("Producto actualizado exitosamente");
    });

    it("deberia propagar NotFoundException del servicio si el producto no existe", async () => {
      mockProductoService.actualizarAdmin.mockRejectedValue(
        new NotFoundException("Producto no encontrado"),
      );

      const dto: ActualizarProductoDto = { nombre: "Nuevo" };
      await expect(
        controller.actualizar("prod-inexistente", dto, []),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
