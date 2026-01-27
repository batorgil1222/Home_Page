import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Teso-ийн дата татах proxy
      '/api-teso': {
        target: 'https://teso.mn',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-teso/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Referer', 'https://teso.mn/');
            proxyReq.setHeader('Origin', 'https://teso.mn');
          });
        }
      },
      // Зураг татах proxy
      '/api-images': {
        target: 'https://core-api.teso.mn:8088',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-images/, ''),
      }
    }
  }
})