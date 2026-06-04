'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCarrito } from '@/components/carrito/carrito-context';
import { apiFetch } from '@/services/api-fetch';
import { formatearPrecio } from '@/lib/formatear-precio';
import styles from './CheckoutPage.module.css';

interface PedidoCreado {
  id: string;
  codigo: string;
}

const TELEFONO_URUGUAY_REGEX = /^(0[1-9]\d{6,7}|09\d{7})$/;

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
    if (!TELEFONO_URUGUAY_REGEX.test(telefono.trim())) {
      setError('El telefono debe tener formato Uruguay (ej: 099123456 o 24001234)');
      return;
    }

    setEnviando(true);

    const resultado = await apiFetch<{ pedido: PedidoCreado }>('/pedidos', {
      method: 'POST',
      body: JSON.stringify({
        emailComprador: email,
        telefonoComprador: telefono,
        items: items.map((item) => ({
          productoId: item.productoId,
          cantidad: item.cantidad,
        })),
      }),
    });

    setEnviando(false);

    if (!resultado.ok) {
      setError(resultado.error.message);
      return;
    }

    vaciar();
    router.push(`/pedidos/${resultado.value.pedido.id}`);
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
            placeholder="099123456"
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
