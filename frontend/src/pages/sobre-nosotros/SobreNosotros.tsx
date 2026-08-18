import { useEffect, useState } from 'react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { obtenerConfiguracionPublica, whatsappLink } from '@/services/configuracion-publica.service';
import { usePageTitle } from '@/hooks/usePageTitle';
import styles from './styles.module.css';

const HORARIO_TEXTO = 'Lunes a Viernes 9:00 a 18:00 hs · Sabados 9:00 a 13:00 hs';
const DIRECCION_TEXTO = 'Montevideo, Uruguay';

export default function SobreNosotros() {
  usePageTitle('Sobre nosotros | Tienda de Ropa');

  const [nombreTienda, setNombreTienda] = useState('Tienda de Ropa');
  const [whatsappNumero, setWhatsappNumero] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    obtenerConfiguracionPublica()
      .then((config) => {
        if (!activo) return;
        setNombreTienda(config.nombreTienda ?? 'Tienda de Ropa');
        setWhatsappNumero(config.whatsappContacto);
      })
      .catch(() => {
        // Se mantienen los valores por defecto.
      });
    return () => {
      activo = false;
    };
  }, []);

  return (
    <main className={styles.pagina}>
      <Breadcrumbs
        items={[{ label: 'Inicio', href: '/' }, { label: 'Sobre nosotros' }]}
      />

      <header className={styles.cabecera}>
        <h1 className={styles.titulo}>Sobre {nombreTienda}</h1>
        <p className={styles.subtitulo}>
          Tu tienda de ropa en Uruguay, con onda y al alcance de un click.
        </p>
      </header>

      <div className={styles.contenido}>
        <section className={styles.columnaTexto}>
          <article className={styles.bloque}>
            <h2 className={styles.subtituloBloque}>Nuestra historia</h2>
            <p className={styles.parrafo}>
              Somos una tienda de ropa pensada para acompanarte en el dia a dia.
              Trabajamos con prendas que combinan comodidad, durabilidad y un
              diseno atemporal, para que vistas bien sin complicarte.
            </p>
            <p className={styles.parrafo}>
              Cada pieza de nuestro catalogo fue elegida cuidando los detalles:
              telas que resisten el uso, talles consistentes y colores que
              combinan entre si. Creemos que comprar ropa deberia ser simple y
              agradable.
            </p>
          </article>

          <article className={styles.bloque}>
            <h2 className={styles.subtituloBloque}>Como comprar</h2>
            <ol className={styles.pasos}>
              <li>Explora nuestro catalogo y elegi las prendas que te gusten.</li>
              <li>Agregalas al carrito y revisa el total antes de continuar.</li>
              <li>
                Completa el checkout con tus datos de contacto (email y telefono).
              </li>
              <li>
                Realiza la transferencia bancaria con los datos que te enviamos
                y espera la confirmacion de tu pedido.
              </li>
            </ol>
          </article>
        </section>

        <aside className={styles.columnaContacto}>
          <h2 className={styles.subtituloBloque}>Contacto</h2>

          <div className={styles.dato}>
            <span className={styles.datoLabel}>WhatsApp</span>
            {whatsappNumero ? (
              <a
                href={whatsappLink(whatsappNumero)}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.datoValor}
              >
                {whatsappNumero}
              </a>
            ) : (
              <span className={styles.datoVacio}>
                Aun no configurado. Si sos administrador,{' '}
                <a href="/admin/login" className={styles.datoLink}>
                  configura el WhatsApp de la tienda
                </a>
                .
              </span>
            )}
          </div>

          <div className={styles.dato}>
            <span className={styles.datoLabel}>Horario de atencion</span>
            <span className={styles.datoValor}>{HORARIO_TEXTO}</span>
          </div>

          <div className={styles.dato}>
            <span className={styles.datoLabel}>Ubicacion</span>
            <span className={styles.datoValor}>{DIRECCION_TEXTO}</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
