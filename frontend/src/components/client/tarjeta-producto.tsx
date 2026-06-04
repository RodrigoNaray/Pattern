import Image from 'next/image';
import Link from 'next/link';
import styles from './tarjeta-producto.module.css';
import { formatearPrecio } from '@/lib/formatear-precio';

interface TarjetaProductoProps {
  id: string;
  nombre: string;
  talle: string;
  precioCentavos: number;
  imagenes: string[];
  stock: number;
}

const STOCK_BAJO_UMBRAL = 3;

export default function TarjetaProducto({ id, nombre, talle, precioCentavos, imagenes, stock }: TarjetaProductoProps) {
  const precioFormateado = formatearPrecio(precioCentavos);
  const agotado = stock === 0;
  const stockBajo = !agotado && stock <= STOCK_BAJO_UMBRAL;

  return (
    <Link href={`/productos/${id}`} className={styles.container}>
      <div className={styles.imageWrapper}>
        <Image
          src={imagenes[0] || '/placeholder.png'}
          alt={nombre}
          fill
          className={styles.imagen}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="eager"
        />
        {agotado && (
          <span className={styles.badgeAgotado} aria-label="Producto agotado">
            Agotado
          </span>
        )}
        {stockBajo && (
          <span className={styles.badgeStockBajo} aria-label={`Ultimas ${stock} unidades`}>
            Ultimas {stock}
          </span>
        )}
      </div>
      <div className={styles.contenido}>
        <h3 className={styles.nombre}>{nombre}</h3>
        <span className={styles.talle}>Talle: {talle}</span>
        <p className={styles.precio}>{precioFormateado}</p>
      </div>
    </Link>
  );
}
