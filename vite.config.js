import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-charts': ['chart.js', 'react-chartjs-2'],
          'vendor-icons': ['lucide-react'],
          'vendor-react': ['react', 'react-dom']
        }
      }
    }
  }
})
