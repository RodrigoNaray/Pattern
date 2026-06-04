import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/__tests__/**',
        'src/**/*.module.css',
        'src/**/types/**',
        'src/app/**',
        'src/services/descargar-archivo.ts',
        'src/services/instrucciones.service.ts',
        'src/services/notificacion.service.ts',
        'src/services/pedido-publico.service.ts',
        'src/services/producto.service.ts',
        'src/services/configuracion.service.ts',
        'src/services/admin-producto.service.ts',
        'src/services/administrador.service.ts',
        'src/services/carrito.service.ts',
        'src/components/carrito/**',
        'src/components/client/**',
        'src/lib/animations.ts',
      ],
      thresholds: {
        statements: 60,
        branches: 55,
        functions: 60,
        lines: 60,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
