import { Injectable, BadRequestException } from '@nestjs/common';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import { extname } from 'path';

const EXTENSIONES_PERMITIDAS = ['.jpg', '.jpeg', '.png', '.webp'] as const;
const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5 MB

@Injectable()
export class ImagenService {
  private readonly directorioUpload: string;
  private readonly urlBase: string;

  constructor() {
    this.directorioUpload = join(process.cwd(), 'uploads', 'productos');
    this.urlBase = process.env['API_URL'] ?? 'http://localhost:3000';
    this.asegurarDirectorio();
  }

  guardar(archivos: Express.Multer.File[]): Promise<string[]> {
    if (archivos.length === 0) {
      throw new BadRequestException('Seleccione al menos una imagen valida');
    }

    const promesas = archivos.map((archivo) => this.guardarArchivo(archivo));
    return Promise.all(promesas);
  }

  private asegurarDirectorio(): void {
    if (!existsSync(this.directorioUpload)) {
      mkdirSync(this.directorioUpload, { recursive: true });
    }
  }

  private async guardarArchivo(archivo: Express.Multer.File): Promise<string> {
    this.validarArchivo(archivo);

    const extension = extname(archivo.originalname).toLowerCase();
    const nombreArchivo = `${randomUUID()}${extension}`;
    const rutaCompleta = join(this.directorioUpload, nombreArchivo);

    await writeFile(rutaCompleta, archivo.buffer);

    return `${this.urlBase}/uploads/productos/${nombreArchivo}`;
  }

  private validarArchivo(archivo: Express.Multer.File): void {
    const extension = extname(archivo.originalname).toLowerCase();
    const esExtensionValida = (EXTENSIONES_PERMITIDAS as readonly string[]).includes(extension);

    if (!esExtensionValida) {
      throw new BadRequestException('Seleccione al menos una imagen valida');
    }

    if (archivo.size > TAMANO_MAXIMO_BYTES) {
      throw new BadRequestException('La imagen supera el tamaño máximo permitido de 5 MB');
    }
  }
}
