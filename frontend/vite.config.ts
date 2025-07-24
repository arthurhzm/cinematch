import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      
      manifest: {
        name: 'CineMatch',
        short_name: 'CineMatch',
        description: 'CineMatch é um aplicativo de recomendação de filmes que utiliza inteligência artificial para sugerir filmes com base em suas preferências.',
        theme_color: '#1a202c',
        icons: [
          {
            src: 'icon-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: 'icon-128x128.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-256x256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon-1024x1024.png',
            sizes: '1024x1024',
            type: 'image/png'
          }
        ],
        display: 'fullscreen',
        orientation: 'portrait-primary'
      }
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

})