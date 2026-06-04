import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const obtenerTokenMock = vi.fn(() => null);
const eliminarTokenMock = vi.fn();
const fetchMock = vi.fn();

vi.mock('../services/auth.service', () => ({
  obtenerToken: () => obtenerTokenMock(),
  eliminarToken: () => eliminarTokenMock(),
}));

vi.stubGlobal('fetch', fetchMock);

import { apiFetch } from '../services/api-fetch';

describe('apiFetch', () => {
  let originalLocation: Location;

  beforeEach(() => {
    fetchMock.mockReset();
    obtenerTokenMock.mockReturnValue(null);
    eliminarTokenMock.mockClear();
    originalLocation = window.location;
    delete (window as any).location;
    (window as any).location = { href: '' };
  });

  afterEach(() => {
    (window as any).location = originalLocation;
    vi.restoreAllMocks();
  });

  it('retorna { ok: true, value } cuando la respuesta es exitosa con JSON', async () => {
    fetchMock.mockResolvedValue({
      status: 200,
      ok: true,
      json: () => Promise.resolve({ mensaje: 'ok', id: 1 }),
    });

    const result = await apiFetch<{ mensaje: string; id: number }>('/test');

    expect(result).toEqual({ ok: true, value: { mensaje: 'ok', id: 1 } });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('incluye Authorization Bearer cuando hay token', async () => {
    obtenerTokenMock.mockReturnValue('test-token-123');
    fetchMock.mockResolvedValue({
      status: 200,
      ok: true,
      json: () => Promise.resolve({}),
    });

    await apiFetch('/test');

    const [, options] = fetchMock.mock.calls[0];
    const headers = options?.headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer test-token-123');
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('redirige a /admin/login y retorna error 401 cuando el backend responde 401', async () => {
    fetchMock.mockResolvedValue({
      status: 401,
      ok: false,
      json: () => Promise.resolve({ message: 'Token expirado' }),
    });

    const result = await apiFetch('/test');

    expect(eliminarTokenMock).toHaveBeenCalled();
    expect(window.location.href).toBe('/admin/login');
    expect(result).toEqual({ ok: false, error: { message: 'Sesión expirada', status: 401 } });
  });

  it('toma el primer mensaje de un array (validation error de NestJS)', async () => {
    fetchMock.mockResolvedValue({
      status: 400,
      ok: false,
      json: () => Promise.resolve({ message: ['El email es invalido', 'El nombre es requerido'] }),
    });

    const result = await apiFetch('/test');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe('El email es invalido');
      expect(result.error.status).toBe(400);
    }
  });

  it('usa "Error HTTP 500" cuando el body no es JSON', async () => {
    fetchMock.mockResolvedValue({
      status: 500,
      ok: false,
      json: () => Promise.reject(new Error('parse fail')),
    });

    const result = await apiFetch('/test');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe('Error HTTP 500');
      expect(result.error.status).toBe(500);
    }
  });

  it('retorna error de red (status 0) cuando fetch throws', async () => {
    fetchMock.mockRejectedValue(new Error('NetworkError'));

    const result = await apiFetch('/test');

    expect(result).toEqual({
      ok: false,
      error: { message: 'NetworkError', status: 0 },
    });
  });

  it('retorna { ok: true, value: undefined } cuando el status es 204', async () => {
    fetchMock.mockResolvedValue({
      status: 204,
      ok: true,
      json: () => Promise.reject(new Error('no body')),
    });

    const result = await apiFetch('/test');

    expect(result).toEqual({ ok: true, value: undefined });
  });
});
