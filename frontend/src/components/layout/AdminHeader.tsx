'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { eliminarToken } from '@/services/auth.service';
import ModalConfirmacion from '@/components/admin/ModalConfirmacion';
import styles from './AdminHeader.module.css';

export function AdminHeader() {
  const router = useRouter();
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  function handleLogout() {
    eliminarToken();
    router.push('/admin/login');
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/admin" className={styles.logo}>
          <span className={styles.logoMarca}>T</span>
          <span className={styles.logoTexto}>Tienda Admin</span>
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
          <Link href="/admin/administradores" className={styles.link}>
            Administradores
          </Link>
          <Link href="/admin/cuenta" className={styles.link}>
            Mi cuenta
          </Link>
          <button
            type="button"
            className={styles.logoutButton}
            onClick={() => setMostrarConfirmacion(true)}
          >
            Cerrar sesion
          </button>
        </nav>
      </div>

      <ModalConfirmacion
        open={mostrarConfirmacion}
        titulo="Cerrar sesion"
        mensaje="¿Estas seguro que queres cerrar tu sesion? Tendras que volver a ingresar tus credenciales."
        textoConfirmar="Si, cerrar sesion"
        textoCancelar="Cancelar"
        peligroso={false}
        onConfirmar={handleLogout}
        onCancelar={() => setMostrarConfirmacion(false)}
      />
    </header>
  );
}
