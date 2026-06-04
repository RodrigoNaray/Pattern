'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCarrito } from '@/components/carrito/carrito-context';
import styles from './Header.module.css';

export function Header() {
  const router = useRouter();
  const { itemCount } = useCarrito();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoMarca}>T</span>
          <span className={styles.logoTexto}>Tienda de Ropa</span>
        </Link>
        <nav className={styles.nav}>
          <Link href="/" className={styles.link}>
            Inicio
          </Link>
          <Link href="/productos" className={styles.link}>
            Catalogo
          </Link>
          <button
            type="button"
            className={styles.cartButton}
            onClick={() => router.push('/carrito')}
          >
            Carrito
            {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
          </button>
        </nav>
      </div>
    </header>
  );
}
