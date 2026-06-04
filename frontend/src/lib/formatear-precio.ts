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

export function formatearFecha(valor: string | Date): string {
  const fecha = typeof valor === 'string' ? new Date(valor) : valor;
  return new Intl.DateTimeFormat('es-UY', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(fecha);
}
