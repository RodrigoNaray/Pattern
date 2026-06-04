'use client';

import { useState, useRef, type ChangeEvent, type FormEvent } from 'react';
import { publicarProducto } from '../../../services/admin-producto.service';
import type { ProductoPublicado } from '../../../services/admin-producto.service';
import styles from './NuevoProductoForm.module.css';

const TALLES_VALIDOS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '38', '40', '42', '44', '46'] as const;

interface Errores {
  nombre?: string;
  talle?: string;
  precio?: string;
  imagenes?: string;
}

interface NuevoProductoFormProps {
  onCancelar: () => void;
  onPublicado: (producto: ProductoPublicado) => void;
}

export default function NuevoProductoForm({ onCancelar, onPublicado }: NuevoProductoFormProps) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [talle, setTalle] = useState('');
  const [precio, setPrecio] = useState('');
  const [imagenes, setImagenes] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [errores, setErrores] = useState<Errores>({});
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const inputFileRef = useRef<HTMLInputElement>(null);

  function validar(): Errores {
    const e: Errores = {};

    if (nombre.trim().length < 3) {
      e.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    if (!talle) {
      e.talle = 'Seleccione un talle valido';
    }

    const precioCentavos = Math.round(parseFloat(precio) * 100);
    if (!precio || isNaN(precioCentavos) || precioCentavos < 1) {
      e.precio = 'El precio debe ser mayor a cero';
    }

    if (imagenes.length === 0) {
      e.imagenes = 'Seleccione al menos una imagen valida';
    }

    return e;
  }

  function manejarSeleccionImagenes(e: ChangeEvent<HTMLInputElement>) {
    const archivos = Array.from(e.target.files ?? []);
    if (archivos.length === 0) return;

    const nuevasImagenes = [...imagenes, ...archivos];
    setImagenes(nuevasImagenes);

    const nuevasPreviews = archivos.map((archivo) => URL.createObjectURL(archivo));
    setPreviews((prev) => [...prev, ...nuevasPreviews]);

    if (errores.imagenes) {
      setErrores((prev) => ({ ...prev, imagenes: undefined }));
    }

    if (inputFileRef.current) {
      inputFileRef.current.value = '';
    }
  }

  function eliminarImagen(indice: number) {
    setImagenes((prev) => prev.filter((_, i) => i !== indice));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[indice] ?? '');
      return prev.filter((_, i) => i !== indice);
    });
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

    const precioCentavos = Math.round(parseFloat(precio) * 100);

    const resultado = await publicarProducto({
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || undefined,
      talle,
      precioCentavos,
      imagenes,
    });

    setEnviando(false);

    if (!resultado.ok) {
      setErrorGlobal(resultado.error.message);
      return;
    }

    for (const url of previews) {
      URL.revokeObjectURL(url);
    }

    onPublicado(resultado.value.producto);
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="titulo-form">
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2 id="titulo-form" className={styles.titulo}>Nuevo producto</h2>
          <button
            type="button"
            className={styles.botonCerrar}
            onClick={onCancelar}
            aria-label="Cerrar formulario"
            disabled={enviando}
          >
            ✕
          </button>
        </div>

        <form onSubmit={manejarEnvio} noValidate className={styles.formulario}>
          {errorGlobal && (
            <p className={styles.errorGlobal} role="alert">
              {errorGlobal}
            </p>
          )}

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
              placeholder="Ej: Remera Algodón"
              disabled={enviando}
              aria-describedby={errores.nombre ? 'error-nombre' : undefined}
            />
            {errores.nombre && (
              <p id="error-nombre" className={styles.mensajeError} role="alert">
                {errores.nombre}
              </p>
            )}
          </div>

          <div className={styles.campo}>
            <label htmlFor="descripcion" className={styles.etiqueta}>
              Descripción
            </label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className={styles.textarea}
              placeholder="Descripción opcional del producto"
              disabled={enviando}
              rows={3}
            />
          </div>

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

          <div className={styles.campo}>
            <label htmlFor="precio" className={styles.etiqueta}>
              Precio (UYU)<span className={styles.requerido}>*</span>
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
              placeholder="Ej: 150.00"
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
            <span className={styles.etiqueta}>
              Imágenes<span className={styles.requerido}>*</span>
            </span>

            <label
              htmlFor="imagenes"
              className={`${styles.zonaImagenes} ${errores.imagenes ? styles.zonaImagenesError : ''}`}
              aria-describedby={errores.imagenes ? 'error-imagenes' : undefined}
            >
              <p className={styles.textoZonaImagenes}>JPG, PNG o WebP — máx. 5 MB por imagen</p>
              <p className={styles.textoZonaImagenesAccion}>Seleccionar archivos</p>
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

            {errores.imagenes && (
              <p id="error-imagenes" className={styles.mensajeError} role="alert">
                {errores.imagenes}
              </p>
            )}

            {previews.length > 0 && (
              <div className={styles.listaImagenes} aria-label="Imágenes seleccionadas">
                {previews.map((src, i) => (
                  <div key={src} className={styles.imagenPreview}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Vista previa ${i + 1}`}
                      className={styles.imagenPreviewImg}
                    />
                    <button
                      type="button"
                      className={styles.botonEliminarImagen}
                      onClick={() => eliminarImagen(i)}
                      aria-label={`Eliminar imagen ${i + 1}`}
                      disabled={enviando}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.acciones}>
            <button
              type="button"
              className={styles.botonCancelar}
              onClick={onCancelar}
              disabled={enviando}
            >
              Cancelar
            </button>
            <button type="submit" className={styles.botonPublicar} disabled={enviando}>
              {enviando ? 'Publicando...' : 'Publicar producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
