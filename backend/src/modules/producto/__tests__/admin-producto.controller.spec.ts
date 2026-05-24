import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AdminProductoController } from '../admin-producto.controller';
import { ProductoService } from '../producto.service';
import { ImagenService } from '../imagen.service';
import { PublicarProductoDto } from '../dto/publicar-producto.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

const mockProductoService = {
  publicar: jest.fn(),
};

const mockImagenService = {
  guardar: jest.fn(),
};

const mockJwtAuthGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

describe('AdminProductoController', () => {
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

  describe('publicar', () => {
    const dto: PublicarProductoDto = {
      nombre: 'Remera Algodón',
      talle: 'M',
      precioCentavos: 15000,
      descripcion: 'Remera de algodón 100%',
    };

    const archivos: Express.Multer.File[] = [
      {
        fieldname: 'imagenes',
        originalname: 'foto.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 100000,
        buffer: Buffer.from('fake-image-data'),
        stream: null as never,
        destination: '',
        filename: '',
        path: '',
      },
    ];

    const productoPublicado = {
      id: 'prod-1',
      nombre: 'Remera Algodón',
      descripcion: 'Remera de algodón 100%',
      talle: 'M',
      precioCentavos: BigInt(15000),
      stock: 0,
      imagenes: ['http://localhost:3000/uploads/productos/uuid.jpg'],
      activo: true,
      creadoEn: new Date(),
      actualizadoEn: new Date(),
    };

    it('deberia publicar un producto exitosamente y retornar 201 con mensaje', async () => {
      const urlsImagenes = ['http://localhost:3000/uploads/productos/uuid.jpg'];
      mockImagenService.guardar.mockResolvedValue(urlsImagenes);
      mockProductoService.publicar.mockResolvedValue(productoPublicado);

      const result = await controller.publicar(dto, archivos);

      expect(mockImagenService.guardar).toHaveBeenCalledWith(archivos);
      expect(mockProductoService.publicar).toHaveBeenCalledWith(dto, urlsImagenes);
      expect(result.mensaje).toBe('Producto publicado exitosamente');
      expect(result.producto).toEqual(productoPublicado);
    });

    it('deberia lanzar BadRequestException si no se suben imagenes', async () => {
      await expect(controller.publicar(dto, [])).rejects.toThrow(BadRequestException);
      expect(mockImagenService.guardar).not.toHaveBeenCalled();
    });

    it('deberia lanzar BadRequestException si el array de archivos es undefined', async () => {
      await expect(
        controller.publicar(dto, undefined as unknown as Express.Multer.File[]),
      ).rejects.toThrow(BadRequestException);
      expect(mockImagenService.guardar).not.toHaveBeenCalled();
    });

    it('deberia propagar el error del ImagenService si la imagen es invalida', async () => {
      mockImagenService.guardar.mockRejectedValue(
        new BadRequestException('Seleccione al menos una imagen valida'),
      );

      await expect(controller.publicar(dto, archivos)).rejects.toThrow(BadRequestException);
    });

    it('deberia propagar el error del ProductoService', async () => {
      const urlsImagenes = ['http://localhost:3000/uploads/productos/uuid.jpg'];
      mockImagenService.guardar.mockResolvedValue(urlsImagenes);
      mockProductoService.publicar.mockRejectedValue(new Error('Error de base de datos'));

      await expect(controller.publicar(dto, archivos)).rejects.toThrow('Error de base de datos');
    });
  });
});
