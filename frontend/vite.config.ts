import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-ui': ['lucide-react', 'react-hot-toast'],

          // Feature chunks
          'chunk-orders': [
            './src/pages/orders/Orders.tsx',
            './src/pages/orders/OrdersGrid.tsx',
            './src/pages/orders/OrdersKanban.tsx',
            './src/pages/orders/OrderForm.tsx',
          ],
          'chunk-production': [
            './src/pages/production/Production.tsx',
            './src/pages/production/ProductionGrid.tsx',
            './src/pages/production/ProductionKanban.tsx',
          ],
          'chunk-quality': [
            './src/pages/quality/Quality.tsx',
            './src/pages/quality/InspectionsGrid.tsx',
            './src/pages/quality/ComplaintsGrid.tsx',
            './src/pages/quality/RejectionsGrid.tsx',
          ],
          'chunk-dispatch': [
            './src/pages/dispatch/Dispatch.tsx',
            './src/pages/dispatch/DispatchGrid.tsx',
            './src/pages/dispatch/DispatchTimeline.tsx',
          ],
          'chunk-inventory': [
            './src/pages/inventory/Inventory.tsx',
            './src/pages/inventory/InventoryGrid.tsx',
          ],
          'chunk-sales': [
            './src/pages/customers/Customers.tsx',
            './src/pages/customers/CustomersGrid.tsx',
            './src/pages/quotations/Quotations.tsx',
            './src/pages/quotations/QuotationsGrid.tsx',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
  },
})
