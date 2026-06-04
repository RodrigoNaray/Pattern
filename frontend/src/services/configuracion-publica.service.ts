const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface ConfiguracionPublica {
  nombreTienda: string | null;
  whatsappContacto: string | null;
}

export async function obtenerConfiguracionPublica(): Promise<ConfiguracionPublica> {
  try {
    const res = await fetch(`${BASE_URL}/configuracion-tienda/publica`, {
      next: { revalidate: 300 },
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
