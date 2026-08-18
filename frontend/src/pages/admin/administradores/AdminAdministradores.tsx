
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ModalConfirmacion from '@/components/admin/ModalConfirmacion';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import styles from './AdminAdmins.module.css';
import {
  listarAdministradores,
  crearAdministrador,
  eliminarAdministrador,
  resetearPassword,
} from '@/services/administrador.service';
import type { Administrador } from '@/services/administrador.service';

const fadeInUp = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
};

export default function AdminAdministradoresPage() {
  const [admins, setAdmins] = useState<Administrador[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [adminEliminar, setAdminEliminar] = useState<Administrador | null>(null);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  const [adminResetear, setAdminResetear] = useState<Administrador | null>(null);
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [reseteando, setReseteando] = useState(false);
  const [errorReset, setErrorReset] = useState<string | null>(null);

  const cargarAdmins = useCallback(async () => {
    setCargando(true);
    const result = await listarAdministradores();
    if (result.ok) {
      setAdmins(result.value);
    }
    setCargando(false);
  }, []);

  useEffect(() => { cargarAdmins(); }, [cargarAdmins]);

  useEffect(() => {
    if (exito) {
      const t = setTimeout(() => setExito(null), 5000);
      return () => clearTimeout(t);
    }
  }, [exito]);

  useEffect(() => {
    if (errorEliminar) {
      const t = setTimeout(() => setErrorEliminar(null), 5000);
      return () => clearTimeout(t);
    }
  }, [errorEliminar]);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreando(true);
    const result = await crearAdministrador({ nombre, email, password });
    setCreando(false);

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    setAdmins((prev) => [...prev, result.value]);
    setExito(`Administrador "${result.value.nombre}" creado exitosamente`);
    setMostrarFormulario(false);
    setNombre('');
    setEmail('');
    setPassword('');
  };

  const handleEliminar = async () => {
    if (!adminEliminar) return;
    setEliminando(adminEliminar.id);
    setErrorEliminar(null);
    const result = await eliminarAdministrador(adminEliminar.id);
    setEliminando(null);
    setAdminEliminar(null);

    if (!result.ok) {
      setErrorEliminar(result.error.message);
      return;
    }

    setAdmins((prev) => prev.filter((a) => a.id !== adminEliminar.id));
    setExito('Administrador eliminado exitosamente');
  };

  const handleResetear = async () => {
    if (!adminResetear) return;
    if (!nuevaPassword || nuevaPassword.length < 8) {
      setErrorReset('La contrasena debe tener al menos 8 caracteres');
      return;
    }
    setReseteando(true);
    setErrorReset(null);
    const result = await resetearPassword(adminResetear.id, nuevaPassword);
    setReseteando(false);

    if (!result.ok) {
      setErrorReset(result.error.message);
      return;
    }

    setExito(
      `Contrasena de "${adminResetear.nombre}" reseteada. Comunicale la nueva contrasena por un canal seguro.`,
    );
    setAdminResetear(null);
    setNuevaPassword('');
  };

  const abrirResetear = (admin: Administrador) => {
    setAdminResetear(admin);
    setNuevaPassword('');
    setErrorReset(null);
  };

  const cerrarResetear = () => {
    setAdminResetear(null);
    setNuevaPassword('');
    setErrorReset(null);
  };

  return (
    <section className={styles.pagina}>
      <Breadcrumbs
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Administradores' },
        ]}
      />
      <div className={styles.cabecera}>
        <h1 className={styles.tituloPagina}>Gestión de Administradores</h1>
        <button
          type="button"
          className={styles.botonNuevo}
          onClick={() => setMostrarFormulario(true)}
          disabled={mostrarFormulario}
        >
          Nuevo administrador
        </button>
      </div>

      <AnimatePresence>
        {exito && (
          <motion.div
            className={styles.bannerExito}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeInUp}
            transition={{ duration: 0.2 }}
            role="status"
            aria-live="polite"
          >
            <p className={styles.textoExito}>{exito}</p>
            <button
              type="button"
              className={styles.botonCerrarExito}
              onClick={() => setExito(null)}
              aria-label="Cerrar mensaje"
            >
              ✕
            </button>
          </motion.div>
        )}
        {errorEliminar && (
          <motion.div
            className={styles.bannerExito}
            style={{ background: 'var(--color-accent-terracotta)' }}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeInUp}
            transition={{ duration: 0.2 }}
            role="alert"
            aria-live="assertive"
          >
            <p className={styles.textoExito}>{errorEliminar}</p>
            <button
              type="button"
              className={styles.botonCerrarExito}
              onClick={() => setErrorEliminar(null)}
              aria-label="Cerrar mensaje"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {mostrarFormulario && (
        <form className={styles.formulario} onSubmit={handleCrear}>
          <h2>Nuevo administrador</h2>
          {error && <p className={styles.textoError}>{error}</p>}
          <div className={styles.campo}>
            <label htmlFor="nombre" className={styles.label}>Nombre</label>
            <input
              id="nombre"
              type="text"
              className={styles.input}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="Nombre del administrador"
            />
          </div>
          <div className={styles.campo}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@tienda.com"
            />
          </div>
          <div className={styles.campo}>
            <label htmlFor="password" className={styles.label}>Contraseña</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Mínimo 8 caracteres"
            />
          </div>
          <div className={styles.botonesFormulario}>
            <button type="submit" className={styles.botonGuardar} disabled={creando}>
              {creando ? 'Creando...' : 'Crear administrador'}
            </button>
            <button
              type="button"
              className={styles.botonCancelar}
              onClick={() => {
                setMostrarFormulario(false);
                setError(null);
              }}
              disabled={creando}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {cargando ? (
        <p className={styles.textoCargando}>Cargando administradores...</p>
      ) : admins.length === 0 ? (
        <div className={styles.estadoVacio}>
          <p>No hay administradores registrados.</p>
        </div>
      ) : (
        <table className={styles.tabla}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Último acceso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td>{admin.nombre}</td>
                <td>{admin.email}</td>
                <td>
                  {admin.ultimoAccesoEn
                    ? new Date(admin.ultimoAccesoEn).toLocaleString('es-UY')
                    : 'Nunca'}
                </td>
                <td>
                  <div className={styles.acciones}>
                    <button
                      type="button"
                      className={styles.botonResetear}
                      onClick={() => abrirResetear(admin)}
                      aria-label={`Resetear contrasena de ${admin.nombre}`}
                    >
                      Resetear
                    </button>
                    <button
                      type="button"
                      className={styles.botonEliminar}
                      onClick={() => setAdminEliminar(admin)}
                      aria-label={`Eliminar ${admin.nombre}`}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ModalConfirmacion
        open={Boolean(adminEliminar)}
        titulo="Eliminar administrador"
        mensaje={`¿Eliminar a "${adminEliminar?.nombre}"? El administrador ya no podra iniciar sesion. Esta accion no se puede deshacer.`}
        textoConfirmar={eliminando ? 'Eliminando...' : 'Si, eliminar'}
        textoCancelar="Cancelar"
        peligroso
        onConfirmar={() => void handleEliminar()}
        onCancelar={() => setAdminEliminar(null)}
      />

      <ModalConfirmacion
        open={Boolean(adminResetear)}
        titulo="Resetear contrasena"
        mensaje={`Ingresa la nueva contrasena para "${adminResetear?.nombre}". El administrador debera usarla en su proximo inicio de sesion.`}
        textoConfirmar={reseteando ? 'Reseteando...' : 'Resetear contrasena'}
        textoCancelar="Cancelar"
        peligroso
        onConfirmar={() => void handleResetear()}
        onCancelar={cerrarResetear}
      >
        <div className={styles.campoModal}>
          <label htmlFor="nuevaPassword" className={styles.label}>
            Nueva contrasena
          </label>
          <input
            id="nuevaPassword"
            type="password"
            className={styles.input}
            value={nuevaPassword}
            onChange={(e) => setNuevaPassword(e.target.value)}
            minLength={8}
            autoComplete="new-password"
            placeholder="Minimo 8 caracteres"
            disabled={reseteando}
          />
          {errorReset && <p className={styles.textoError}>{errorReset}</p>}
        </div>
      </ModalConfirmacion>
    </section>
  );
}
