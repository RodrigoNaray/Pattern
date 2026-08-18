import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const pushMock = vi.fn();
const eliminarTokenMock = vi.fn();

vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
  useNavigate: () => pushMock,
}));

vi.mock('@/services/auth.service', () => ({
  eliminarToken: () => eliminarTokenMock(),
}));

import { AdminHeader } from '@/components/layout/AdminHeader';

describe('AdminHeader', () => {
  beforeEach(() => {
    pushMock.mockClear();
    eliminarTokenMock.mockClear();
  });

  it('renderiza el logo y los links administrativos', () => {
    render(<AdminHeader />);

    expect(screen.getByText('Tienda Admin')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/admin');
    expect(screen.getByRole('link', { name: 'Productos' })).toHaveAttribute('href', '/admin/productos');
    expect(screen.getByRole('link', { name: 'Pedidos' })).toHaveAttribute('href', '/admin/pedidos');
    expect(screen.getByRole('link', { name: 'Configuracion' })).toHaveAttribute('href', '/admin/configuracion');
    expect(screen.getByRole('link', { name: 'Notificaciones' })).toHaveAttribute('href', '/admin/notificaciones');
    expect(screen.getByRole('link', { name: 'Administradores' })).toHaveAttribute('href', '/admin/administradores');
  });

  it('incluye link "Mi cuenta" hacia /admin/cuenta', () => {
    render(<AdminHeader />);
    expect(screen.getByRole('link', { name: 'Mi cuenta' })).toHaveAttribute('href', '/admin/cuenta');
  });

  it('boton "Cerrar sesion" abre modal de confirmacion', () => {
    render(<AdminHeader />);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesion' }));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Cerrar sesion' })).toBeInTheDocument();
  });

  it('confirmar el modal elimina el token y redirige a /admin/login', () => {
    render(<AdminHeader />);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesion' }));
    fireEvent.click(screen.getByRole('button', { name: 'Si, cerrar sesion' }));

    expect(eliminarTokenMock).toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith('/admin/login');
  });

  it('cancelar el modal no llama eliminarToken', () => {
    render(<AdminHeader />);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesion' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(eliminarTokenMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
