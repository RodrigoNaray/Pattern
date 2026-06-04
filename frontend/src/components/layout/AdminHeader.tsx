'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { eliminarToken } from '@/services/auth.service';
import styles from './AdminHeader.module.css';

export function AdminHeader() {
  const router = useRouter();

  function handleLogout() {
    eliminarToken();
    router.push('/admin/login');
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/admin" className={styles.logo}>
          Panel Admin
        </Link>
        <nav className={styles.nav}>
          <Link href="/admin" className={styles.link}>
            Dashboard
          </Link>
          <Link href="/admin/productos" className={styles.link}>
            Productos
          </Link>
          <Link href="/admin/pedidos" className={styles.link}>
            Pedidos
          </Link>
          <Link href="/admin/configuracion" className={styles.link}>
            Configuracion
          </Link>
          <Link href="/admin/notificaciones" className={styles.link}>
            Notificaciones
          </Link>
          <button
            type="button"
            className={styles.logoutButton}
            onClick={handleLogout}
          >
            Cerrar sesion
          </button>
        </nav>
      </div>
    </header>
  );
}
