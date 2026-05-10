'use client'

import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { CompanyProvider } from '@/lib/company-context'

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof Error && error.message.includes('401')) {
        window.location.href = '/login'
      }
    },
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes('401')) return false
        return failureCount < 1
      },
    },
  },
})

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <CompanyProvider>
        {children}
        <Toaster position="top-right" richColors />
      </CompanyProvider>
    </QueryClientProvider>
  )
}
