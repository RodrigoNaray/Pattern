import styles from './CarritoTotal.module.css';
import { formatearNumero } from '@/lib/formatear-precio';

interface CarritoTotalProps {
  totalCentavos: number;
  hayStockInsuficiente?: boolean;
  onCheckout: () => void;
}

export function CarritoTotal({ totalCentavos, hayStockInsuficiente, onCheckout }: CarritoTotalProps) {
  return (
    <div className={styles.carritoTotalContainer}>
      <div>
        <span className={styles.totalLabel}>Total</span>
        <span className={styles.totalValor}>{formatearNumero(totalCentavos)}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', alignItems: 'flex-end' }}>
        {hayStockInsuficiente && (
          <span className={styles.alertaStock}>
            Algunos items tienen stock insuficiente
          </span>
        )}
        <button
          type="button"
          className={styles.botonContinuar}
          onClick={onCheckout}
        >
          Crear pedido
        </button>
      </div>
    </div>
  );
}
