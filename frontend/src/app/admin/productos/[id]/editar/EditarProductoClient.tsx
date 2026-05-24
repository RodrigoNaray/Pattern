'use client';

import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  obtenerProductoAdmin,
  actualizarProducto,
  type ProductoPublicado,
  type ActualizarProductoPayload,
} from '../../../../../services/admin-producto.service';
import styles from './EditarProductoClient.module.css';
import { fadeInUp, motionConfig } from '../../../../../lib/animations';

const TALLES_VALIDOS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '38', '40', '42', '44', '46'] as const;
const PRECIO_DIVISOR = 100;

interface Props {
  productoId: string;
}

interface Errores {
  nombre?: string;
  talle?: string;
  precio?: string;
  stock?: string;
}

export default function EditarProductoClient({ productoId }: Props) {
  const router = useRouter();

  // Estado de carga del producto
  const [producto, setProducto] = useState<ProductoPublicado | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  // Estado del formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [talle, setTalle] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [nuevasImagenes, setNuevasImagenes] = useState<File[]>([]);
  const [nuevasPreviews, setNuevasPreviews] = useState<string[]>([]);

  const [errores, setErrores] = useState<Errores>({});
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const inputFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void (async () => {
      const resultado = await obtenerProductoAdmin(productoId);
      if (resultado.ok) {
        const p = resultado.value;
        setProducto(p);
        setNombre(p.nombre);
        setDescripcion(p.descripcion ?? '');
        setTalle(p.talle);
        setPrecio(String(p.precioCentavos / PRECIO_DIVISOR));
        setStock(String(p.stock));
      } else {
        setErrorCarga(resultado.error.message);
      }
      setCargando(false);
    })();
  }, [productoId]);

  function validar(): Errores {
    const e: Errores = {};
    if (nombre.trim().length < 3) {
      e.nombre = 'El nombre debe tener al menos 3 caracteres';
    }
    if (!talle) {
      e.talle = 'Seleccione un talle valido';
    }
    const precioCentavos = Math.round(parseFloat(precio) * PRECIO_DIVISOR);
    if (!precio || isNaN(precioCentavos) || precioCentavos < 1) {
      e.precio = 'El precio debe ser mayor a cero';
    }
    const stockNum = parseInt(stock, 10);
    if (stock !== '' && (isNaN(stockNum) || stockNum < 0)) {
      e.stock = 'El stock debe ser un número mayor o igual a cero';
    }
    return e;
  }

  function manejarSeleccionImagenes(e: ChangeEvent<HTMLInputElement>) {
    const archivos = Array.from(e.target.files ?? []);
    if (archivos.length === 0) return;

    for (const url of nuevasPreviews) {
      URL.revokeObjectURL(url);
    }

    setNuevasImagenes(archivos);
    setNuevasPreviews(archivos.map((archivo) => URL.createObjectURL(archivo)));

    if (inputFileRef.current) {
      inputFileRef.current.value = '';
    }
  }

  async function manejarEnvio(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorGlobal(null);

    const erroresValidacion = validar();
    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion);
      return;
    }

    setEnviando(true);

    const precioCentavos = Math.round(parseFloat(precio) * PRECIO_DIVISOR);
    const stockNum = stock !== '' ? parseInt(stock, 10) : undefined;

    const payload: ActualizarProductoPayload = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || undefined,
      talle,
      precioCentavos,
      stock: stockNum,
      imagenes: nuevasImagenes.length > 0 ? nuevasImagenes : undefined,
    };

    const resultado = await actualizarProducto(productoId, payload);

    setEnviando(false);

    if (!resultado.ok) {
      setErrorGlobal(resultado.error.message);
      return;
    }

    for (const url of nuevasPreviews) {
      URL.revokeObjectURL(url);
    }

    setGuardado(true);
    setTimeout(() => {
      router.push('/admin/productos');
    }, 2000);
  }

  // --- Estados de carga / error de la petición inicial ---

  if (cargando) {
    return (
      <section className={styles.pagina}>
        <p className={styles.textoCargando}>Cargando producto...</p>
      </section>
    );
  }

  if (errorCarga || !producto) {
    return (
      <section className={styles.pagina}>
        <p className={styles.textoError}>{errorCarga ?? 'Producto no encontrado'}</p>
        <button
          type="button"
          className={styles.botonVolver}
          onClick={() => router.push('/admin/productos')}
        >
          ← Volver a productos
        </button>
      </section>
    );
  }

  // --- Formulario de edición ---

  return (
    <section className={styles.pagina}>
      <div className={styles.cabecera}>
        <h1 className={styles.tituloPagina}>Editar producto</h1>
        <button
          type="button"
          className={styles.botonVolver}
          onClick={() => router.push('/admin/productos')}
          disabled={enviando}
        >
          ← Volver
        </button>
      </div>

      <AnimatePresence>
        {guardado && (
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
            <p className={styles.textoExito}>Producto actualizado exitosamente</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={manejarEnvio} noValidate className={styles.formulario}>
        {errorGlobal && (
          <p className={styles.errorGlobal} role="alert">
            {errorGlobal}
          </p>
        )}

        {/* Nombre */}
        <div className={styles.campo}>
          <label htmlFor="nombre" className={styles.etiqueta}>
            Nombre<span className={styles.requerido}>*</span>
          </label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              if (errores.nombre) setErrores((p) => ({ ...p, nombre: undefined }));
            }}
            className={`${styles.input} ${errores.nombre ? styles.inputError : ''}`}
            disabled={enviando}
            aria-describedby={errores.nombre ? 'error-nombre' : undefined}
          />
          {errores.nombre && (
            <p id="error-nombre" className={styles.mensajeError} role="alert">
              {errores.nombre}
            </p>
          )}
        </div>

        {/* Descripción */}
        <div className={styles.campo}>
          <label htmlFor="descripcion" className={styles.etiqueta}>
            Descripción
          </label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className={styles.textarea}
            disabled={enviando}
            rows={3}
          />
        </div>

        {/* Talle */}
        <div className={styles.campo}>
          <label htmlFor="talle" className={styles.etiqueta}>
            Talle<span className={styles.requerido}>*</span>
          </label>
          <select
            id="talle"
            value={talle}
            onChange={(e) => {
              setTalle(e.target.value);
              if (errores.talle) setErrores((p) => ({ ...p, talle: undefined }));
            }}
            className={`${styles.select} ${errores.talle ? styles.inputError : ''}`}
            disabled={enviando}
            aria-describedby={errores.talle ? 'error-talle' : undefined}
          >
            <option value="">Seleccionar talle</option>
            {TALLES_VALIDOS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errores.talle && (
            <p id="error-talle" className={styles.mensajeError} role="alert">
              {errores.talle}
            </p>
          )}
        </div>

        {/* Precio y Stock en fila */}
        <div className={styles.filaDosColumnas}>
          <div className={styles.campo}>
            <label htmlFor="precio" className={styles.etiqueta}>
              Precio (ARS)<span className={styles.requerido}>*</span>
            </label>
            <input
              id="precio"
              type="number"
              min="0.01"
              step="0.01"
              value={precio}
              onChange={(e) => {
                setPrecio(e.target.value);
                if (errores.precio) setErrores((p) => ({ ...p, precio: undefined }));
              }}
              className={`${styles.input} ${errores.precio ? styles.inputError : ''}`}
              disabled={enviando}
              aria-describedby={errores.precio ? 'error-precio' : undefined}
            />
            {errores.precio && (
              <p id="error-precio" className={styles.mensajeError} role="alert">
                {errores.precio}
              </p>
            )}
          </div>

          <div className={styles.campo}>
            <label htmlFor="stock" className={styles.etiqueta}>
              Stock
            </label>
            <input
              id="stock"
              type="number"
              min="0"
              step="1"
              value={stock}
              onChange={(e) => {
                setStock(e.target.value);
                if (errores.stock) setErrores((p) => ({ ...p, stock: undefined }));
              }}
              className={`${styles.input} ${errores.stock ? styles.inputError : ''}`}
              disabled={enviando}
              aria-describedby={errores.stock ? 'error-stock' : undefined}
            />
            {errores.stock && (
              <p id="error-stock" className={styles.mensajeError} role="alert">
                {errores.stock}
              </p>
            )}
          </div>
        </div>

        {/* Imágenes */}
        <div className={styles.campo}>
          <span className={styles.etiqueta}>Imágenes</span>
          <p className={styles.ayudaImagenes}>
            El producto tiene {producto.imagenes.length} imagen(es). Selecciona nuevas imágenes
            para reemplazarlas, o deja vacío para conservar las actuales.
          </p>

          {producto.imagenes.length > 0 && nuevasImagenes.length === 0 && (
            <div className={styles.imagenesActuales} aria-label="Imágenes actuales del producto">
              {producto.imagenes.map((url, i) => (
                <div key={url} className={styles.imagenActual}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Imagen actual ${i + 1}`}
                    className={styles.imagenActualImg}
                  />
                </div>
              ))}
            </div>
          )}

          <label htmlFor="imagenes" className={styles.zonaImagenes}>
            <p className={styles.textoZonaImagenes}>JPG, PNG o WebP — máx. 5 MB por imagen</p>
            <p className={styles.textoZonaImagenesAccion}>
              {nuevasImagenes.length > 0
                ? `${nuevasImagenes.length} imagen(es) nueva(s) seleccionada(s)`
                : 'Seleccionar imágenes nuevas'}
            </p>
            <input
              ref={inputFileRef}
              id="imagenes"
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              multiple
              onChange={manejarSeleccionImagenes}
              className={styles.inputFile}
              disabled={enviando}
            />
          </label>

          {nuevasPreviews.length > 0 && (
            <div className={styles.listaImagenes} aria-label="Nuevas imágenes seleccionadas">
              {nuevasPreviews.map((src, i) => (
                <div key={src} className={styles.imagenPreview}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`Nueva imagen ${i + 1}`}
                    className={styles.imagenPreviewImg}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className={styles.acciones}>
          <button
            type="button"
            className={styles.botonCancelar}
            onClick={() => router.push('/admin/productos')}
            disabled={enviando}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={styles.botonGuardar}
            disabled={enviando || guardado}
          >
            {enviando ? 'Guardando...' : guardado ? 'Guardado ✓' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </section>
  );
}
