import { apiFetch, ApiResult } from './api-fetch';

export interface Administrador {
  id: string;
  nombre: string;
  email: string;
  ultimoAccesoEn: string | null;
}

export interface CrearAdminPayload {
  nombre: string;
  email: string;
  password: string;
}

export async function listarAdministradores(): Promise<ApiResult<Administrador[]>> {
  return apiFetch<Administrador[]>('/administradores');
}

export async function crearAdministrador(
  payload: CrearAdminPayload,
): Promise<ApiResult<Administrador>> {
  return apiFetch<Administrador>('/administradores', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function eliminarAdministrador(id: string): Promise<ApiResult<{ mensaje: string }>> {
  return apiFetch<{ mensaje: string }>(`/administradores/${id}`, {
    method: 'DELETE',
  });
}

export async function resetearPassword(
  id: string,
  nuevaPassword: string,
): Promise<ApiResult<{ mensaje: string }>> {
  return apiFetch<{ mensaje: string }>(`/administradores/${id}/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ nuevaPassword }),
  });
}
