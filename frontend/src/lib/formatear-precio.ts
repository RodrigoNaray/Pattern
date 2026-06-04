export function formatearPrecio(centavos: number): string {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    minimumFractionDigits: 0,
  }).format(centavos / 100);
}

export function formatearNumero(valor: number): string {
  return `$ ${valor.toLocaleString('es-UY')}`;
}
