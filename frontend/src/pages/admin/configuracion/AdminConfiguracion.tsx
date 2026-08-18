
import { useEffect, useState, useCallback } from 'react';
import { configuracionService, type ConfiguracionTienda } from '@/services/configuracion.service';
import styles from './Configuracion.module.css';

export default function AdminConfiguracionPage() {
  const [config, setConfig] = useState<ConfiguracionTienda | null>(null);
  const [formData, setFormData] = useState<Record<string, string | number | boolean>>({});
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ mensaje: string; error?: boolean } | null>(null);

  const mostrarToast = useCallback((mensaje: string, error?: boolean) => {
    setToast({ mensaje, error });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await configuracionService.obtener();
        setConfig(data);
        setFormData({
          nombreTienda: data.nombreTienda ?? '',
          whatsappContacto: data.whatsappContacto ?? '',
          banco: data.banco ?? '',
          cbu: data.cbu ?? '',
          alias: data.alias ?? '',
          titular: data.titular ?? '',
          mensajeTransferencia: data.mensajeTransferencia ?? '',
          pedidoVencimientoHoras: data.pedidoVencimientoHoras,
          estadoProductoBorrador: data.estadoProductoBorrador,
        });
      } catch {
        setError('Error al cargar configuración');
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const dto: Record<string, unknown> = {};
      if (config) {
        const fields: (keyof ConfiguracionTienda)[] = [
          'nombreTienda', 'whatsappContacto', 'banco', 'cbu', 'alias',
          'titular', 'mensajeTransferencia', 'pedidoVencimientoHoras', 'estadoProductoBorrador',
        ];
        for (const field of fields) {
          const val = formData[field];
          const original = config[field];
          if (String(val) !== String(original ?? '')) {
            dto[field] = val;
          }
        }
      }
      if (Object.keys(dto).length === 0) {
        mostrarToast('No hay cambios para guardar');
        setGuardando(false);
        return;
      }
      const result = await configuracionService.actualizar(dto as Record<string, string | number | boolean>);
      setConfig(result.configuracion);
      mostrarToast('Configuración actualizada');
    } catch (err) {
      mostrarToast(err instanceof Error ? err.message : 'Error al guardar', true);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <main className={styles.container}><p className={styles.cargando}>Cargando configuración...</p></main>;
  if (error) return <main className={styles.container}><p className={styles.error}>{error}</p></main>;

  return (
    <main className={styles.container}>
      <h1 className={styles.titulo}>Configuración de la tienda</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <fieldset className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>Información general</h2>
          <div className={styles.campos}>
            <div className={styles.campo}>
              <label className={styles.label} htmlFor="nombreTienda">Nombre de la tienda</label>
              <input
                id="nombreTienda"
                className={styles.input}
                value={formData.nombreTienda as string}
                onChange={(e) => handleChange('nombreTienda', e.target.value)}
              />
            </div>
            <div className={styles.campo}>
              <label className={styles.label} htmlFor="whatsappContacto">WhatsApp de contacto</label>
              <input
                id="whatsappContacto"
                className={styles.input}
                placeholder="+59899123456"
                value={formData.whatsappContacto as string}
                onChange={(e) => handleChange('whatsappContacto', e.target.value)}
              />
              <span className={styles.hint}>Número con código de país, sin espacios ni guiones</span>
            </div>
          </div>
        </fieldset>

        <fieldset className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>Datos bancarios</h2>
          <div className={styles.campos}>
            <div className={styles.campo}>
              <label className={styles.label} htmlFor="banco">Banco</label>
              <input
                id="banco"
                className={styles.input}
                value={formData.banco as string}
                onChange={(e) => handleChange('banco', e.target.value)}
              />
            </div>
            <div className={styles.campo}>
              <label className={styles.label} htmlFor="cbu">CBU</label>
              <input
                id="cbu"
                className={styles.input}
                value={formData.cbu as string}
                onChange={(e) => handleChange('cbu', e.target.value)}
              />
            </div>
            <div className={styles.campo}>
              <label className={styles.label} htmlFor="alias">Alias</label>
              <input
                id="alias"
                className={styles.input}
                value={formData.alias as string}
                onChange={(e) => handleChange('alias', e.target.value)}
              />
            </div>
            <div className={styles.campo}>
              <label className={styles.label} htmlFor="titular">Titular de la cuenta</label>
              <input
                id="titular"
                className={styles.input}
                value={formData.titular as string}
                onChange={(e) => handleChange('titular', e.target.value)}
              />
            </div>
          </div>
        </fieldset>

        <fieldset className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>Opciones</h2>
          <div className={styles.campos}>
            <div className={styles.campo}>
              <label className={styles.label} htmlFor="mensajeTransferencia">Mensaje de transferencia</label>
              <textarea
                id="mensajeTransferencia"
                className={styles.textarea}
                value={formData.mensajeTransferencia as string}
                onChange={(e) => handleChange('mensajeTransferencia', e.target.value)}
              />
              <span className={styles.hint}>Se muestra al cliente al finalizar el pedido</span>
            </div>
            <div className={styles.campo}>
              <label className={styles.label} htmlFor="pedidoVencimientoHoras">Vencimiento del pedido (horas)</label>
              <input
                id="pedidoVencimientoHoras"
                className={styles.input}
                type="number"
                min={1}
                value={formData.pedidoVencimientoHoras as number}
                onChange={(e) => handleChange('pedidoVencimientoHoras', Number(e.target.value))}
              />
            </div>
            <div className={styles.checkboxRow}>
              <input
                id="estadoProductoBorrador"
                className={styles.checkbox}
                type="checkbox"
                checked={formData.estadoProductoBorrador as boolean}
                onChange={(e) => handleChange('estadoProductoBorrador', e.target.checked)}
              />
              <label className={styles.checkboxLabel} htmlFor="estadoProductoBorrador">
                Productos nuevos en estado borrador
              </label>
            </div>
          </div>
        </fieldset>

        <div className={styles.acciones}>
          <button className={styles.btnGuardar} type="submit" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>

      {toast && (
        <div className={`${styles.toast} ${toast.error ? styles.toastError : ''}`}>
          {toast.mensaje}
        </div>
      )}
    </main>
  );
}
