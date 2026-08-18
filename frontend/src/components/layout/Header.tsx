import { Link, useNavigate } from 'react-router-dom';
import { useCarrito } from '@/components/carrito/carrito-context';
import styles from './Header.module.css';

export function Header() {
  const navigate = useNavigate();
  const { itemCount } = useCarrito();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoMarca}>T</span>
          <span className={styles.logoTexto}>Tienda de Ropa</span>
        </Link>
        <nav className={styles.nav}>
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
          <button
            type="button"
            className={styles.cartButton}
            onClick={() => navigate('/carrito')}
          >
            Carrito
            {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
          </button>
        </nav>
      </div>
    </header>
  );
}
