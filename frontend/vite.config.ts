import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks - split by library
          if (id.includes('node_modules/react-dom')) {
            return 'vendor-react-dom'
          }
          if (id.includes('node_modules/react')) {
            return 'vendor-react'
          }
          if (id.includes('node_modules/react-router')) {
            return 'vendor-router'
          }
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'vendor-query'
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons'
          }
          if (id.includes('node_modules/react-hot-toast')) {
            return 'vendor-toast'
          }
          if (id.includes('node_modules/react-hook-form')) {
            return 'vendor-forms'
          }
          if (id.includes('node_modules')) {
            return 'vendor-other'
          }

          // Feature chunks
          if (id.includes('pages/orders')) {
            return 'chunk-orders'
          }
          if (id.includes('pages/production')) {
            return 'chunk-production'
          }
          if (id.includes('pages/quality')) {
            return 'chunk-quality'
          }
          if (id.includes('pages/dispatch')) {
            return 'chunk-dispatch'
          }
          if (id.includes('pages/inventory')) {
            return 'chunk-inventory'
          }
          if (id.includes('pages/customers') || id.includes('pages/quotations')) {
            return 'chunk-sales'
          }
          if (id.includes('pages/dashboard') || id.includes('pages/reports')) {
            return 'chunk-analytics'
          }
          if (id.includes('pages/users') || id.includes('pages/profile')) {
            return 'chunk-users'
          }
          if (id.includes('pages/qa')) {
            return 'chunk-qa'
          }
          if (id.includes('components/ui')) {
            return 'chunk-ui-components'
          }
          if (id.includes('components')) {
            return 'chunk-components'
          }
        },
      },
    },
    chunkSizeWarningLimit: 400,
    minify: 'esbuild',
    sourcemap: false,
  },
})
