'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { pedidoAdminService } from '@/services/pedido-admin.service';
import styles from './Pedidos.module.css';

interface PedidoPendiente {
  id: string;
  codigo: string;
  emailComprador: string;
  telefonoComprador: string;
  totalCentavos: number;
  creadoEn: string;
  vencidoEn: string;
  itemsCount: number;
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

export default function AdminPedidosPage() {
  const [pedidos, setPedidos] = useState<PedidoPendiente[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tamano = 20;

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await pedidoAdminService.listarPendientes(pagina, tamano);
      setPedidos(data.pedidos);
      setTotal(data.total);
    } catch {
      setError('Error al cargar pedidos');
    } finally {
      setCargando(false);
    }
  }, [pagina]);

  useEffect(() => { cargar(); }, [cargar]);

  const totalPaginas = Math.max(1, Math.ceil(total / tamano));

  return (
    <main className={styles.container}>
      <h1 className={styles.titulo}>Pedidos</h1>

      {error && <p className={styles.error}>{error}</p>}

      {cargando ? (
        <p className={styles.cargando}>Cargando pedidos...</p>
      ) : pedidos.length === 0 ? (
        <p className={styles.vacio}>No hay pedidos pendientes</p>
      ) : (
        <>
          <div className={styles.lista}>
            {pedidos.map((p) => (
              <Link key={p.id} href={`/admin/pedidos/${p.id}`} className={styles.card}>
                <div className={styles.cardInfo}>
                  <span className={styles.cardCodigo}>{p.codigo}</span>
                  <span className={styles.cardMeta}>
                    {p.emailComprador} &middot; {p.telefonoComprador}
                  </span>
                  <span className={styles.cardMeta}>
                    {p.itemsCount} producto{p.itemsCount !== 1 ? 's' : ''} &middot; {formatDate(p.creadoEn)}
                  </span>
                </div>
                <span className={styles.cardTotal}>{formatCurrency(p.totalCentavos)}</span>
              </Link>
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className={styles.paginacion}>
              <button
                className={styles.pagBtn}
                disabled={pagina <= 1}
                onClick={() => setPagina((p) => p - 1)}
              >
                Anterior
              </button>
              <span className={styles.pagInfo}>
                Página {pagina} de {totalPaginas} ({total} pedidos)
              </span>
              <button
                className={styles.pagBtn}
                disabled={pagina >= totalPaginas}
                onClick={() => setPagina((p) => p + 1)}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
