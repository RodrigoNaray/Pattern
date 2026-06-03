'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCarrito } from '@/components/carrito/carrito-context';
import styles from './CheckoutPage.module.css';

interface PedidoCreado {
  id: string;
  codigo: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function formatearPrecio(centavos: number): string {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
  }).format(centavos / 100);
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalCentavos, vaciar } = useCarrito();
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      router.replace('/productos');
    }
  }, [items, router]);

  function validarEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!validarEmail(email)) {
      setError('El email no tiene un formato valido');
      return;
    }
    if (!telefono.trim()) {
      setError('El telefono es obligatorio');
      return;
    }

    setEnviando(true);

    try {
      const response = await fetch(`${API_BASE_URL}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailComprador: email,
          telefonoComprador: telefono,
          items: items.map((item) => ({
            productoId: item.productoId,
            cantidad: item.cantidad,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al crear el pedido');
      }

      const data: { pedido: PedidoCreado } = await response.json();
      vaciar();
      router.push(`/pedidos/${data.pedido.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrio un error inesperado');
    } finally {
      setEnviando(false);
    }
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.titulo}>Finalizar Pedido</h1>

      <section className={styles.resumen}>
        <h2 className={styles.subtitulo}>Resumen del carrito</h2>
        <ul className={styles.listaItems}>
          {items.map((item) => (
            <li key={item.productoId} className={styles.item}>
              <span>{item.nombre} (Talle: {item.talle})</span>
              <span>
                {item.cantidad} x {formatearPrecio(item.precioCentavos ?? 0)}
              </span>
            </li>
          ))}
        </ul>
        <div className={styles.total}>
          <strong>Total:</strong>
          <span>{formatearPrecio(totalCentavos)}</span>
        </div>
      </section>

      <form className={styles.formulario} onSubmit={handleSubmit}>
        <h2 className={styles.subtitulo}>Datos de contacto</h2>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.campo}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={enviando}
            placeholder="tu@email.com"
          />
        </div>

        <div className={styles.campo}>
          <label htmlFor="telefono">Telefono</label>
          <input
            id="telefono"
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            required
            disabled={enviando}
            placeholder="09XX XXX XXX"
          />
        </div>

        <button
          type="submit"
          className={styles.boton}
          disabled={enviando}
        >
          {enviando ? 'Creando pedido...' : 'Crear pedido'}
        </button>
      </form>
    </main>
  );
}
