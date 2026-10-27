import glsl from 'vite-plugin-glsl';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [glsl()],
  server: {
    allowedHosts: true,
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
    proxy: {
      '/api/public': {
        target: 'https://www.mrsaqib.me',
        changeOrigin: true,
        secure: true,
        headers: {
          Origin: 'https://www.mrsaqib.me',
          Referer: 'https://www.mrsaqib.me/',
        },
      },
    },
  },
  preview: {
    allowedHosts: true,
  },
});


