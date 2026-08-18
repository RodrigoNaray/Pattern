import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { obtenerProductosActivos } from '@/services/producto.service';
import type { Producto } from '@/services/producto.service';
import TarjetaProducto from '@/components/client/tarjeta-producto';
import BarraBusqueda from '@/components/client/BarraBusqueda';
import { usePageTitle } from '@/hooks/usePageTitle';
import styles from './styles.module.css';

export default function Productos() {
  usePageTitle('Productos | Tienda de Ropa');

  const [searchParams] = useSearchParams();
  const tamano = Number(searchParams.get('tamano')) || 12;
  const pagina = Number(searchParams.get('pagina')) || 1;
  const talle = searchParams.get('talle') ?? undefined;
  const q = searchParams.get('q') ?? undefined;

  const [productos, setProductos] = useState<Producto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    setCargando(true);

    obtenerProductosActivos({ activo: true, talle, q, pagina, tamano }).then((result) => {
      if (!activo) return;
      if (result.ok) {
        setProductos(result.value.productos);
        setError(null);
      } else {
        setError(result.error.message);
      }
      setCargando(false);
    });

    return () => {
      activo = false;
    };
  }, [pagina, tamano, talle, q]);

  if (cargando) {
    return (
      <main>
        <h1 className={styles.titulo}>Productos</h1>
        <p>Cargando productos...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <h1 className={styles.titulo}>Productos</h1>
        <p className={styles.vacio}>{error}</p>
        <button type="button" onClick={() => window.location.reload()}>
          Reintentar
        </button>
      </main>
    );
  }

  const hayFiltrosActivos = Boolean(talle || q);

  if (productos.length === 0) {
    return (
      <main>
        <h1 className={styles.titulo}>Productos</h1>
        <BarraBusqueda />
        {hayFiltrosActivos ? (
          <div className={styles.estadoVacioConFiltros}>
            <p className={styles.textoVacio}>
              No encontramos productos con esos filtros.
            </p>
            <div className={styles.accionesVacias}>
              <Link to="/productos" className={styles.botonPrimario}>
                Quitar filtros
              </Link>
              <Link to="/productos" className={styles.botonSecundario}>
                Ver todo el catalogo
              </Link>
            </div>
          </div>
        ) : (
          <p className={styles.vacio}>No se encontraron productos.</p>
        )}
      </main>
    );
  }

  return (
    <main>
      <h1 className={styles.titulo}>Productos</h1>
      <BarraBusqueda />
      <section>
        <ul className={styles.grid}>
          {productos.map((producto) => (
            <li key={producto.id}>
              <TarjetaProducto
                id={producto.id}
                nombre={producto.nombre}
                talle={producto.talle}
                precioCentavos={producto.precioCentavos}
                imagenes={producto.imagenes}
                stock={producto.stock}
              />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
