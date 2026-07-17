import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      manifest: {
        name: 'Vitrine Popular',
        short_name: 'Vitrine',
        description: 'Vitrine de ofertas do comércio popular de Picos-PI',
        theme_color: '#B14F26',
        background_color: '#FBF9F5',
        display: 'standalone',
        start_url: '/',
        lang: 'pt-BR',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-512x512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Inclui .woff2 no precache — as fontes self-hospedadas (Fraunces/Plus
        // Jakarta Sans variable) viram assets do build e precisam ficar
        // disponíveis offline como qualquer outro asset estático.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2}'],
        runtimeCaching: [
          // Assets estáticos do próprio build (JS/CSS gerados pelo Vite)
          {
            urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style',
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
          // Imagens hospedadas no Cloudinary (fotos das ofertas)
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'cloudinary-images',
              expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
          // GETs públicos da API — permite feed/lojas/categorias básicos offline
          {
            urlPattern: ({ url, request }) =>
              request.method === 'GET' &&
              /\/api\/(ofertas|lojas|categorias)(\/|\?|$)/.test(url.pathname + url.search),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-publica',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      // Permite importar com @ em vez de ../../..
      // Ex: import { Button } from '@/components/ui/button'
      '@': path.resolve(__dirname, './src'),
    },
  },
})