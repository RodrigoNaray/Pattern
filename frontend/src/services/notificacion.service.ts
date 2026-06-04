import { apiFetch } from './api-fetch';
import type { Notificacion, NotificacionDetalle, NotificacionFiltro, ListarNotificacionesQuery } from '@/types/notificacion';

async function fetchNotificaciones(filtro?: NotificacionFiltro): Promise<Notificacion[]> {
  const params = filtro ? `?filtro=${filtro}` : '';
  const result = await apiFetch<Notificacion[]>(`/admin/notificaciones/${params}`);
  if (!result.ok) throw new Error(result.error.message);
  return result.value;
}

async function fetchNotificacionDetalle(id: string): Promise<NotificacionDetalle> {
  const result = await apiFetch<NotificacionDetalle>(`/admin/notificaciones/${id}/detalle`);
  if (!result.ok) throw new Error(result.error.message);
  return result.value;
}

async function fetchMarcarComoLeida(id: string): Promise<{ id: string; leida: boolean; creadoEn: Date }> {
  const result = await apiFetch<{ id: string; leida: boolean; creadoEn: Date }>(
    `/admin/notificaciones/${id}/leida`,
    { method: 'PATCH' },
  );
  if (!result.ok) throw new Error(result.error.message);
  return result.value;
}

export const notificacionService = {
  listar: async (query?: ListarNotificacionesQuery): Promise<Notificacion[]> => {
    return fetchNotificaciones(query?.filtro);
  },

  obtenerDetalle: async (id: string): Promise<NotificacionDetalle> => {
    return fetchNotificacionDetalle(id);
  },

  marcarComoLeida: async (id: string): Promise<{ id: string; leida: boolean; creadoEn: Date }> => {
    return fetchMarcarComoLeida(id);
  },
};
