// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://legally-actual-mollusk.ngrok-free.app',
        changeOrigin: true,
        secure: false, // Bỏ qua kiểm tra SSL (cho ngrok)
        rewrite: (path) => path.replace(/^\/api/, ''), // Loại bỏ prefix /api nếu cần
      },
    },
  },
});