import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Tell Vite “public/” is your static-assets folder:
  publicDir: resolve(__dirname, 'public'),

  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        dashboard: resolve(__dirname, 'index.html')
      }
    },
    // assets (CSS/JS chunks) go into `dist/assets/`
    assetsDir: 'assets',
  },

  server: {
    open: '/index.html',
    port: 3000,
    hmr: false,  // turn off websocket errors
  }
});
