import { obtenerToken, eliminarToken } from './auth.service';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export interface ApiError {
  message: string;
  status: number;
}

export type ApiResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: ApiError };

function isFormData(body: unknown): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

function redirectLogin(): void {
  if (typeof window !== 'undefined') {
    eliminarToken();
    window.location.href = '/admin/login';
  }
}

async function parseError(res: Response): Promise<ApiError> {
  try {
    const data = (await res.json()) as { message?: string | string[] };
    const message = Array.isArray(data.message) ? data.message[0] : data.message;
    return { message: message ?? `Error HTTP ${res.status}`, status: res.status };
  } catch {
    return { message: `Error HTTP ${res.status}`, status: res.status };
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit,
): Promise<ApiResult<T>> {
  const token = obtenerToken();
  const headers = new Headers(options?.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const body = options?.body;
  if (!isFormData(body) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      redirectLogin();
      return { ok: false, error: { message: 'Sesión expirada', status: 401 } };
    }

    if (!res.ok) {
      const error = await parseError(res);
      return { ok: false, error };
    }

    if (res.status === 204) {
      return { ok: true, value: undefined as T };
    }

    const value = (await res.json()) as T;
    return { ok: true, value };
  } catch (err) {
    return {
      ok: false,
      error: {
        message: err instanceof Error ? err.message : 'Error de red',
        status: 0,
      },
    };
  }
}
