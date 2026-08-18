import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const pushMock = vi.fn();
let itemCount = 0;

vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
  useNavigate: () => pushMock,
}));

vi.mock('@/components/carrito/carrito-context', () => ({
  useCarrito: () => ({ itemCount }),
}));

import { Header } from '@/components/layout/Header';

describe('Header publico', () => {
  beforeEach(() => {
    pushMock.mockClear();
    itemCount = 0;
  });

  it('renderiza el logo y los 4 links principales', () => {
    render(<Header />);

    expect(screen.getByText('Tienda de Ropa')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Catalogo' })).toHaveAttribute('href', '/productos');
    expect(screen.getByRole('link', { name: 'Sobre nosotros' })).toHaveAttribute('href', '/sobre-nosotros');
    expect(screen.getByRole('link', { name: 'Mi pedido' })).toHaveAttribute('href', '/pedidos');
  });

  it('click en boton Carrito navega a /carrito', () => {
    render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: /Carrito/i }));
    expect(pushMock).toHaveBeenCalledWith('/carrito');
  });

  it('muestra badge con el itemCount cuando hay productos en el carrito', () => {
    itemCount = 3;
    render(<Header />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('no muestra badge cuando el carrito esta vacio', () => {
    itemCount = 0;
    render(<Header />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});
