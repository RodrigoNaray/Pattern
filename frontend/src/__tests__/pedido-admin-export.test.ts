import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const obtenerTokenMock = vi.fn<() => string | null>(() => 'test-token-123');
const descargarArchivoMock = vi.fn();
const fetchMock = vi.fn();

vi.mock('../services/auth.service', () => ({
  obtenerToken: () => obtenerTokenMock(),
}));

vi.mock('../services/descargar-archivo', () => ({
  descargarArchivo: (blob: Blob, filename: string) => descargarArchivoMock(blob, filename),
}));

vi.stubGlobal('fetch', fetchMock);

import { pedidoAdminService } from '../services/pedido-admin.service';

describe('pedidoAdminService.exportarCsv', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    descargarArchivoMock.mockReset();
    obtenerTokenMock.mockReturnValue('test-token-123');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('llama a fetch con Authorization Bearer y la URL correcta', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(['csv-content'], { type: 'text/csv' })),
    });

    await pedidoAdminService.exportarCsv();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain('/pedidos/export');
    const headers = options?.headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer test-token-123');
  });

  it('descarga el archivo con nombre pedidos-YYYY-MM-DD.csv', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(['csv-content'])),
    });

    await pedidoAdminService.exportarCsv();

    expect(descargarArchivoMock).toHaveBeenCalledTimes(1);
    const [blob, filename] = descargarArchivoMock.mock.calls[0];
    expect(blob).toBeInstanceOf(Blob);
    expect(filename).toMatch(/^pedidos-\d{4}-\d{2}-\d{2}\.csv$/);
  });

  it('lanza error con mensaje del backend cuando la respuesta no es ok', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'No autenticado' }),
    });

    await expect(pedidoAdminService.exportarCsv()).rejects.toThrow('No autenticado');
    expect(descargarArchivoMock).not.toHaveBeenCalled();
  });

  it('funciona sin token cuando obtenerToken devuelve null', async () => {
    obtenerTokenMock.mockReturnValue(null);
    fetchMock.mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(['csv'])),
    });

    await pedidoAdminService.exportarCsv();

    const [, options] = fetchMock.mock.calls[0];
    const headers = options?.headers as Headers;
    expect(headers.has('Authorization')).toBe(false);
  });
});
