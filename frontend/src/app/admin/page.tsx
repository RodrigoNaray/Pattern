'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './AdminDashboard.module.css';

interface Resumen {
  pedidosPendientes: number;
  productosActivos: number;
  notificacionesSinLeer: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function AdminDashboardPage() {
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarResumen = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const [pedidosRes, productosRes, notifRes] = await Promise.all([
          fetch(`${API_BASE_URL}/pedidos/list-pendientes?tamano=1`, { headers }),
          fetch(`${API_BASE_URL}/productos`, { headers }),
          fetch(`${API_BASE_URL}/admin/notificaciones?unread=true`, { headers }),
        ]);

        const pedidosData = pedidosRes.ok ? await pedidosRes.json() : { data: [], total: 0 };
        const productosData = productosRes.ok ? await productosRes.json() : [];
        const notifData = notifRes.ok ? await notifRes.json() : [];

        setResumen({
          pedidosPendientes: pedidosData.total ?? (Array.isArray(pedidosData) ? pedidosData.length : 0),
          productosActivos: Array.isArray(productosData) ? productosData.length : 0,
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
        <Link href="/admin/productos" className={styles.card}>
          <span className={styles.cardValue}>{resumen?.productosActivos}</span>
          <span className={styles.cardLabel}>Productos activos</span>
        </Link>
        <div className={styles.card}>
          <span className={styles.cardValue}>{resumen?.pedidosPendientes}</span>
          <span className={styles.cardLabel}>Pedidos pendientes</span>
        </div>
        <Link href="/notificaciones" className={styles.card}>
          <span className={styles.cardValue}>{resumen?.notificacionesSinLeer}</span>
          <span className={styles.cardLabel}>Notificaciones sin leer</span>
        </Link>
      </div>
    </main>
  );
}
