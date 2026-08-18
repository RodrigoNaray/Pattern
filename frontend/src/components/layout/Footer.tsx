import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.columna}>
          <span className={styles.marca}>Tienda de Ropa</span>
          <p className={styles.tagline}>Moda con estilo · Uruguay</p>
        </div>

        <nav className={styles.columna} aria-label="Links del pie de pagina">
          <span className={styles.columnaTitulo}>Links</span>
          <Link to="/" className={styles.link}>
            Inicio
          </Link>
          <Link to="/productos" className={styles.link}>
            Catalogo
          </Link>
          <Link to="/sobre-nosotros" className={styles.link}>
            Sobre nosotros
          </Link>
          <Link to="/pedidos" className={styles.link}>
            Mi pedido
          </Link>
        </nav>

        <div className={styles.columna}>
          <span className={styles.columnaTitulo}>Contacto</span>
          <span className={styles.textoContacto}>
            Pagina de contacto y horarios en{' '}
            <Link to="/sobre-nosotros" className={styles.link}>
              Sobre nosotros
            </Link>
            .
          </span>
        </div>
      </div>

      <p className={styles.copyright}>
        Tienda de Ropa &mdash; Todos los derechos reservados
      </p>
    </footer>
  );
}
