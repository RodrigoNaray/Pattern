import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { obtenerProductoPorId } from '@/services/producto.service';
import type { Producto } from '@/services/producto.service';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import CarritoAgregar from '@/components/carrito/carrito-agregar';
import { usePageTitle } from '@/hooks/usePageTitle';
import styles from './ProductoDetalle.module.css';

export default function ProductoDetalle() {
  const { id } = useParams<{ id: string }>();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  usePageTitle(producto ? `${producto.nombre} | Tienda de Ropa` : 'Producto | Tienda de Ropa');

  useEffect(() => {
    if (!id) return;
    let activo = true;
    setCargando(true);

    obtenerProductoPorId(id).then((result) => {
      if (!activo) return;
      if (result.ok) {
        setProducto(result.value);
        setError(false);
      } else {
        setError(true);
      }
      setCargando(false);
    });

    return () => {
      activo = false;
    };
  }, [id]);

  if (cargando) {
    return (
      <main className={styles.error}>
        <p className={styles.errorMensaje}>Cargando producto...</p>
      </main>
    );
  }

  if (error || !producto) {
    return (
      <main className={styles.error}>
        <h1 className={styles.errorTitulo}>Producto no encontrado</h1>
        <p className={styles.errorMensaje}>
          El producto que buscas no existe o fue desactivado.
        </p>
        <Link to="/productos" className={styles.botonVolver}>
          Volver al catalogo
        </Link>
      </main>
    );
  }

  if (!producto.activo) {
    return (
      <main className={styles.error}>
        <h1 className={styles.errorTitulo}>Producto desactivado</h1>
        <p className={styles.errorMensaje}>
          Este producto ya no se encuentra disponible en nuestra tienda.
        </p>
      </main>
    );
  }

  return (
    <main className={styles.contenedor}>
      <Breadcrumbs
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Productos', href: '/productos' },
          { label: producto.nombre },
        ]}
      />
      <section className={styles.galeria}>
        <DetalleProductoImagen nombre={producto.nombre} imagenes={producto.imagenes} />
      </section>
      <section className={styles.info}>
        <DetalleProductoInfo
          nombre={producto.nombre}
          talle={producto.talle}
          precioCentavos={producto.precioCentavos}
          descripcion={producto.descripcion}
          stock={producto.stock}
          productoId={producto.id}
        />
      </section>
    </main>
  );
}

function DetalleProductoImagen({ nombre, imagenes }: { nombre: string; imagenes: string[] }) {
  const imagenPrincipal = imagenes[0] || '/placeholder.png';

  return (
    <>
      <img src={imagenPrincipal} alt={nombre} className={styles.imagenPrincipal} />
      {imagenes.length > 1 && (
        <div className={styles.thumbnails}>
          {imagenes.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`${nombre} - Vista ${index + 1}`}
              className={styles.thumbnail}
            />
          ))}
        </div>
      )}
    </>
  );
}

function DetalleProductoInfo({
  nombre,
  talle,
  precioCentavos,
  descripcion,
  stock,
  productoId,
}: {
  nombre: string;
  talle: string;
  precioCentavos: number;
  descripcion: string | null;
  stock: number;
  productoId: string;
}) {
  const precioFormateado = new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
  }).format(precioCentavos / 100);

  return (
    <div className={styles.infoContenido}>
      <h1 className={styles.nombre}>{nombre}</h1>
      <span className={styles.talle}>Talle: {talle}</span>
      <p className={styles.precio}>{precioFormateado}</p>
      <p className={stock === 0 ? styles.stockAgotado : stock <= 3 ? styles.stockBajo : styles.stock}>
        {stock === 0
          ? 'Agotado'
          : stock <= 3
            ? `Ultimas ${stock} unidades`
            : `${stock} unidades disponibles`}
      </p>
      <hr className={styles.separador} />
      <p className={styles.descripcion}>{descripcion || 'Sin descripcion disponible.'}</p>

      <CarritoAgregar productoId={productoId} stockDisponible={stock} />
    </div>
  );
}
