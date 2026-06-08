import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Permite importar com @ em vez de ../../..
      // Ex: import { Button } from '@/components/ui/button'
      '@': path.resolve(__dirname, './src'),
    },
  },
})