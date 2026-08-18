import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eliminarToken } from '@/services/auth.service';
import ModalConfirmacion from '@/components/admin/ModalConfirmacion';
import styles from './AdminHeader.module.css';

export function AdminHeader() {
  const navigate = useNavigate();
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  function handleLogout() {
    eliminarToken();
    navigate('/admin/login');
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/admin" className={styles.logo}>
          <span className={styles.logoMarca}>T</span>
          <span className={styles.logoTexto}>Tienda Admin</span>
        </Link>
        <nav className={styles.nav}>
          <Link to="/admin" className={styles.link}>
            Dashboard
          </Link>
          <Link to="/admin/productos" className={styles.link}>
            Productos
          </Link>
          <Link to="/admin/pedidos" className={styles.link}>
            Pedidos
          </Link>
          <Link to="/admin/configuracion" className={styles.link}>
            Configuracion
          </Link>
          <Link to="/admin/notificaciones" className={styles.link}>
            Notificaciones
          </Link>
          <Link to="/admin/administradores" className={styles.link}>
            Administradores
          </Link>
          <Link to="/admin/cuenta" className={styles.link}>
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
