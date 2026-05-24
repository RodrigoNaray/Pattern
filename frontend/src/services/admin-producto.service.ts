import { obtenerToken } from './auth.service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export interface ProductoPublicado {
  id: string;
  nombre: string;
  descripcion: string | null;
  talle: string;
  precioCentavos: number;
  stock: number;
  imagenes: string[];
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

export interface PublicarProductoPayload {
  nombre: string;
  descripcion?: string;
  talle: string;
  precioCentavos: number;
  imagenes: File[];
}

export interface PublicarProductoResponse {
  mensaje: string;
  producto: ProductoPublicado;
}

type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

export async function publicarProducto(
  payload: PublicarProductoPayload,
): Promise<Result<PublicarProductoResponse>> {
  const token = obtenerToken();

  if (!token) {
    return { ok: false, error: new Error('No autenticado') };
  }

  const formData = new FormData();
  formData.append('nombre', payload.nombre);
  formData.append('talle', payload.talle);
  formData.append('precioCentavos', String(payload.precioCentavos));

  if (payload.descripcion) {
    formData.append('descripcion', payload.descripcion);
  }

  for (const imagen of payload.imagenes) {
    formData.append('imagenes', imagen);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/admin/productos`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const mensaje =
        (data as { message?: string | string[] }).message ??
        'Error al publicar el producto';
      const mensajeStr = Array.isArray(mensaje) ? mensaje[0] : mensaje;
      return { ok: false, error: new Error(mensajeStr ?? 'Error desconocido') };
    }

    const data = (await response.json()) as PublicarProductoResponse;
    return { ok: true, value: data };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error : new Error('Error de red'),
    };
  }
}
