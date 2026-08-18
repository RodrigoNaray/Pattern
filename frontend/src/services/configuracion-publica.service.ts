const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface ConfiguracionPublica {
  nombreTienda: string | null;
  whatsappContacto: string | null;
}

export async function obtenerConfiguracionPublica(): Promise<ConfiguracionPublica> {
  try {
    const res = await fetch(`${BASE_URL}/configuracion-tienda/publica`, {
    });

    if (!res.ok) {
      return { nombreTienda: null, whatsappContacto: null };
    }

    return (await res.json()) as ConfiguracionPublica;
  } catch {
    return { nombreTienda: null, whatsappContacto: null };
  }
}

export function whatsappLink(numero: string): string {
  const limpio = numero.replace(/\D/g, '');
  return `https://wa.me/${limpio}`;
}
