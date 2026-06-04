import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onClick, ...props }: any) => (
      <div onClick={onClick} {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

import ModalConfirmacion from '@/components/admin/ModalConfirmacion';

describe('ModalConfirmacion', () => {
  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('no renderiza nada cuando open=false', () => {
    render(
      <ModalConfirmacion
        open={false}
        titulo="Confirmar"
        mensaje="Estas seguro?"
        onConfirmar={() => {}}
        onCancelar={() => {}}
      />,
    );
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('renderiza titulo, mensaje y botones cuando open=true', () => {
    render(
      <ModalConfirmacion
        open={true}
        titulo="Eliminar producto"
        mensaje="Esta accion no se puede deshacer"
        onConfirmar={() => {}}
        onCancelar={() => {}}
      />,
    );

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Eliminar producto' })).toBeInTheDocument();
    expect(screen.getByText('Esta accion no se puede deshacer')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument();
  });

  it('click en boton Cancelar llama onCancelar', () => {
    const onCancelar = vi.fn();
    render(
      <ModalConfirmacion
        open={true}
        titulo="X"
        mensaje="Y"
        onConfirmar={() => {}}
        onCancelar={onCancelar}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancelar).toHaveBeenCalledTimes(1);
  });

  it('click en boton Confirmar llama onConfirmar', () => {
    const onConfirmar = vi.fn();
    render(
      <ModalConfirmacion
        open={true}
        titulo="X"
        mensaje="Y"
        onConfirmar={onConfirmar}
        onCancelar={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    expect(onConfirmar).toHaveBeenCalledTimes(1);
  });

  it('click en overlay llama onCancelar', () => {
    const onCancelar = vi.fn();
    const { container } = render(
      <ModalConfirmacion
        open={true}
        titulo="X"
        mensaje="Y"
        onConfirmar={() => {}}
        onCancelar={onCancelar}
      />,
    );
    const overlay = container.querySelector('[role="presentation"]') as HTMLElement;
    fireEvent.click(overlay);
    expect(onCancelar).toHaveBeenCalledTimes(1);
  });

  it('tecla Escape llama onCancelar', () => {
    const onCancelar = vi.fn();
    render(
      <ModalConfirmacion
        open={true}
        titulo="X"
        mensaje="Y"
        onConfirmar={() => {}}
        onCancelar={onCancelar}
      />,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCancelar).toHaveBeenCalledTimes(1);
  });

  it('renderiza children cuando se pasan', () => {
    render(
      <ModalConfirmacion
        open={true}
        titulo="Resetear"
        mensaje="Ingresa la nueva contrasena"
        onConfirmar={() => {}}
        onCancelar={() => {}}
      >
        <input data-testid="input-password" />
      </ModalConfirmacion>,
    );
    expect(screen.getByTestId('input-password')).toBeInTheDocument();
  });

  it('usa textos personalizados para los botones', () => {
    render(
      <ModalConfirmacion
        open={true}
        titulo="X"
        mensaje="Y"
        textoConfirmar="Si, eliminar"
        textoCancelar="No, volver"
        onConfirmar={() => {}}
        onCancelar={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'Si, eliminar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No, volver' })).toBeInTheDocument();
  });
});
