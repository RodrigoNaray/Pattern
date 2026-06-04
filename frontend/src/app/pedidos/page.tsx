import type { Metadata } from 'next';
import BuscarPedido from '@/components/client/BuscarPedido';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Buscar pedido | Tienda de Ropa',
  description: 'Consulta el estado de tu pedido con tu codigo y email.',
};

export default function PedidosPage() {
  return (
    <main className={styles.contenedor}>
      <h1 className={styles.titulo}>Buscar mi pedido</h1>
      <BuscarPedido />
    </main>
  );
}
