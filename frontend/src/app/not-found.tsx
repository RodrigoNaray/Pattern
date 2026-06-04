'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './not-found.module.css';

export default function NotFound() {
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
          <Link href="/productos" className={styles.botonPrimario}>
            Ver catalogo
          </Link>
          <Link href="/" className={styles.botonSecundario}>
            Volver al inicio
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
