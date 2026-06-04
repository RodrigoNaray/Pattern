'use client';

import { useState, FormEvent } from 'react';
import { pedidoPublicoService, type PedidoDetalle } from '@/services/pedido-publico.service';
import { formatearPrecio, formatearFecha } from '@/lib/formatear-precio';
import styles from './BuscarPedido.module.css';

interface FormErrors {
  codigo?: string;
  email?: string;
}

export default function BuscarPedido() {
  const [codigo, setCodigo] = useState('');
  const [email, setEmail] = useState('');
  const [errores, setErrores] = useState<FormErrors>({});
  const [cargando, setCargando] = useState(false);
  const [pedido, setPedido] = useState<PedidoDetalle | null>(null);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  function validar(): FormErrors {
    const nuevos: FormErrors = {};
    if (!codigo.trim()) nuevos.codigo = 'Ingresa el codigo del pedido';
    if (!email.trim()) nuevos.email = 'Ingresa tu email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nuevos.email = 'Email invalido';
    return nuevos;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorGeneral(null);
    setPedido(null);
    const nuevosErrores = validar();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    setCargando(true);
    try {
      const result = await pedidoPublicoService.buscarPorCodigoYEmail(
        codigo.trim(),
        email.trim().toLowerCase(),
      );
      setPedido(result);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al buscar el pedido';
      if (mensaje.includes('No se encontro')) {
        setErrorGeneral('No encontramos un pedido con ese codigo y email. Verifica los datos.');
      } else {
        setErrorGeneral('No pudimos buscar tu pedido. Intenta de nuevo en unos minutos.');
      }
    } finally {
      setCargando(false);
    }
  }

  if (pedido) {
    return (
      <div className={styles.detalle}>
        <div className={styles.encabezado}>
          <h2 className={styles.tituloPedido}>Pedido {pedido.codigo}</h2>
          <span className={styles.estado} data-estado={pedido.estado}>
            {formatearEstado(pedido.estado)}
          </span>
        </div>

        <dl className={styles.datos}>
          <div className={styles.dato}>
            <dt>Realizado</dt>
            <dd>{formatearFecha(pedido.creadoEn)}</dd>
          </div>
          <div className={styles.dato}>
            <dt>Email</dt>
            <dd>{pedido.emailComprador}</dd>
          </div>
          <div className={styles.dato}>
            <dt>Telefono</dt>
            <dd>{pedido.telefonoComprador}</dd>
          </div>
          <div className={styles.dato}>
            <dt>Total</dt>
            <dd className={styles.total}>{formatearPrecio(pedido.totalCentavos)}</dd>
          </div>
        </dl>

        <h3 className={styles.subtitulo}>Productos</h3>
        <ul className={styles.listaItems}>
          {pedido.items.map((item) => (
            <li key={item.id} className={styles.item}>
              <div>
                <p className={styles.itemNombre}>{item.producto.nombre}</p>
                <p className={styles.itemTalle}>Talle {item.producto.talle}</p>
              </div>
              <div className={styles.itemCantidad}>x{item.cantidad}</div>
              <div className={styles.itemPrecio}>
                {formatearPrecio(item.subtotalCentavos)}
              </div>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className={styles.botonNueva}
          onClick={() => {
            setPedido(null);
            setCodigo('');
            setEmail('');
          }}
        >
          Buscar otro pedido
        </button>
      </div>
    );
  }

  return (
    <form className={styles.formulario} onSubmit={handleSubmit} noValidate>
      <p className={styles.ayuda}>
        Ingresa el codigo de tu pedido y el email que usaste al comprarlo.
      </p>

      <div className={styles.campo}>
        <label htmlFor="codigo" className={styles.etiqueta}>
          Codigo de pedido
        </label>
        <input
          id="codigo"
          type="text"
          className={styles.input}
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="PED-ABC123"
          autoComplete="off"
          aria-invalid={Boolean(errores.codigo)}
        />
        {errores.codigo && <p className={styles.error}>{errores.codigo}</p>}
      </div>

      <div className={styles.campo}>
        <label htmlFor="email" className={styles.etiqueta}>
          Email
        </label>
        <input
          id="email"
          type="email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          autoComplete="email"
          aria-invalid={Boolean(errores.email)}
        />
        {errores.email && <p className={styles.error}>{errores.email}</p>}
      </div>

      {errorGeneral && <p className={styles.errorGeneral}>{errorGeneral}</p>}

      <button type="submit" className={styles.boton} disabled={cargando}>
        {cargando ? 'Buscando...' : 'Buscar pedido'}
      </button>
    </form>
  );
}

function formatearEstado(estado: string): string {
  switch (estado) {
    case 'PENDIENTE_PAGO':
      return 'Pendiente de pago';
    case 'PAGO_CONFIRMADO':
      return 'Pago confirmado';
    case 'CANCELADO':
      return 'Cancelado';
    default:
      return estado;
  }
}
