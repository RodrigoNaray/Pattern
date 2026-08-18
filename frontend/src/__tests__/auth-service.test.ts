import { describe, it, expect, vi, beforeEach } from 'vitest';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

import {
  obtenerToken,
  guardarToken,
  eliminarToken,
  estaAutenticado,
  login,
  cambiarPassword,
} from '../services/auth.service';

describe('auth.service - localStorage helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('guardarToken persiste en localStorage', () => {
    guardarToken('mi-token-abc');

    expect(localStorage.getItem('accessToken')).toBe('mi-token-abc');
  });

  it('obtenerToken lee el token de localStorage', () => {
    localStorage.setItem('accessToken', 'token-xyz');
    expect(obtenerToken()).toBe('token-xyz');
  });

  it('obtenerToken retorna null cuando no hay token', () => {
    expect(obtenerToken()).toBeNull();
  });

  it('eliminarToken borra de localStorage', () => {
    guardarToken('token-a-borrar');
    eliminarToken();

    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  it('estaAutenticado refleja el estado de localStorage', () => {
    expect(estaAutenticado()).toBe(false);
    guardarToken('test');
    expect(estaAutenticado()).toBe(true);
    eliminarToken();
    expect(estaAutenticado()).toBe(false);
  });
});

describe('auth.service - login', () => {
  beforeEach(() => {
    localStorage.clear();
    fetchMock.mockReset();
  });

  it('envia credenciales y guarda el accessToken en localStorage', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        accessToken: 'jwt-123',
        admin: { id: 'a1', nombre: 'Admin', email: 'a@a.com' },
      }),
    });

    const result = await login('a@a.com', 'pwd12345');

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/auth/login'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'a@a.com', password: 'pwd12345' }),
      }),
    );
    expect(result.accessToken).toBe('jwt-123');
    expect(localStorage.getItem('accessToken')).toBe('jwt-123');
  });

  it('lanza error con el mensaje del backend cuando falla', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: 'Credenciales invalidas' }),
    });

    await expect(login('a@a.com', 'wrong')).rejects.toThrow('Credenciales invalidas');
    expect(localStorage.getItem('accessToken')).toBeNull();
  });
});

describe('auth.service - cambiarPassword', () => {
  beforeEach(() => {
    localStorage.clear();
    fetchMock.mockReset();
  });

  it('envia Bearer token + body al endpoint', async () => {
    localStorage.setItem('accessToken', 'token-actual');
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ mensaje: 'Contrasena actualizada' }),
    });

    await cambiarPassword({ currentPassword: 'old', newPassword: 'new12345' });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('/auth/cambiar-password');
    const headers = options?.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer token-actual');
    expect(options?.body).toBe(JSON.stringify({ currentPassword: 'old', newPassword: 'new12345' }));
  });

  it('lanza error cuando el backend rechaza la nueva contrasena', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: 'La nueva contrasena debe tener al menos 8 caracteres' }),
    });

    await expect(
      cambiarPassword({ currentPassword: 'old', newPassword: 'short' }),
    ).rejects.toThrow('al menos 8 caracteres');
  });
});
