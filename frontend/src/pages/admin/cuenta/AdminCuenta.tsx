
import { useState, FormEvent } from 'react';
import { cambiarPassword } from '@/services/auth.service';
import styles from './page.module.css';

interface Errores {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

export default function AdminCuentaPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errores, setErrores] = useState<Errores>({});
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState<string | null>(null);

  function validar(): Errores {
    const nuevos: Errores = {};
    if (!currentPassword) nuevos.currentPassword = 'Ingresa tu contrasena actual';
    if (!newPassword) nuevos.newPassword = 'Ingresa una nueva contrasena';
    else if (newPassword.length < 8)
      nuevos.newPassword = 'La nueva contrasena debe tener al menos 8 caracteres';
    if (!confirmPassword) nuevos.confirmPassword = 'Confirma la nueva contrasena';
    else if (newPassword && confirmPassword !== newPassword)
      nuevos.confirmPassword = 'Las contrasenas no coinciden';
    if (newPassword && currentPassword && newPassword === currentPassword)
      nuevos.newPassword = 'La nueva contrasena debe ser distinta a la actual';
    return nuevos;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrores({});
    setExito(null);

    const nuevosErrores = validar();
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setCargando(true);
    try {
      const result = await cambiarPassword({ currentPassword, newPassword });
      setExito(result.mensaje);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al cambiar la contrasena';
      setErrores({ general: mensaje });
    } finally {
      setCargando(false);
    }
  }

  return (
    <section className={styles.pagina}>
      <h1 className={styles.titulo}>Mi cuenta</h1>
      <p className={styles.subtitulo}>
        Cambia la contrasena de tu cuenta de administrador.
      </p>

      <form className={styles.formulario} onSubmit={handleSubmit} noValidate>
        <div className={styles.campo}>
          <label htmlFor="currentPassword" className={styles.etiqueta}>
            Contrasena actual
          </label>
          <input
            id="currentPassword"
            type="password"
            className={styles.input}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            aria-invalid={Boolean(errores.currentPassword)}
          />
          {errores.currentPassword && (
            <p className={styles.error}>{errores.currentPassword}</p>
          )}
        </div>

        <div className={styles.campo}>
          <label htmlFor="newPassword" className={styles.etiqueta}>
            Nueva contrasena
          </label>
          <input
            id="newPassword"
            type="password"
            className={styles.input}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            aria-invalid={Boolean(errores.newPassword)}
          />
          {errores.newPassword && <p className={styles.error}>{errores.newPassword}</p>}
        </div>

        <div className={styles.campo}>
          <label htmlFor="confirmPassword" className={styles.etiqueta}>
            Confirmar nueva contrasena
          </label>
          <input
            id="confirmPassword"
            type="password"
            className={styles.input}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            aria-invalid={Boolean(errores.confirmPassword)}
          />
          {errores.confirmPassword && (
            <p className={styles.error}>{errores.confirmPassword}</p>
          )}
        </div>

        {errores.general && <p className={styles.errorGeneral}>{errores.general}</p>}
        {exito && <p className={styles.exito}>{exito}</p>}

        <button type="submit" className={styles.boton} disabled={cargando}>
          {cargando ? 'Guardando...' : 'Cambiar contrasena'}
        </button>
      </form>
    </section>
  );
}
