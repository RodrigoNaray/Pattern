'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import NuevoProductoForm from './NuevoProductoForm';
import type { ProductoPublicado } from '../../../services/admin-producto.service';
import { listarProductosAdmin, desactivarProducto, eliminarProducto } from '../../../services/admin-producto.service';
import styles from './AdminProductosPage.module.css';
import { fadeInUp, motionConfig } from '../../../lib/animations';
import { formatearPrecio } from '../../../lib/formatear-precio';

export default function AdminProductosClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [productos, setProductos] = useState<ProductoPublicado[]>([]);
  const [productoPublicado, setProductoPublicado] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [desactivando, setDesactivando] = useState<string | null>(null);
  const [productoAConfirmar, setProductoAConfirmar] = useState<string | null>(null);
  const [productoAEliminar, setProductoAEliminar] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [errorDesactivar, setErrorDesactivar] = useState<string | null>(null);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

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

  useEffect(() => {
    if (errorDesactivar) {
      const temporizador = setTimeout(() => setErrorDesactivar(null), 5000);
      return () => clearTimeout(temporizador);
    }
  }, [errorDesactivar]);

  useEffect(() => {
    if (errorEliminar) {
      const temporizador = setTimeout(() => setErrorEliminar(null), 5000);
      return () => clearTimeout(temporizador);
    }
  }, [errorEliminar]);

  const manejarDesactivar = useCallback(async (id: string) => {
    setDesactivando(id);
    setErrorDesactivar(null);
    const resultado = await desactivarProducto(id);
    setDesactivando(null);
    setProductoAConfirmar(null);
    if (!resultado.ok) {
      setErrorDesactivar(resultado.error.message);
      return;
    }
    setProductos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, activo: false } : p)),
    );
  }, []);

  const manejarEliminar = useCallback(async (id: string) => {
    setEliminando(id);
    setErrorEliminar(null);
    const resultado = await eliminarProducto(id);
    setEliminando(null);
    setProductoAEliminar(null);
    if (!resultado.ok) {
      setErrorEliminar(resultado.error.message);
      return;
    }
    setProductos((prev) => prev.filter((p) => p.id !== id));
  }, []);

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
        {errorDesactivar && (
          <motion.div
            className={styles.bannerError}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeInUp}
            transition={motionConfig}
            role="alert"
            aria-live="assertive"
          >
            <p className={styles.textoError}>{errorDesactivar}</p>
            <button
              type="button"
              className={styles.botonCerrarError}
              onClick={() => setErrorDesactivar(null)}
              aria-label="Cerrar mensaje de error"
            >
              ✕
            </button>
          </motion.div>
        )}
        {errorEliminar && (
          <motion.div
            className={styles.bannerError}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeInUp}
            transition={motionConfig}
            role="alert"
            aria-live="assertive"
          >
            <p className={styles.textoError}>{errorEliminar}</p>
            <button
              type="button"
              className={styles.botonCerrarError}
              onClick={() => setErrorEliminar(null)}
              aria-label="Cerrar mensaje de error"
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
                  {!producto.activo && (
                    <span className={styles.badgeInactivo}>Inactivo</span>
                  )}
                </div>
                <div className={styles.accionesTarjeta}>
                  <Link
                    href={`/admin/productos/${producto.id}/editar`}
                    className={styles.enlaceEditar}
                  >
                    Editar
                  </Link>
                  {producto.activo && (
                    productoAConfirmar === producto.id ? (
                      <div className={styles.confirmacion} role="group" aria-label="Confirmar desactivación">
                        <span className={styles.textoConfirmacion}>¿Desactivar?</span>
                        <button
                          type="button"
                          className={styles.botonConfirmar}
                          onClick={() => void manejarDesactivar(producto.id)}
                          disabled={desactivando === producto.id}
                          aria-label={`Confirmar desactivación de ${producto.nombre}`}
                        >
                          {desactivando === producto.id ? '...' : 'Sí'}
                        </button>
                        <button
                          type="button"
                          className={styles.botonCancelarConfirmacion}
                          onClick={() => setProductoAConfirmar(null)}
                          disabled={desactivando === producto.id}
                          aria-label="Cancelar desactivación"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={styles.botonDesactivar}
                        onClick={() => setProductoAConfirmar(producto.id)}
                        aria-label={`Desactivar ${producto.nombre}`}
                      >
                        Desactivar
                      </button>
                    )
                  )}
                  <span className={styles.separadorAcciones} aria-hidden="true" />
                  {productoAEliminar === producto.id ? (
                    <div className={styles.confirmacion} role="group" aria-label="Confirmar eliminación">
                      <span className={styles.textoConfirmacion}>¿Eliminar?</span>
                      <button
                        type="button"
                        className={styles.botonConfirmar}
                        onClick={() => void manejarEliminar(producto.id)}
                        disabled={eliminando === producto.id}
                        aria-label={`Confirmar eliminación de ${producto.nombre}`}
                      >
                        {eliminando === producto.id ? '...' : 'Sí'}
                      </button>
                      <button
                        type="button"
                        className={styles.botonCancelarConfirmacion}
                        onClick={() => setProductoAEliminar(null)}
                        disabled={eliminando === producto.id}
                        aria-label="Cancelar eliminación"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className={styles.botonEliminar}
                      onClick={() => setProductoAEliminar(producto.id)}
                      aria-label={`Eliminar ${producto.nombre}`}
                    >
                      Eliminar
                    </button>
                  )}
                </div>
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
