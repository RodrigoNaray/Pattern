import { obtenerToken } from './auth.service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface ConfiguracionTienda {
  id: string;
  nombreTienda: string | null;
  whatsappContacto: string | null;
  banco: string | null;
  cbu: string | null;
  alias: string | null;
  titular: string | null;
  mensajeTransferencia: string | null;
  pedidoVencimientoHoras: number;
  estadoProductoBorrador: boolean;
  actualizadoEn: string;
}

interface ActualizarConfiguracionDto {
  nombreTienda?: string;
  whatsappContacto?: string;
  banco?: string;
  cbu?: string;
  alias?: string;
  titular?: string;
  mensajeTransferencia?: string;
  pedidoVencimientoHoras?: number;
  estadoProductoBorrador?: boolean;
}

function getHeaders(): Record<string, string> {
  const token = obtenerToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export const configuracionService = {
  async obtener(): Promise<ConfiguracionTienda> {
    const res = await fetch(`${API_BASE_URL}/admin/configuracion`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener configuración');
    return res.json();
  },

  async actualizar(dto: ActualizarConfiguracionDto): Promise<{ mensaje: string; configuracion: ConfiguracionTienda }> {
    const res = await fetch(`${API_BASE_URL}/admin/configuracion`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(dto),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error((data as { message?: string }).message ?? 'Error al actualizar configuración');
    }
    return res.json();
  },
};
