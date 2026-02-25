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
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-i18next',
      'i18next',
      'lucide-react',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/storage',
      'canvas-confetti',
      'clsx',
      'tailwind-merge',
      'date-fns',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      '@dnd-kit/utilities',
      '@tiptap/react',
      '@tiptap/starter-kit',
      '@tiptap/extension-underline',
      '@tiptap/extension-text-align',
      '@tiptap/extension-link',
      '@tiptap/extension-placeholder',
      'react-day-picker',
      'tesseract.js',
      'leaflet',
      'react-leaflet'
    ]
  },
  server: {
    port: 5175,
    strictPort: true,
    host: true,
    hmr: {
      overlay: true // Re-enable overlay for better debugging
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'unsafe-none',
      'Cross-Origin-Embedder-Policy': 'unsafe-none'
    }
  },
  appType: 'spa',
  build: {
    chunkSizeWarningLimit: 1200, // Slightly higher for this project
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`
      }
    }
  },
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __APP_VERSION__: JSON.stringify('V2.0.7')
  }
})
// Force Restart: Tue Feb 24 12:05:41 HKT 2026
