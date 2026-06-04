import Link from 'next/link';
import { obtenerProductosActivos } from '@/services/producto.service';
import TarjetaProducto from '@/components/client/tarjeta-producto';
import BarraBusqueda from '@/components/client/BarraBusqueda';
import Loading from './loading';
import Error from './error';
import styles from './styles.module.css';

export const metadata = {
  title: 'Productos | Tienda de Ropa',
  description: 'Catalogo completo de productos de ropa.',
};

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string; tamano?: string; talle?: string; q?: string }>;
}) {
  const params = await searchParams;
  const tamano = Number(params.tamano) || 12;
  const pagina = Number(params.pagina) || 1;

  const result = await obtenerProductosActivos({
    activo: true,
    talle: params.talle,
    q: params.q,
    pagina,
    tamano,
  });

  if (!result.ok) {
    return <Error error={result.error} />;
  }

  const { productos } = result.value;
  const hayFiltrosActivos = Boolean(params.talle || params.q);

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
              <Link href="/productos" className={styles.botonPrimario}>
                Quitar filtros
              </Link>
              <Link href="/productos" className={styles.botonSecundario}>
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
