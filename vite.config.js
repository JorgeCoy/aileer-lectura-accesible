import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/aileer-lectura-accesible/",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar librerías grandes en chunks separados
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', '@heroicons/react', 'use-debounce'],
          'utils-vendor': ['tesseract.js']
        }
      }
    },
    // Habilitar compresión
    reportCompressedSize: true,
    // Optimizar chunks
    chunkSizeWarningLimit: 1000,
    // Optimizaciones adicionales
    minify: 'esbuild',
    sourcemap: false, // Deshabilitar sourcemaps en producción para reducir tamaño
    cssCodeSplit: true // Separar CSS en chunks
  },
  // Optimizaciones adicionales de performance
  esbuild: {
    drop: ['console', 'debugger'], // Remover console.log en producción
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      // Configuración offline-first para funcionamiento sin internet
      workbox: {
        // Precachear todos los recursos críticos
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,woff2}',
          'pdf-worker/*',
          'fonts/*'
        ],
        // Excluir recursos no críticos
        globIgnores: ['**/sounds/**'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB max por archivo

        // Estrategia de cache agresiva para recursos críticos
        runtimeCaching: [
          {
            // PDFs procesados localmente (no externos)
            urlPattern: /\/pdf-worker\/.*\.mjs$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pdf-worker-cache',
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
              }
            }
          },
          {
            // Fuentes locales
            urlPattern: /\.(woff2|woff|ttf)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
              }
            }
          }
        ],

        // Modo offline - fallback para navegación
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/]
      },
      manifest: {
        name: 'aLeer - Lectura Accesible',
        short_name: 'aLeer',
        description: 'Herramienta de lectura accesible y entrenamiento visual',
        theme_color: '#ffffff',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})