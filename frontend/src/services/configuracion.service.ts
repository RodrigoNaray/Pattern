import { apiFetch } from './api-fetch';

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

export const configuracionService = {
  async obtener(): Promise<ConfiguracionTienda> {
    const result = await apiFetch<ConfiguracionTienda>('/admin/configuracion');
    if (!result.ok) throw new Error(result.error.message);
    return result.value;
  },

  async actualizar(dto: ActualizarConfiguracionDto): Promise<{ mensaje: string; configuracion: ConfiguracionTienda }> {
    const result = await apiFetch<{ mensaje: string; configuracion: ConfiguracionTienda }>(
      '/admin/configuracion',
      {
        method: 'PUT',
        body: JSON.stringify(dto),
      },
    );
    if (!result.ok) throw new Error(result.error.message);
    return result.value;
  },
};
