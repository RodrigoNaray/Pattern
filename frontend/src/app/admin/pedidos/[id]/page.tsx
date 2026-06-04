'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { pedidoAdminService } from '@/services/pedido-admin.service';
import styles from './PedidoDetalle.module.css';

interface PedidoDetalle {
  id: string;
  codigo: string;
  emailComprador: string;
  telefonoComprador: string;
  estado: string;
  totalCentavos: number;
  creadoEn: string;
  confirmadoEn: string | null;
  vencidoEn: string;
  items: Array<{
    id: string;
    productoId: string;
    cantidad: number;
    precioUnitarioCentavos: number;
    subtotalCentavos: number;
    producto: { nombre: string; talle: string };
  }>;
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

function claseEstado(estado: string): string {
  switch (estado) {
    case 'PENDIENTE_PAGO': return styles.estadoPendiente;
    case 'PAGO_CONFIRMADO': return styles.estadoConfirmado;
    case 'CANCELADO': return styles.estadoCancelado;
    default: return '';
  }
}

function etiquetaEstado(estado: string): string {
  switch (estado) {
    case 'PENDIENTE_PAGO': return 'Pendiente';
    case 'PAGO_CONFIRMADO': return 'Confirmado';
    case 'CANCELADO': return 'Cancelado';
    default: return estado;
  }
}

export default function AdminPedidoDetallePage() {
  const params = useParams();
  const id = params.id as string;

  const [pedido, setPedido] = useState<PedidoDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accionando, setAccionando] = useState(false);
  const [toast, setToast] = useState<{ mensaje: string; error?: boolean } | null>(null);

  const mostrarToast = useCallback((mensaje: string, error?: boolean) => {
    setToast({ mensaje, error });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await pedidoAdminService.obtenerDetalle(id);
      setPedido(data);
    } catch {
      setError('Error al cargar detalle del pedido');
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleConfirmar = async () => {
    if (!pedido || accionando) return;
    setAccionando(true);
    try {
      await pedidoAdminService.confirmarPago(id);
      mostrarToast('Pago confirmado exitosamente');
      cargar();
    } catch (err) {
      mostrarToast(err instanceof Error ? err.message : 'Error al confirmar pago', true);
    } finally {
      setAccionando(false);
    }
  };

  const handleCancelar = async () => {
    if (!pedido || accionando) return;
    if (!window.confirm('¿Estás seguro de cancelar este pedido?')) return;
    setAccionando(true);
    try {
      await pedidoAdminService.cancelar(id);
      mostrarToast('Pedido cancelado');
      cargar();
    } catch (err) {
      mostrarToast(err instanceof Error ? err.message : 'Error al cancelar pedido', true);
    } finally {
      setAccionando(false);
    }
  };

  if (cargando) return <main className={styles.container}><p className={styles.cargando}>Cargando pedido...</p></main>;
  if (error) return <main className={styles.container}><p className={styles.error}>{error}</p></main>;
  if (!pedido) return <main className={styles.container}><p className={styles.error}>Pedido no encontrado</p></main>;

  const esPendiente = pedido.estado === 'PENDIENTE_PAGO';

  return (
    <main className={styles.container}>
      <Link href="/admin/pedidos" className={styles.backLink}>&larr; Volver a pedidos</Link>

      <div className={styles.header}>
        <h1 className={styles.titulo}>Pedido {pedido.codigo}</h1>
        <span className={`${styles.estadoBadge} ${claseEstado(pedido.estado)}`}>
          {etiquetaEstado(pedido.estado)}
        </span>
      </div>

      <div className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Datos del comprador</h2>
        <div className={styles.seccionBody}>
          <div className={styles.campo}>
            <span className={styles.campoLabel}>Email</span>
            <span className={styles.campoValor}>{pedido.emailComprador}</span>
          </div>
          <div className={styles.campo}>
            <span className={styles.campoLabel}>Teléfono</span>
            <span className={styles.campoValor}>{pedido.telefonoComprador}</span>
          </div>
          <div className={styles.campo}>
            <span className={styles.campoLabel}>Creado</span>
            <span className={styles.campoValor}>{formatDate(pedido.creadoEn)}</span>
          </div>
          <div className={styles.campo}>
            <span className={styles.campoLabel}>Vence</span>
            <span className={styles.campoValor}>{formatDate(pedido.vencidoEn)}</span>
          </div>
          {pedido.confirmadoEn && (
            <div className={styles.campo}>
              <span className={styles.campoLabel}>Confirmado</span>
              <span className={styles.campoValor}>{formatDate(pedido.confirmadoEn)}</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Productos</h2>
        <div className={styles.itemsLista}>
          {pedido.items.map((item) => (
            <div key={item.id} className={styles.itemRow}>
              <div className={styles.itemInfo}>
                <span className={styles.itemNombre}>{item.producto.nombre}</span>
                <span className={styles.itemTalle}>
                  Talle {item.producto.talle} &times; {item.cantidad}
                </span>
              </div>
              <span className={styles.itemPrecio}>{formatCurrency(item.subtotalCentavos)}</span>
            </div>
          ))}
          <div className={styles.totalRow}>
            <span>Total</span>
            <span>{formatCurrency(pedido.totalCentavos)}</span>
          </div>
        </div>
      </div>

      {esPendiente && (
        <div className={styles.acciones}>
          <button
            className={styles.btnConfirmar}
            onClick={handleConfirmar}
            disabled={accionando}
          >
            {accionando ? 'Procesando...' : 'Confirmar pago'}
          </button>
          <button
            className={styles.btnCancelar}
            onClick={handleCancelar}
            disabled={accionando}
          >
            {accionando ? 'Procesando...' : 'Cancelar pedido'}
          </button>
        </div>
      )}

      {toast && (
        <div className={`${styles.toast} ${toast.error ? styles.toastError : ''}`}>
          {toast.mensaje}
        </div>
      )}
    </main>
  );
}
