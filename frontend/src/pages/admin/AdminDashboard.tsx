import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerToken } from '@/services/auth.service';
import { usePageTitle } from '@/hooks/usePageTitle';
import styles from './AdminDashboard.module.css';

interface Resumen {
  pedidosPendientes: number;
  productosActivos: number;
  notificacionesSinLeer: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export default function AdminDashboard() {
  usePageTitle('Panel de Administracion | Tienda de Ropa');

  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarResumen = async () => {
      try {
        const token = obtenerToken();
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const [pedidosRes, productosRes, notifRes] = await Promise.all([
          fetch(`${API_BASE_URL}/pedidos/list-pendientes?tamano=1`, { headers }),
          fetch(`${API_BASE_URL}/productos?activo=true&tamano=1`, { headers }),
          fetch(`${API_BASE_URL}/admin/notificaciones?filtro=unread`, { headers }),
        ]);

        const pedidosData = pedidosRes.ok ? await pedidosRes.json() : { total: 0 };
        const productosData = productosRes.ok ? await productosRes.json() : { total: 0 };
        const notifData = notifRes.ok ? await notifRes.json() : [];

        setResumen({
          pedidosPendientes: pedidosData.total ?? 0,
          productosActivos: productosData.total ?? 0,
          notificacionesSinLeer: Array.isArray(notifData) ? notifData.length : 0,
        });
      } catch {
        setResumen({ pedidosPendientes: 0, productosActivos: 0, notificacionesSinLeer: 0 });
      } finally {
        setCargando(false);
      }
    };

    cargarResumen();
  }, []);

  if (cargando) {
    return (
      <main className={styles.container}>
        <p>Cargando resumen...</p>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.titulo}>Panel de Administracion</h1>
      <div className={styles.grid}>
        <Link to="/admin/productos" className={styles.card}>
          <span className={styles.cardValue}>{resumen?.productosActivos}</span>
          <span className={styles.cardLabel}>Productos activos</span>
        </Link>
        <Link to="/admin/pedidos" className={styles.card}>
          <span className={styles.cardValue}>{resumen?.pedidosPendientes}</span>
          <span className={styles.cardLabel}>Pedidos pendientes</span>
        </Link>
        <Link to="/admin/notificaciones" className={styles.card}>
          <span className={styles.cardValue}>{resumen?.notificacionesSinLeer}</span>
          <span className={styles.cardLabel}>Notificaciones sin leer</span>
        </Link>
      </div>
    </main>
  );
}
