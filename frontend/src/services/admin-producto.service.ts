import { apiFetch, ApiResult } from './api-fetch';

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

export interface DesactivarProductoResponse {
  mensaje: string;
  producto: ProductoPublicado;
}

export interface EliminarProductoResponse {
  mensaje: string;
}

export async function publicarProducto(
  payload: PublicarProductoPayload,
): Promise<ApiResult<PublicarProductoResponse>> {
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

  return apiFetch<PublicarProductoResponse>('/admin/productos', {
    method: 'POST',
    body: formData,
  });
}

export async function listarProductosAdmin(): Promise<ApiResult<ListarProductosAdminResponse>> {
  return apiFetch<ListarProductosAdminResponse>('/admin/productos');
}

export async function obtenerProductoAdmin(id: string): Promise<ApiResult<ProductoPublicado>> {
  return apiFetch<ProductoPublicado>(`/admin/productos/${id}`);
}

export async function actualizarProducto(
  id: string,
  payload: ActualizarProductoPayload,
): Promise<ApiResult<ActualizarProductoResponse>> {
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

  return apiFetch<ActualizarProductoResponse>(`/admin/productos/${id}`, {
    method: 'PATCH',
    body: formData,
  });
}

export async function desactivarProducto(
  id: string,
): Promise<ApiResult<DesactivarProductoResponse>> {
  return apiFetch<DesactivarProductoResponse>(`/admin/productos/${id}/desactivar`, {
    method: 'PUT',
  });
}

export async function eliminarProducto(
  id: string,
): Promise<ApiResult<EliminarProductoResponse>> {
  return apiFetch<EliminarProductoResponse>(`/admin/productos/${id}`, {
    method: 'DELETE',
  });
}
