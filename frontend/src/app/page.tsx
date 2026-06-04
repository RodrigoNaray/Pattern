import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <main className={styles.main}>
      <header className={styles.hero}>
        <h1 className={styles.titulo}>Tienda de Ropa</h1>
        <p className={styles.subtitulo}>
          Descubri nuestra coleccion de ropa con onda natural y paleta tierra.
        </p>
        <div className={styles.cta}>
          <Link href="/productos" className={styles.botonPrimario}>
            Ver catalogo
          </Link>
          <Link href="/pedidos" className={styles.botonSecundario}>
            Ya tengo un pedido
          </Link>
        </div>
      </header>
    </main>
  );
}
