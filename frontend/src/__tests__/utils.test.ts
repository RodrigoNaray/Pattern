import { describe, it, expect } from 'vitest';
import { formatearPrecio, formatearNumero, formatearFecha } from '@/lib/formatear-precio';

describe('formatearPrecio', () => {
  it('formatea centavos a UYU con simbolo $', () => {
    const result = formatearPrecio(15000);
    expect(result).toMatch(/\$|UYU/);
    expect(result).toContain('150');
  });

  it('formatea cero', () => {
    const result = formatearPrecio(0);
    expect(result).toMatch(/0/);
  });

  it('no incluye decimales cuando el valor es entero (minimumFractionDigits: 0)', () => {
    const result = formatearPrecio(150000);
    expect(result).toContain('1.500');
    expect(result).not.toContain(',00');
  });
});

describe('formatearNumero', () => {
  it('formatea enteros con separador de miles es-UY', () => {
    expect(formatearNumero(1500)).toMatch(/1\.500/);
  });

  it('agrega prefijo "$ "', () => {
    expect(formatearNumero(100)).toMatch(/\$\s?100/);
  });
});

describe('formatearFecha', () => {
  it('formatea Date object a dd/mm/yyyy HH:mm', () => {
    const fecha = new Date('2026-06-04T15:30:00.000Z');
    const result = formatearFecha(fecha);
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('acepta string ISO como input', () => {
    const result = formatearFecha('2026-01-15T10:00:00.000Z');
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});
