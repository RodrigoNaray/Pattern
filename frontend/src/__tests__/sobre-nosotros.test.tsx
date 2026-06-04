import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('next/navigation', () => ({}));

vi.mock('@/components/layout/Breadcrumbs', () => ({
  default: ({ items }: { items: Array<{ label: string; href?: string }> }) => (
    <nav data-testid="breadcrumbs">
      {items.map((i, idx) => (
        <span key={idx}>{i.label}</span>
      ))}
    </nav>
  ),
}));

vi.mock('@/services/configuracion-publica.service', () => ({
  obtenerConfiguracionPublica: () => fetchMock(),
  whatsappLink: (n: string) => `https://wa.me/${n.replace(/\D/g, '')}`,
}));

import SobreNosotrosPage from '@/app/sobre-nosotros/page';

describe('SobreNosotrosPage', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('muestra el nombre de la tienda desde la configuracion publica', async () => {
    fetchMock.mockResolvedValue({
      nombreTienda: 'Boutique Luna',
      whatsappContacto: '59899123456',
    });

    const page = await SobreNosotrosPage();
    render(page);

    expect(screen.getByRole('heading', { level: 1, name: /Boutique Luna/i })).toBeInTheDocument();
  });

  it('muestra el link de WhatsApp cuando esta configurado', async () => {
    fetchMock.mockResolvedValue({
      nombreTienda: 'Boutique Luna',
      whatsappContacto: '59899123456',
    });

    const page = await SobreNosotrosPage();
    render(page);

    const whatsappLink = screen.getByRole('link', { name: '59899123456' });
    expect(whatsappLink).toHaveAttribute('href', 'https://wa.me/59899123456');
    expect(whatsappLink).toHaveAttribute('target', '_blank');
  });

  it('muestra fallback cuando el WhatsApp no esta configurado', async () => {
    fetchMock.mockResolvedValue({
      nombreTienda: 'Boutique Luna',
      whatsappContacto: null,
    });

    const page = await SobreNosotrosPage();
    render(page);

    expect(screen.getByText(/Aun no configurado/i)).toBeInTheDocument();
    const loginLink = screen.getByRole('link', { name: /configura el WhatsApp/i });
    expect(loginLink).toHaveAttribute('href', '/admin/login');
  });

  it('usa "Tienda de Ropa" como nombre por defecto si la config viene null', async () => {
    fetchMock.mockResolvedValue({
      nombreTienda: null,
      whatsappContacto: null,
    });

    const page = await SobreNosotrosPage();
    render(page);

    expect(screen.getByRole('heading', { level: 1, name: /Tienda de Ropa/i })).toBeInTheDocument();
  });

  it('muestra las secciones "Como comprar" y "Contacto"', async () => {
    fetchMock.mockResolvedValue({
      nombreTienda: 'Boutique Luna',
      whatsappContacto: '59899123456',
    });

    const page = await SobreNosotrosPage();
    render(page);

    expect(screen.getByRole('heading', { level: 2, name: /Como comprar/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Contacto/i })).toBeInTheDocument();
  });

  it('muestra breadcrumb Inicio > Sobre nosotros', async () => {
    fetchMock.mockResolvedValue({
      nombreTienda: 'Boutique Luna',
      whatsappContacto: null,
    });

    const page = await SobreNosotrosPage();
    render(page);

    const breadcrumbs = screen.getByTestId('breadcrumbs');
    expect(breadcrumbs.textContent).toContain('Inicio');
    expect(breadcrumbs.textContent).toContain('Sobre nosotros');
  });
});
