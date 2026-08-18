import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePageTitle } from '@/hooks/usePageTitle';
import styles from './NotFound.module.css';

export default function NotFound() {
  usePageTitle('Pagina no encontrada | Tienda de Ropa');

  return (
    <main className={styles.contenedor}>
      <motion.div
        className={styles.contenido}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <p className={styles.codigo}>404</p>
        <h1 className={styles.titulo}>Pagina no encontrada</h1>
        <p className={styles.mensaje}>
          La pagina que buscas no existe o fue movida.
        </p>
        <div className={styles.acciones}>
          <Link to="/productos" className={styles.botonPrimario}>
            Ver catalogo
          </Link>
          <Link to="/" className={styles.botonSecundario}>
            Volver al inicio
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
