import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // This is important for SPA routing
  build: {
    outDir: 'dist',
    sourcemap: false // Disable sourcemaps for smaller build
  },
  server: {
    port: 3000,
    open: true
  }
})
