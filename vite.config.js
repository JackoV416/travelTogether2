import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // ======================================
  // 🎯 調整 Build 配置以抑制大檔案警告
  // ======================================
  build: {
    // 將警告限制從預設 500kB 提高到 1000kB (1MB)
    // 這樣做可以消除警告，但不會真正優化檔案大小
    chunkSizeWarningLimit: 1000, 
    // 您也可以嘗試將其設置為 2000 (2MB) 或更高，直到警告消失
  },
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: '一起旅行 Travel Together', // 設定全名
        short_name: 'Travel Together', // 手機桌面顯示的短名
        description: '日式極簡・自駕旅遊規劃助手',
        theme_color: '#F7F7F5',
        background_color: '#F7F7F5',
        display: 'standalone', // 讓它看起來像原生 App (無網址列)
        icons: [
          {
            src: 'pwa-192x192.png', // 之後需要補上這些圖示檔案
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})


