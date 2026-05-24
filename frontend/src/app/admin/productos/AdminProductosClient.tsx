'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import NuevoProductoForm from './NuevoProductoForm';
import type { ProductoPublicado } from '../../../services/admin-producto.service';
import { listarProductosAdmin } from '../../../services/admin-producto.service';
import styles from './AdminProductosPage.module.css';
import { fadeInUp, motionConfig } from '../../../lib/animations';

const PRECIO_DIVISOR = 100;

function formatearPrecio(centavos: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(centavos / PRECIO_DIVISOR);
}

export default function AdminProductosClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [productos, setProductos] = useState<ProductoPublicado[]>([]);
  const [productoPublicado, setProductoPublicado] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  const mostrarFormulario = searchParams.get('accion') === 'nuevo';

  const abrirFormulario = useCallback(() => {
    router.push('/admin/productos?accion=nuevo');
  }, [router]);

  const cerrarFormulario = useCallback(() => {
    router.push('/admin/productos');
  }, [router]);

  const manejarProductoPublicado = useCallback(
    (producto: ProductoPublicado) => {
      setProductos((prev) => [producto, ...prev]);
      setProductoPublicado(producto.nombre);
      router.push('/admin/productos');
    },
    [router],
  );

  useEffect(() => {
    void (async () => {
      const resultado = await listarProductosAdmin();
      if (resultado.ok) {
        setProductos(resultado.value.productos);
      }
      setCargando(false);
    })();
  }, []);

  useEffect(() => {
    if (productoPublicado) {
      const temporizador = setTimeout(() => setProductoPublicado(null), 5000);
      return () => clearTimeout(temporizador);
    }
  }, [productoPublicado]);

  return (
    <section className={styles.pagina}>
      <div className={styles.cabecera}>
        <h1 className={styles.tituloPagina}>Gestión de Productos</h1>
        <button type="button" className={styles.botonNuevo} onClick={abrirFormulario}>
          Nuevo producto
        </button>
      </div>

      <AnimatePresence>
        {productoPublicado && (
          <motion.div
            className={styles.bannerExito}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeInUp}
            transition={motionConfig}
            role="status"
            aria-live="polite"
          >
            <p className={styles.textoExito}>
              &ldquo;{productoPublicado}&rdquo; publicado exitosamente
            </p>
            <button
              type="button"
              className={styles.botonCerrarExito}
              onClick={() => setProductoPublicado(null)}
              aria-label="Cerrar mensaje de éxito"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {cargando ? (
        <p className={styles.textoCargando}>Cargando productos...</p>
      ) : productos.length === 0 ? (
        <div className={styles.estadoVacio}>
          <p className={styles.textoVacio}>Aún no hay productos publicados.</p>
          <button type="button" className={styles.botonNuevo} onClick={abrirFormulario}>
            Publicar primer producto
          </button>
        </div>
      ) : (
        <ul className={styles.listaProductos} aria-label="Productos publicados">
          {productos.map((producto) => (
            <li key={producto.id} className={styles.tarjetaProducto}>
              {producto.imagenes[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={producto.imagenes[0]}
                  alt={producto.nombre}
                  className={styles.imagenTarjeta}
                />
              ) : (
                <div className={styles.imagenPlaceholder} aria-hidden="true">
                  <span className={styles.iconoImagen}>◻</span>
                </div>
              )}
              <div className={styles.cuerpoTarjeta}>
                <p className={styles.nombreProducto}>{producto.nombre}</p>
                <div className={styles.metaProducto}>
                  <span className={styles.talleTag}>{producto.talle}</span>
                  <span className={styles.precioProducto}>
                    {formatearPrecio(producto.precioCentavos)}
                  </span>
                </div>
                <Link
                  href={`/admin/productos/${producto.id}/editar`}
                  className={styles.enlaceEditar}
                >
                  Editar
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      {mostrarFormulario && (
        <NuevoProductoForm onCancelar={cerrarFormulario} onPublicado={manejarProductoPublicado} />
      )}
    </section>
  );
}
