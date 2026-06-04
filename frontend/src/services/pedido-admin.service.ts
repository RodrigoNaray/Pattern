import { apiFetch } from './api-fetch';

interface PedidoPendiente {
  id: string;
  codigo: string;
  emailComprador: string;
  telefonoComprador: string;
  totalCentavos: number;
  creadoEn: string;
  vencidoEn: string;
  itemsCount: number;
}

interface PedidoDetalle {
  id: string;
  codigo: string;
  emailComprador: string;
  telefonoComprador: string;
  estado: string;
  totalCentavos: number;
  creadoEn: string;
  confirmadoEn: string | null;
  vencidoEn: string;
  items: Array<{
    id: string;
    productoId: string;
    cantidad: number;
    precioUnitarioCentavos: number;
    subtotalCentavos: number;
    producto: { nombre: string; talle: string };
  }>;
}

interface ListarPendientesResponse {
  pedidos: PedidoPendiente[];
  total: number;
  pagina: number;
  tamano: number;
}

export const pedidoAdminService = {
  async listarPendientes(pagina = 1, tamano = 20): Promise<ListarPendientesResponse> {
    const result = await apiFetch<ListarPendientesResponse>(
      `/pedidos/list-pendientes?pagina=${pagina}&tamano=${tamano}`,
    );
    if (!result.ok) throw new Error(result.error.message);
    return result.value;
  },

  async obtenerDetalle(id: string): Promise<PedidoDetalle> {
    const result = await apiFetch<PedidoDetalle>(`/pedidos/${id}`);
    if (!result.ok) throw new Error(result.error.message);
    return result.value;
  },

  async confirmarPago(id: string): Promise<void> {
    const result = await apiFetch(`/pedidos/${id}/confirmar-pago`, {
      method: 'PUT',
    });
    if (!result.ok) throw new Error(result.error.message);
  },

  async cancelar(id: string): Promise<void> {
    const result = await apiFetch(`/pedidos/${id}/cancelar`, {
      method: 'PUT',
    });
    if (!result.ok) throw new Error(result.error.message);
  },
};
