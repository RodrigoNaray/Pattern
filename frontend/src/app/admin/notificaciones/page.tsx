'use client';

import { useState, useEffect, useCallback } from 'react';
import { obtenerToken } from '@/services/auth.service';
import styles from '@/styles/notificaciones.module.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface Notificacion {
  id: string;
  canal: string;
  mensaje: string;
  leida: boolean;
  creadoEn: string;
}

interface PedidoResumen {
  codigo: string;
  emailComprador: string;
  telefonoComprador: string;
  estado: string;
  totalCentavos: number;
  confirmadoEn: string | null;
  vencidoEn: string;
}

interface NotificacionDetalle {
  id: string;
  canal: string;
  mensaje: string;
  leida: boolean;
  creadoEn: string;
  pedido: PedidoResumen | null;
}

function getHeaders(): Record<string, string> {
  const token = obtenerToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

function formatDate(date: string): string {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function formatCurrency(centavos: number): string {
  return (centavos / 100).toLocaleString('es-UY', { style: 'currency', currency: 'UYU' });
}

function NotificacionItem({
  notificacion,
  onMarcarComoLeida,
}: {
  notificacion: Notificacion;
  onMarcarComoLeida: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [detalle, setDetalle] = useState<NotificacionDetalle | null>(null);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (expanded) {
      setExpanded(false);
      setDetalle(null);
      return;
    }
    setLoading(true);
    setExpanded(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/notificaciones/${notificacion.id}/detalle`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = (await res.json()) as NotificacionDetalle;
        setDetalle(data);
      }
    } catch {
      console.error('Error al obtener detalle');
    } finally {
      setLoading(false);
    }
    if (!notificacion.leida) {
      onMarcarComoLeida(notificacion.id);
    }
  };

  return (
    <div className={`${styles.notificacionItem} ${notificacion.leida ? styles.leida : ''}`}>
      <button className={styles.notificacionHeader} onClick={handleToggle}>
        <div className={styles.notificacionInfo}>
          <span className={styles.canalBadge}>{notificacion.canal}</span>
          <span className={styles.mensaje}>{notificacion.mensaje}</span>
        </div>
        <div className={styles.notificacionMeta}>
          {!notificacion.leida && <span className={styles.indicadorNoLeida} />}
          <span className={styles.fecha}>{formatDate(notificacion.creadoEn)}</span>
        </div>
      </button>
      {expanded && (
        <div className={styles.notificacionDetalle}>
          {loading ? (
            <p className={styles.cargando}>Cargando...</p>
          ) : detalle?.pedido ? (
            <div className={styles.pedidoInfo}>
              <h4 className={styles.tituloPedido}>Pedido {detalle.pedido.codigo}</h4>
              <div className={styles.camposPedido}>
                <p><strong>Comprador:</strong> {detalle.pedido.emailComprador}</p>
                <p><strong>Teléfono:</strong> {detalle.pedido.telefonoComprador}</p>
                <p><strong>Estado:</strong> {detalle.pedido.estado}</p>
                <p><strong>Total:</strong> {formatCurrency(detalle.pedido.totalCentavos)}</p>
                {detalle.pedido.confirmadoEn && (
                  <p><strong>Confirmado:</strong> {formatDate(detalle.pedido.confirmadoEn)}</p>
                )}
                <p><strong>Vencimiento:</strong> {formatDate(detalle.pedido.vencidoEn)}</p>
              </div>
            </div>
          ) : (
            <p className={styles.sinPedido}>No tiene pedido asociado</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminNotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [filtro, setFiltro] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarNotificaciones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = filtro === 'unread' ? '?filtro=unread' : '';
      const res = await fetch(`${API_BASE_URL}/admin/notificaciones/${params}`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Error al cargar notificaciones');
      const data = (await res.json()) as Notificacion[];
      setNotificaciones(data);
    } catch {
      setError('No se pudieron cargar las notificaciones');
    } finally {
      setLoading(false);
    }
  }, [filtro]);

  useEffect(() => { cargarNotificaciones(); }, [cargarNotificaciones]);

  const handleMarcarComoLeida = useCallback(async (id: string) => {
    try {
      await fetch(`${API_BASE_URL}/admin/notificaciones/${id}/leida`, {
        method: 'PATCH',
        headers: getHeaders(),
      });
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n)),
      );
    } catch {
      console.error('Error al marcar como leída');
    }
  }, []);

  const notificacionesNoLeidas = notificaciones.filter((n) => !n.leida).length;

  return (
    <div className={styles.contenedor}>
      <header className={styles.encabezado}>
        <h1 className={styles.titulo}>Notificaciones</h1>
        {notificacionesNoLeidas > 0 && (
          <span className={styles.contador}>{notificacionesNoLeidas} sin leer</span>
        )}
      </header>
      <div className={styles.filtros}>
        <button
          className={`${styles.filtroBoton} ${filtro === 'all' ? styles.activo : ''}`}
          onClick={() => setFiltro('all')}
        >
          Todas
        </button>
        <button
          className={`${styles.filtroBoton} ${filtro === 'unread' ? styles.activo : ''}`}
          onClick={() => setFiltro('unread')}
        >
          Sin leer
        </button>
      </div>
      {loading ? (
        <p className={styles.cargando}>Cargando notificaciones...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : notificaciones.length === 0 ? (
        <p className={styles.vacio}>No hay notificaciones disponibles</p>
      ) : (
        <div className={styles.lista}>
          {notificaciones.map((n) => (
            <NotificacionItem
              key={n.id}
              notificacion={n}
              onMarcarComoLeida={handleMarcarComoLeida}
            />
          ))}
        </div>
      )}
    </div>
  );
}
