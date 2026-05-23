export interface CancelarPedidoResultado {
  id: string;
  codigo: string;
  estado: string;
  totalCentavos: number;
}

export interface CancelarPedidoResponse {
  mensaje: string;
  pedido: CancelarPedidoResultado;
}