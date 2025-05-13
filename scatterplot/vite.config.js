import { defineConfig } from 'vite';
import { resolve } from 'path';
// Set the BROWSER environment variable (optional)
process.env.BROWSER = 'chrome'; // or 'google-chrome', depending on your OS
export default defineConfig({
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  publicDir: resolve(__dirname, 'public'), 

  server: {
    hmr:  { overlay: true },
    open: true,
    port: 3000
  }
});
