import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 設置基礎路徑為根目錄，確保 Vercel 部署時資源能正確載入。
  base: '/',
  build: {
    // Vite 預設的輸出目錄就是 'dist'
    outDir: 'dist', 
    sourcemap: false,
  },
  server: {
    port: 3000,
  }
});
