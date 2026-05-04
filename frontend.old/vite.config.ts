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
  optimizeDeps: {
    include: ['react', 'react-dom', 'scheduler'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React + scheduler - must be together
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/scheduler/')) {
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
          if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform')) {
            return 'vendor-forms'
          }
          if (id.includes('node_modules')) {
            return 'vendor-other'
          }
        },
      },
    },
    chunkSizeWarningLimit: 400,
    minify: 'esbuild',
    sourcemap: false,
  },
})
