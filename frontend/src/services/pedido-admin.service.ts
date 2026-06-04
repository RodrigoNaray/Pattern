import { obtenerToken } from './auth.service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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

function getHeaders(): Record<string, string> {
  const token = obtenerToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const pedidoAdminService = {
  async listarPendientes(pagina = 1, tamano = 20): Promise<ListarPendientesResponse> {
    const res = await fetch(
      `${API_BASE_URL}/pedidos/list-pendientes?pagina=${pagina}&tamano=${tamano}`,
      { headers: getHeaders() },
    );
    if (!res.ok) throw new Error('Error al cargar pedidos pendientes');
    return res.json();
  },

  async obtenerDetalle(id: string): Promise<PedidoDetalle> {
    const res = await fetch(`${API_BASE_URL}/pedidos/${id}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener detalle del pedido');
    return res.json();
  },

  async confirmarPago(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/pedidos/${id}/confirmar-pago`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error((data as { message?: string }).message ?? 'Error al confirmar pago');
    }
  },

  async cancelar(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/pedidos/${id}/cancelar`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error((data as { message?: string }).message ?? 'Error al cancelar pedido');
    }
  },
};
