import { defineConfig } from 'electron-vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  main: {
    build: {
      outDir: 'dist/main',
      lib: {
        entry: 'electron/main/main.js',
      },
    },
  },

  preload: {
    build: {
      outDir: 'dist/preload',
      lib: {
        entry: 'electron/preload/preload.js',
      },
    },
  },

  renderer: {
    root: 'src/renderer',
    plugins: [react()],

    server: {
      host: true,
      port: 5173,
    },

    build: {
      outDir: 'dist/renderer',
      rollupOptions: {
        input: 'src/renderer/index.html',
      },
    },
  },
});