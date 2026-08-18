import { Link } from 'react-router-dom';
import { usePageTitle } from '@/hooks/usePageTitle';
import styles from './Home.module.css';

export default function Home() {
  usePageTitle('Tienda de Ropa');

  return (
    <main className={styles.main}>
      <header className={styles.hero}>
        <h1 className={styles.titulo}>Tienda de Ropa</h1>
        <p className={styles.subtitulo}>
          Descubri nuestra coleccion de ropa con onda natural y paleta tierra.
        </p>
        <div className={styles.cta}>
          <Link to="/productos" className={styles.botonPrimario}>
            Ver catalogo
          </Link>
          <Link to="/pedidos" className={styles.botonSecundario}>
            Ya tengo un pedido
          </Link>
        </div>
      </header>
    </main>
  );
}
