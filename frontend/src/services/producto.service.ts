/**
 * Servicio para consumir la API de productos del backend.
 * Implementa el patron Result para manejo de errores.
 */

type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string | null;
  talle: string;
  precioCentavos: number;
  stock: number;
  imagenes: string[];
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}

interface ProductosResponse {
  productos: Producto[];
  total: number;
  pagina: number;
  tamano: number;
}

interface ProductosQueryParams {
  activo?: boolean;
  talle?: string;
  q?: string;
  pagina?: number;
  tamano?: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

async function fetchJson<T>(url: string): Promise<Result<T>> {
  try {
    const response = await fetch(url, {
    });

    if (!response.ok) {
      return {
        ok: false,
        error: new Error(`Error HTTP: ${response.status}`),
      };
    }

    const data: T = await response.json();
    return { ok: true, value: data };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

export async function obtenerProductosActivos(params?: ProductosQueryParams): Promise<Result<ProductosResponse>> {
  const searchParams = new URLSearchParams();

  if (params?.activo !== undefined) {
    searchParams.set('activo', String(params.activo));
  }
  if (params?.talle) {
    searchParams.set('talle', params.talle);
  }
  if (params?.q) {
    searchParams.set('q', params.q);
  }
  if (params?.pagina) {
    searchParams.set('pagina', String(params.pagina));
  }
  if (params?.tamano) {
    searchParams.set('tamano', String(params.tamano));
  }

  const url = `${API_BASE_URL}/productos${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  return fetchJson<ProductosResponse>(url);
}

export async function obtenerProductoPorId(id: string): Promise<Result<Producto>> {
  const url = `${API_BASE_URL}/productos/${id}`;
  return fetchJson<Producto>(url);
}