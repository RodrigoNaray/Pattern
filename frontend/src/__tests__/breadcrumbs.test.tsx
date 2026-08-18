import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
}));

import Breadcrumbs from '@/components/layout/Breadcrumbs';

describe('Breadcrumbs', () => {
  beforeEach(() => {
    delete (window as any).location;
    (window as any).location = { origin: 'http://localhost:3000' };
  });

  it('no renderiza nada cuando items esta vacio', () => {
    const { container } = render(<Breadcrumbs items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renderiza items con links excepto el ultimo', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Productos', href: '/productos' },
          { label: 'Remera' },
        ]}
      />,
    );

    const inicioLink = screen.getByRole('link', { name: 'Inicio' });
    expect(inicioLink).toHaveAttribute('href', '/');

    const productosLink = screen.getByRole('link', { name: 'Productos' });
    expect(productosLink).toHaveAttribute('href', '/productos');

    const ultimo = screen.getByText('Remera');
    expect(ultimo.tagName).toBe('SPAN');
    expect(ultimo).toHaveAttribute('aria-current', 'page');
  });

  it('muestra separadores "/" entre items pero no despues del ultimo', () => {
    const { container } = render(
      <Breadcrumbs
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Productos', href: '/productos' },
          { label: 'Remera' },
        ]}
      />,
    );

    const separadores = container.querySelectorAll('[aria-hidden="true"]');
    expect(separadores).toHaveLength(2);
    expect(separadores[0].textContent).toBe('/');
    expect(separadores[1].textContent).toBe('/');
  });

  it('incluye JSON-LD con schema.org BreadcrumbList y URLs absolutas', () => {
    const { container } = render(
      <Breadcrumbs
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Productos', href: '/productos' },
          { label: 'Remera' },
        ]}
      />,
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const jsonLd = JSON.parse(script!.textContent || '{}');

    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('BreadcrumbList');
    expect(jsonLd.itemListElement).toHaveLength(3);

    expect(jsonLd.itemListElement[0]).toEqual({
      '@type': 'ListItem',
      position: 1,
      name: 'Inicio',
      item: 'http://localhost:3000/',
    });
    expect(jsonLd.itemListElement[1]).toEqual({
      '@type': 'ListItem',
      position: 2,
      name: 'Productos',
      item: 'http://localhost:3000/productos',
    });
    expect(jsonLd.itemListElement[2]).toEqual({
      '@type': 'ListItem',
      position: 3,
      name: 'Remera',
    });
    expect(jsonLd.itemListElement[2]).not.toHaveProperty('item');
  });

  it('renderiza un solo item como texto sin link', () => {
    render(<Breadcrumbs items={[{ label: 'Sobre nosotros' }]} />);

    const item = screen.getByText('Sobre nosotros');
    expect(item.tagName).toBe('SPAN');
    expect(item).toHaveAttribute('aria-current', 'page');
  });
});
