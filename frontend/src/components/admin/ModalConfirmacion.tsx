
import { useEffect, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ModalConfirmacion.module.css';

interface ModalConfirmacionProps {
  open: boolean;
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  peligroso?: boolean;
  children?: ReactNode;
  onConfirmar: () => void | Promise<void>;
  onCancelar: () => void;
}

export default function ModalConfirmacion({
  open,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  peligroso = false,
  children,
  onConfirmar,
  onCancelar,
}: ModalConfirmacionProps) {
  const cancelarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancelar();
    };
    document.addEventListener('keydown', handleEsc);
    cancelarRef.current?.focus();
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, onCancelar]);

  async function manejarConfirmar() {
    await onConfirmar();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.overlay}
          onClick={onCancelar}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          role="presentation"
        >
          <motion.div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="modal-titulo"
            aria-describedby="modal-mensaje"
          >
            <h2 id="modal-titulo" className={styles.titulo}>
              {titulo}
            </h2>
            <p id="modal-mensaje" className={styles.mensaje}>
              {mensaje}
            </p>
            {children && <div className={styles.contenido}>{children}</div>}
            <div className={styles.acciones}>
              <button
                ref={cancelarRef}
                type="button"
                className={styles.botonCancelar}
                onClick={onCancelar}
              >
                {textoCancelar}
              </button>
              <button
                type="button"
                className={peligroso ? styles.botonPeligroso : styles.botonConfirmar}
                onClick={manejarConfirmar}
              >
                {textoConfirmar}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
