'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Printer, Layers, Package, Sparkles, Building2 } from 'lucide-react'
import { useCompany, nameToSlug } from '@/lib/company-context'
import { toast } from 'sonner'

const COMPANY_BRAND: Record<string, string> = {
  cpp:      '#1B4FDB',
  silvo:    '#0D7490',
  bestfoil: '#92400E',
}

function CompanyIcon({ name, className }: { name: string; className?: string }) {
  const lower = name.toLowerCase()
  if (lower.includes('silvo'))    return <Package   className={className} />
  if (lower.includes('foil'))     return <Sparkles  className={className} />
  if (lower.includes('pre press') || lower.includes('prepress')) return <Layers className={className} />
  return <Printer className={className} />
}

export function CompanySwitcher() {
  const router = useRouter()
  const { selectedCompany, availableCompanies, selectCompany } = useCompany()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  if (availableCompanies.length === 0) return null

  const displayName = selectedCompany?.name ?? availableCompanies[0]?.name ?? 'Company'
  const currentSlug = selectedCompany ? nameToSlug(selectedCompany.name) : 'cpp'

  const handleSelect = async (company: { id: string; name: string }) => {
    if (loading || company.id === selectedCompany?.id) { setIsOpen(false); return }
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

  if (availableCompanies.length === 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
        style={{ backgroundColor: COMPANY_BRAND[currentSlug] + '1A', color: COMPANY_BRAND[currentSlug] }}
      >
        <CompanyIcon name={displayName} className="w-4 h-4 flex-shrink-0" />
        <span className="max-w-[120px] truncate">{displayName}</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        style={{
          backgroundColor: COMPANY_BRAND[currentSlug] + '1A',
          color: COMPANY_BRAND[currentSlug],
        }}
      >
        <CompanyIcon name={displayName} className="w-4 h-4 flex-shrink-0" />
        <span className="max-w-[120px] truncate">{displayName}</span>
        <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-60 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] py-1.5 shadow-[var(--shadow-3)] z-50 overflow-hidden">
            <p className="px-4 pt-1 pb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-tertiary)]">
              Workspaces
            </p>
            {availableCompanies.map((company) => {
              const slug = nameToSlug(company.name)
              const brandColor = COMPANY_BRAND[slug]
              const isSelected = selectedCompany?.id === company.id
              const isLoading = loading === company.id

              return (
                <button
                  key={company.id}
                  onClick={() => handleSelect(company)}
                  disabled={!!loading}
                  className={[
                    'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left',
                    isSelected
                      ? 'font-medium bg-[var(--color-page-bg)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-page-bg)] hover:text-[var(--color-text-primary)]',
                  ].join(' ')}
                  style={isSelected ? { color: brandColor } : undefined}
                >
                  {/* Company brand dot */}
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform"
                    style={{
                      backgroundColor: brandColor,
                      opacity: isSelected ? 1 : 0.45,
                      transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                    }}
                  />

                  <span className="flex-1 truncate">{company.name}</span>

                  {isLoading && (
                    <svg className="w-3.5 h-3.5 animate-spin text-[var(--color-text-tertiary)]" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {isSelected && !isLoading && (
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: brandColor }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
