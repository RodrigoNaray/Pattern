import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const pushMock = vi.fn();
let searchParamsValue = new URLSearchParams();

vi.mock('react-router-dom', () => ({
  useNavigate: () => pushMock,
  useSearchParams: () => [searchParamsValue, vi.fn()],
}));

import BarraBusqueda from '@/components/client/BarraBusqueda';

describe('BarraBusqueda', () => {
  beforeEach(() => {
    pushMock.mockClear();
    searchParamsValue = new URLSearchParams();
  });

  it('renderiza el input con el placeholder correcto', () => {
    render(<BarraBusqueda />);
    const input = screen.getByPlaceholderText('Buscar por nombre...');
    expect(input).toBeInTheDocument();
  });

  it('submit con valor navega a la URL con q y reinicia pagina', () => {
    searchParamsValue = new URLSearchParams('talle=M&pagina=3');
    render(<BarraBusqueda />);

    const input = screen.getByPlaceholderText('Buscar por nombre...');
    fireEvent.change(input, { target: { value: 'remera' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(pushMock).toHaveBeenCalledWith('/productos?talle=M&pagina=1&q=remera');
  });

  it('submit con valor y filtros vacios navega solo con q y pagina=1', () => {
    render(<BarraBusqueda />);

    const input = screen.getByPlaceholderText('Buscar por nombre...');
    fireEvent.change(input, { target: { value: 'pantalon' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    const call = pushMock.mock.calls[0][0];
    expect(call).toContain('q=pantalon');
    expect(call).toContain('pagina=1');
  });

  it('boton limpiar aparece solo cuando hay texto', () => {
    render(<BarraBusqueda />);
    expect(screen.queryByRole('button', { name: 'Limpiar busqueda' })).not.toBeInTheDocument();

    const input = screen.getByPlaceholderText('Buscar por nombre...');
    fireEvent.change(input, { target: { value: 'x' } });
    expect(screen.getByRole('button', { name: 'Limpiar busqueda' })).toBeInTheDocument();
  });

  it('click en limpiar navega sin q pero conserva otros filtros', () => {
    searchParamsValue = new URLSearchParams('q=remera&talle=M&pagina=2');
    render(<BarraBusqueda />);

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar busqueda' }));

    const call = pushMock.mock.calls[0][0];
    expect(call).not.toContain('q=');
    expect(call).toContain('talle=M');
    expect(call).toContain('pagina=1');
  });

  it('submit con valor vacio elimina q de la URL', () => {
    searchParamsValue = new URLSearchParams('q=anterior&pagina=1');
    render(<BarraBusqueda />);

    const input = screen.getByPlaceholderText('Buscar por nombre...');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    const call = pushMock.mock.calls[0][0];
    expect(call).not.toContain('q=anterior');
    expect(call).toContain('pagina=1');
  });

  it('inicializa el input con el valor de q de la URL', () => {
    searchParamsValue = new URLSearchParams('q=jean');
    render(<BarraBusqueda />);
    const input = screen.getByPlaceholderText('Buscar por nombre...') as HTMLInputElement;
    expect(input.value).toBe('jean');
  });
});
