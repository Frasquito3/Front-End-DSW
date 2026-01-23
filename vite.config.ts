import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), ...(process.env.CI ? [] : [mkcert()])],
  server: {
    port: 5173,
    host: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
    },
  },
  build: {
    sourcemap: true,
    modulePreload: false, // CRÍTICO: Evita descargas anticipadas innecesarias
    cssCodeSplit: true,   // Asegura que el CSS se divida por chunk
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // 1. EL EDITOR (El más pesado)
          if (
            id.includes('@blocknote') || 
            id.includes('prosemirror') || 
            id.includes('yjs') ||
            id.includes('@mantine') // Mantine suele ir ligado al editor en tu caso
          ) {
            return 'heavy-editor';
          }

          // 2. THREE JS
          if (id.includes('three')) {
            return 'heavy-3d';
          }
          
          // NO TOCAR NADA MÁS. Dejar que React y UI viajen juntos para evitar errores.
        },
      },
    },
  },
  test: {
    // ... (Tu configuración de tests intacta) ...
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    projects: [{
      extends: true,
      plugins: [
        storybookTest({
          configDir: path.join(dirname, '.storybook')
        })
      ],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        },
        setupFiles: ['.storybook/vitest.setup.ts']
      }
    }]
  }
});