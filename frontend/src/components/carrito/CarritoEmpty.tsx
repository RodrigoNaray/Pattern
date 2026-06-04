import Link from 'next/link';
import styles from './CarritoEmpty.module.css';

export function CarritoEmpty() {
  return (
    <div className={styles.carritoEmptyContainer}>
      <span className={styles.carritoEmptyIcono}>🛒</span>
      <h2 className={styles.carritoEmptyTitulo}>Tu carrito est&aacute; vac&iacute;o</h2>
      <p className={styles.carritoEmptyTexto}>
        Agreg&aacute; productos desde el cat&aacute;logo para comenzar tu pedido.
      </p>
      <Link href="/productos" className={styles.botonCatalogo}>
        Ir al cat&aacute;logo
      </Link>
    </div>
  );
}