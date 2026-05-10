'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, Building2 } from 'lucide-react'
import { useCompany } from '@/lib/company-context'
import { toast } from 'sonner'

export function CompanySwitcher() {
  const router = useRouter()
  const { selectedCompany, selectCompany } = useCompany()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  const { data: meData } = useQuery<{ companies: { id: string; name: string }[] } | null>({
    queryKey: ['current-user'],
    staleTime: 5 * 60 * 1000,
  })

  const companies = meData?.companies ?? []

  if (companies.length === 0) return null

  const displayName = selectedCompany?.name ?? companies[0]?.name ?? 'Company'

  const handleSelect = async (company: { id: string; name: string }) => {
    if (loading) return
    try {
      setLoading(company.id)
      const res = await fetch('/api/auth/select-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: company.id }),
        credentials: 'include',
      })
      if (!res.ok) throw new Error()
      selectCompany(company)
      setIsOpen(false)
      toast.success(`Switched to ${company.name}`)
      router.refresh()
    } catch {
      toast.error('Failed to switch company')
    } finally {
      setLoading(null)
    }
  }

  if (companies.length === 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand/10 text-brand text-sm font-medium">
        <Building2 className="w-4 h-4 flex-shrink-0" />
        <span className="max-w-[120px] truncate">{displayName}</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand/10 text-brand hover:bg-brand/20 transition-colors text-sm font-medium"
      >
        <Building2 className="w-4 h-4 flex-shrink-0" />
        <span className="max-w-[120px] truncate">{displayName}</span>
        <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-surface rounded-xl border border-border py-1 shadow-3 z-50 overflow-hidden">
            {companies.map((company) => (
              <button
                key={company.id}
                onClick={() => handleSelect(company)}
                disabled={!!loading}
                className={[
                  'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left',
                  selectedCompany?.id === company.id
                    ? 'text-brand font-medium bg-brand/5'
                    : 'text-text-secondary hover:bg-page-bg hover:text-text-primary',
                ].join(' ')}
              >
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${selectedCompany?.id === company.id ? 'bg-brand' : 'bg-border'}`}
                />
                <span className="flex-1 truncate">{company.name}</span>
                {loading === company.id && (
                  <span className="text-xs text-text-tertiary">...</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
