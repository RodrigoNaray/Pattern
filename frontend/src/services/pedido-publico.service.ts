import { apiFetch } from './api-fetch';

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

export const pedidoPublicoService = {
  async buscarPorCodigoYEmail(codigo: string, email: string): Promise<PedidoDetalle> {
    const params = new URLSearchParams({ codigo, email });
    const result = await apiFetch<PedidoDetalle>(`/pedidos/buscar?${params.toString()}`);
    if (!result.ok) throw new Error(result.error.message);
    return result.value;
  },
};

export type { PedidoDetalle };
