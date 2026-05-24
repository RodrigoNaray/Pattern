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

export interface ListarProductosAdminResponse {
  productos: ProductoPublicado[];
  total: number;
  pagina: number;
  tamano: number;
}

export interface ActualizarProductoPayload {
  nombre?: string;
  descripcion?: string;
  talle?: string;
  precioCentavos?: number;
  stock?: number;
  imagenes?: File[];
}

export interface ActualizarProductoResponse {
  mensaje: string;
  producto: ProductoPublicado;
}

export async function listarProductosAdmin(): Promise<Result<ListarProductosAdminResponse>> {
  const token = obtenerToken();
  if (!token) return { ok: false, error: new Error('No autenticado') };

  try {
    const response = await fetch(`${API_BASE_URL}/admin/productos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      return { ok: false, error: new Error(`Error HTTP: ${response.status}`) };
    }
    const data = (await response.json()) as ListarProductosAdminResponse;
    return { ok: true, value: data };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error : new Error('Error de red') };
  }
}

export async function obtenerProductoAdmin(id: string): Promise<Result<ProductoPublicado>> {
  const token = obtenerToken();
  if (!token) return { ok: false, error: new Error('No autenticado') };

  try {
    const response = await fetch(`${API_BASE_URL}/admin/productos/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const mensaje = (data as { message?: string }).message ?? 'Producto no encontrado';
      return { ok: false, error: new Error(mensaje) };
    }
    const data = (await response.json()) as ProductoPublicado;
    return { ok: true, value: data };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error : new Error('Error de red') };
  }
}

export async function actualizarProducto(
  id: string,
  payload: ActualizarProductoPayload,
): Promise<Result<ActualizarProductoResponse>> {
  const token = obtenerToken();
  if (!token) return { ok: false, error: new Error('No autenticado') };

  const formData = new FormData();
  if (payload.nombre !== undefined) formData.append('nombre', payload.nombre);
  if (payload.talle !== undefined) formData.append('talle', payload.talle);
  if (payload.precioCentavos !== undefined) formData.append('precioCentavos', String(payload.precioCentavos));
  if (payload.descripcion !== undefined) formData.append('descripcion', payload.descripcion);
  if (payload.stock !== undefined) formData.append('stock', String(payload.stock));
  if (payload.imagenes) {
    for (const imagen of payload.imagenes) {
      formData.append('imagenes', imagen);
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/admin/productos/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const mensaje = (data as { message?: string | string[] }).message ?? 'Error al actualizar el producto';
      const mensajeStr = Array.isArray(mensaje) ? mensaje[0] : mensaje;
      return { ok: false, error: new Error(mensajeStr ?? 'Error desconocido') };
    }
    const data = (await response.json()) as ActualizarProductoResponse;
    return { ok: true, value: data };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error : new Error('Error de red') };
  }
}
