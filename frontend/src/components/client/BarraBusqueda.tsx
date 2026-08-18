import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './BarraBusqueda.module.css';

export default function BarraBusqueda() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') ?? '');

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const termino = q.trim();
    const params = new URLSearchParams(searchParams.toString());
    if (termino) {
      params.set('q', termino);
    } else {
      params.delete('q');
    }
    params.set('pagina', '1');
    navigate(`/productos${params.toString() ? `?${params.toString()}` : ''}`);
  }

  function handleLimpiar() {
    setQ('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    params.set('pagina', '1');
    navigate(`/productos${params.toString() ? `?${params.toString()}` : ''}`);
  }

  return (
    <form className={styles.formulario} onSubmit={handleSubmit} role="search">
      <label htmlFor="buscar" className={styles.srOnly}>
        Buscar productos
      </label>
      <input
        id="buscar"
        type="search"
        className={styles.input}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por nombre..."
      />
      {q && (
        <button
          type="button"
          className={styles.botonLimpiar}
          onClick={handleLimpiar}
          aria-label="Limpiar busqueda"
        >
          ✕
        </button>
      )}
      <button type="submit" className={styles.botonBuscar}>
        Buscar
      </button>
    </form>
  );
}
