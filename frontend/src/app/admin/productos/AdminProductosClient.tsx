'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import NuevoProductoForm from './NuevoProductoForm';
import ModalConfirmacion from '@/components/admin/ModalConfirmacion';
import type { ProductoPublicado } from '../../../services/admin-producto.service';
import { listarProductosAdmin, desactivarProducto, eliminarProducto } from '../../../services/admin-producto.service';
import styles from './AdminProductosPage.module.css';
import { fadeInUp, motionConfig } from '../../../lib/animations';
import { formatearPrecio } from '../../../lib/formatear-precio';

type AccionProducto = 'desactivar' | 'eliminar';

export default function AdminProductosClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [productos, setProductos] = useState<ProductoPublicado[]>([]);
  const [productoPublicado, setProductoPublicado] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [accionando, setAccionando] = useState<AccionProducto | null>(null);
  const [productoAccion, setProductoAccion] = useState<{ id: string; accion: AccionProducto } | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

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
    if (errorAccion) {
      const temporizador = setTimeout(() => setErrorAccion(null), 5000);
      return () => clearTimeout(temporizador);
    }
  }, [errorAccion]);

  const manejarConfirmar = useCallback(async () => {
    if (!productoAccion) return;
    const { id, accion } = productoAccion;
    setAccionando(accion);
    setErrorAccion(null);

    if (accion === 'desactivar') {
      const resultado = await desactivarProducto(id);
      if (!resultado.ok) {
        setErrorAccion(resultado.error.message);
      } else {
        setProductos((prev) => prev.map((p) => (p.id === id ? { ...p, activo: false } : p)));
      }
    } else {
      const resultado = await eliminarProducto(id);
      if (!resultado.ok) {
        setErrorAccion(resultado.error.message);
      } else {
        setProductos((prev) => prev.filter((p) => p.id !== id));
      }
    }

    setAccionando(null);
    setProductoAccion(null);
  }, [productoAccion]);

  const productoEnModal = productoAccion
    ? productos.find((p) => p.id === productoAccion.id) ?? null
    : null;

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
        {errorAccion && (
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
            <p className={styles.textoError}>{errorAccion}</p>
            <button
              type="button"
              className={styles.botonCerrarError}
              onClick={() => setErrorAccion(null)}
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
                  {producto.stock === 0 && (
                    <span className={styles.badgeAgotado}>Agotado</span>
                  )}
                  {producto.stock > 0 && producto.stock <= 3 && (
                    <span className={styles.badgeStockBajo}>Stock bajo: {producto.stock}</span>
                  )}
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
                    <button
                      type="button"
                      className={styles.botonDesactivar}
                      onClick={() => setProductoAccion({ id: producto.id, accion: 'desactivar' })}
                      aria-label={`Desactivar ${producto.nombre}`}
                    >
                      Desactivar
                    </button>
                  )}
                  <span className={styles.separadorAcciones} aria-hidden="true" />
                  <button
                    type="button"
                    className={styles.botonEliminar}
                    onClick={() => setProductoAccion({ id: producto.id, accion: 'eliminar' })}
                    aria-label={`Eliminar ${producto.nombre}`}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {mostrarFormulario && (
        <NuevoProductoForm onCancelar={cerrarFormulario} onPublicado={manejarProductoPublicado} />
      )}

      <ModalConfirmacion
        open={Boolean(productoAccion && productoEnModal)}
        titulo={
          productoAccion?.accion === 'desactivar'
            ? 'Desactivar producto'
            : 'Eliminar producto'
        }
        mensaje={
          productoAccion?.accion === 'desactivar'
            ? `¿Desactivar "${productoEnModal?.nombre}"? No se mostrara en el catalogo publico, pero seguira visible en el admin.`
            : `¿Eliminar "${productoEnModal?.nombre}"? Esta accion es permanente y no se puede deshacer.`
        }
        textoConfirmar={
          productoAccion?.accion === 'desactivar' ? 'Si, desactivar' : 'Si, eliminar'
        }
        textoCancelar="Cancelar"
        peligroso={productoAccion?.accion === 'eliminar'}
        onConfirmar={() => void manejarConfirmar()}
        onCancelar={() => setProductoAccion(null)}
      />
    </section>
  );
}
