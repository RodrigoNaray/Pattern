import { describe, it, expect } from 'vitest';

function formatearPrecio(centavos: number): string {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
  }).format(centavos / 100);
}

describe('formatearPrecio', () => {
  it('formatea centavos a UYU correctamente', () => {
    const result = formatearPrecio(15000);
    expect(result).toContain('150');
    expect(result).toContain(',');
  });

  it('formatea cero', () => {
    const result = formatearPrecio(0);
    expect(result).toContain('0');
  });

  it('formatea valores grandes', () => {
    const result = formatearPrecio(150000);
    expect(result).toContain('1.500');
  });
});
