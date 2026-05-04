'use client'

import { useRouter } from 'next/navigation'
import { useCompany } from '@/lib/company-context'
import { useState } from 'react'
import { toast } from 'sonner'

export function CompanySwitcher() {
  const router = useRouter()
  const { selectedCompany } = useCompany()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  if (!selectedCompany) return null

  const handleSelectCompany = async (companyId: string) => {
    try {
      setLoading(companyId)

      const response = await fetch('/api/auth/select-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId }),
        credentials: 'include',
      })

      if (!response.ok) throw new Error('Failed to select company')

      setIsOpen(false)
      toast.success('Company switched')
      router.refresh()
    } catch (err) {
      console.error('Company switch error:', err)
      toast.error('Failed to switch company')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand hover:bg-brand/90 transition-colors text-sm font-medium text-white"
      >
        <div className="w-2 h-2 rounded-full bg-white/50" />
        {selectedCompany.name}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-surface rounded-lg shadow-3 border border-border z-50">
          <div className="p-2">
            {/* Note: Companies list would be fetched from API */}
            {/* For now, showing placeholder */}
            <p className="px-4 py-2 text-sm text-text-secondary">Loading companies...</p>
          </div>
        </div>
      )}
    </div>
  )
}
