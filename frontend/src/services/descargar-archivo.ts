export function descargarArchivo(blob: Blob, filename: string): void {
  if (typeof window === 'undefined') {
    throw new Error('descargarArchivo solo puede ejecutarse en el navegador');
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  setTimeout(() => URL.revokeObjectURL(url), 0);
}
