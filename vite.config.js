import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Travel Together - 智能旅遊規劃',
        short_name: 'TravelTogether',
        description: '智能旅遊規劃助手，輕鬆規劃您的完美旅程',
        theme_color: '#020617', // Match Slate 950
        background_color: '#020617',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        categories: ['travel', 'lifestyle', 'productivity'],
        icons: [
          {
            src: '/pwa-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/pwa-icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'maskable'
          },
          {
            src: '/pwa-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ],
        shortcuts: [
          {
            name: "我的行程",
            short_name: "行程",
            description: "查看所有行程",
            url: "/?view=dashboard",
            icons: [{ src: "/pwa-icon.svg", sizes: "96x96", type: "image/svg+xml" }]
          },
          {
            name: "新增行程",
            short_name: "新增",
            description: "建立新的旅程",
            url: "/?action=create",
            icons: [{ src: "/pwa-icon.svg", sizes: "96x96", type: "image/svg+xml" }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'firebase-storage-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 5174,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5174
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none'
    }
  },
  appType: 'spa', // Ensure SPA fallback for client-side routing
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        /* manualChunks: {
          'react-core': ['react', 'react-dom', 'react-router-dom', 'react-i18next'],
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          'icons': ['lucide-react'],
          'export-libs': ['html2canvas', 'jspdf'],
          'ai-engine': ['@google/generative-ai', 'tesseract.js'],
          'charts': ['recharts'],
          'editor': ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-underline', '@tiptap/extension-link']
        }, */
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`
      }
    }
  },
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __APP_VERSION__: JSON.stringify('V1.8.3')
  }
})
// Force Restart: Mon Jan 12 16:56:41 HKT 2026
