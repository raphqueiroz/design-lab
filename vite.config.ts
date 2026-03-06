import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import flowFilesPlugin from './vite-plugin-flow-files'

export default defineConfig({
  plugins: [react(), tailwindcss(), flowFilesPlugin()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
