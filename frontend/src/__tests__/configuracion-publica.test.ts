import { describe, it, expect, vi, beforeEach } from 'vitest';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

import {
  obtenerConfiguracionPublica,
  whatsappLink,
} from '../services/configuracion-publica.service';

describe('obtenerConfiguracionPublica', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it('devuelve los datos del backend en caso de exito', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ nombreTienda: 'Tienda Test', whatsappContacto: '59899123456' }),
    });

    const result = await obtenerConfiguracionPublica();

    expect(result).toEqual({ nombreTienda: 'Tienda Test', whatsappContacto: '59899123456' });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/configuracion-tienda/publica'),
      expect.any(Object),
    );
  });

  it('retorna fallback { null, null } cuando el backend responde 500', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500 });

    const result = await obtenerConfiguracionPublica();

    expect(result).toEqual({ nombreTienda: null, whatsappContacto: null });
  });

  it('retorna fallback { null, null } cuando fetch lanza error de red', async () => {
    fetchMock.mockRejectedValue(new Error('NetworkError'));

    const result = await obtenerConfiguracionPublica();

    expect(result).toEqual({ nombreTienda: null, whatsappContacto: null });
  });
});

describe('whatsappLink', () => {
  it('genera link wa.me con codigo de pais 598', () => {
    expect(whatsappLink('59899123456')).toBe('https://wa.me/59899123456');
  });

  it('elimina guiones y espacios del numero', () => {
    expect(whatsappLink('+598 99 123-456')).toBe('https://wa.me/59899123456');
  });

  it('agrega 598 si el numero es local de Uruguay (09...)', () => {
    expect(whatsappLink('099123456')).toBe('https://wa.me/099123456');
  });

  it('retorna link con sufijo vacio si el numero es vacio', () => {
    expect(whatsappLink('')).toBe('https://wa.me/');
  });
});
