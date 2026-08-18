import BuscarPedido from '@/components/client/BuscarPedido';
import { usePageTitle } from '@/hooks/usePageTitle';
import styles from './page.module.css';

export default function Pedidos() {
  usePageTitle('Buscar pedido | Tienda de Ropa');

  return (
    <main className={styles.contenedor}>
      <h1 className={styles.titulo}>Buscar mi pedido</h1>
      <BuscarPedido />
    </main>
  );
}
