'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CarritoItemCard } from '@/components/carrito/CarritoItemCard';
import { CarritoTotal } from '@/components/carrito/CarritoTotal';
import { CarritoEmpty } from '@/components/carrito/CarritoEmpty';
import { useCarrito } from '@/components/carrito/carrito-context';
import { validarCarrito } from '@/services/carrito.service';
import styles from './CarritoPage.module.css';
import { motionConfig, fadeInUp } from '@/lib/animations';

interface ItemConStock {
  productoId: string;
  nombre: string;
  talle: string;
  precioCentavos: number;
  cantidad: number;
  subtotalCentavos: number;
  stockDisponible: number;
  stockInsuficiente?: boolean;
}

export default function CarritoPage() {
  const router = useRouter();
  const { items, totalCentavos: contextoTotal, actualizarCantidad: actualizarEnContexto, eliminarItem: eliminarEnContexto } = useCarrito();
  const [validatedItems, setValidatedItems] = useState<ItemConStock[]>([]);
  const [totalCentavos, setTotalCentavos] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hayStockInsuficiente, setHayStockInsuficiente] = useState(false);

  useEffect(() => {
    if (items.length > 0) {
      validarItems();
    }
  }, [items]);

  const validarItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    const itemsParaApi = items.map((i) => ({
      productoId: i.productoId,
      nombre: i.nombre ?? '',
      talle: i.talle,
      precioCentavos: i.precioCentavos ?? 0,
      cantidad: i.cantidad,
      subtotalCentavos: i.precioCentavos ? i.precioCentavos * i.cantidad : 0,
    }));

    const resultado = await validarCarrito(itemsParaApi);

    if (resultado.ok) {
      setValidatedItems(
        resultado.value.items.map((item) => ({
          productoId: item.productoId,
          nombre: item.nombre,
          talle: item.talle,
          precioCentavos: item.precioCentavos,
          cantidad: item.cantidad,
          subtotalCentavos: item.subtotalCentavos,
          stockDisponible: item.stockDisponible,
          stockInsuficiente: item.stockInsuficiente,
        })),
      );
      setTotalCentavos(resultado.value.totalCentavos);
      setHayStockInsuficiente(resultado.value.hayStockInsuficiente ?? false);
    } else {
      setError(resultado.error.message);
    }

    setLoading(false);
  }, [items]);

  const manejarActualizarCantidad = useCallback(
    (productoId: string, nuevaCantidad: number) => {
      actualizarEnContexto(productoId, nuevaCantidad);
    },
    [actualizarEnContexto],
  );

  const manejarEliminarItem = useCallback(
    (productoId: string) => {
      eliminarEnContexto(productoId);
    },
    [eliminarEnContexto],
  );

  const crearPedido = useCallback(() => {
    router.push('/carrito/checkout');
  }, [router]);

  if (items.length === 0) {
    return (
      <main className={styles.paginaPrincipal}>
        <CarritoEmpty />
      </main>
    );
  }

  return (
    <main className={styles.paginaPrincipal}>
      <div className={styles.contenido}>
        <motion.h1
          className={styles.titulo}
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={motionConfig}
        >
          Tu carrito
        </motion.h1>

        {loading && <span className={styles.cargando}>Validando productos...</span>}

        {error && (
          <div className={styles.errorContainer}>
            <p className={styles.errorTexto}>{error}</p>
            <button
              type="button"
              className={styles.botonReintentar}
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </div>
        )}

        <div className={styles.listaContenido}>
          <div className={styles.lista}>
            {validatedItems.length > 0 &&
              validatedItems.map((item) => (
                <motion.div
                  key={item.productoId}
                  initial="hidden"
                  animate="visible"
                  variants={fadeInUp}
                  transition={motionConfig}
                >
                  <CarritoItemCard
                    item={{
                      productoId: item.productoId,
                      nombre: item.nombre,
                      talle: item.talle,
                      precioCentavos: item.precioCentavos,
                      cantidad: item.cantidad,
                      subtotalCentavos: item.subtotalCentavos,
                    }}
                    onUpdateQuantity={(cantidad) => manejarActualizarCantidad(item.productoId, cantidad)}
                    onRemove={() => manejarEliminarItem(item.productoId)}
                    stockDisponible={item.stockDisponible}
                  />
                </motion.div>
              ))}
          </div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ ...motionConfig, delay: 0.1 }}
          >
            <CarritoTotal
              totalCentavos={totalCentavos}
              hayStockInsuficiente={hayStockInsuficiente}
              onCheckout={crearPedido}
            />
          </motion.div>
        </div>
      </div>
    </main>
  );
}