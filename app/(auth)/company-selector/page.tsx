'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Printer, Layers, Package, Sparkles, Building2, ArrowRight, Loader } from 'lucide-react'

interface Company {
  id: string
  name: string
}

interface CompanyWithMeta extends Company {
  description: string
  accentColor: string
  Icon: React.ElementType
}

const COMPANY_META: Record<string, Omit<CompanyWithMeta, 'id' | 'name'>> = {
  'Capital Packages': {
    description: 'Premium carton packaging and print production',
    accentColor: '#1B4FDB',
    Icon: Printer,
  },
  'CPP Pre Press': {
    description: 'Design, pre-press, and plate-making services',
    accentColor: '#1B4FDB',
    Icon: Layers,
  },
  'BEST FOIL': {
    description: 'Luxury foil stamping and finishing',
    accentColor: '#92400E',
    Icon: Sparkles,
  },
  'SILVO Enterprises': {
    description: 'Alu-alu foil and pharmaceutical blister packaging',
    accentColor: '#0D7490',
    Icon: Package,
  },
}

const DEFAULT_META = {
  description: 'Printing and packaging services',
  accentColor: 'var(--color-brand)',
  Icon: Building2,
}

export default function CompanySelector() {
  const router = useRouter()
  const [companies, setCompanies] = useState<CompanyWithMeta[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' })
        if (!response.ok) throw new Error('Failed to fetch companies')
        const data = await response.json()

        const enriched = (data.companies || []).map((c: Company) => ({
          ...c,
          ...(COMPANY_META[c.name] ?? DEFAULT_META),
        }))
        setCompanies(enriched)
      } catch {
        setError('Failed to load companies. Please refresh the page.')
        toast.error('Failed to load companies')
      } finally {
        setIsInitializing(false)
      }
    }
    fetchCompanies()
  }, [])

  const handleSelectCompany = async (company: CompanyWithMeta) => {
    try {
      setLoading(company.id)
      setError(null)

      const response = await fetch('/api/auth/select-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: company.id }),
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to select company')
      }

      toast.success(`Switched to ${company.name}`)
      router.push('/dashboard')
    } catch (err: any) {
      const message = err.message || 'Failed to select company. Please try again.'
      setError(message)
      toast.error(message)
      setLoading(null)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } finally {
      router.push('/login')
    }
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-page-bg)]">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-7 h-7 text-[var(--color-brand)] animate-spin" />
          <p className="text-sm text-[var(--color-text-secondary)]">Loading workspaces…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-page-bg)] flex flex-col">

      {/* Header */}
      <header className="px-6 sm:px-10 lg:px-16 pt-14 pb-10">
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-brand)]">
            PrintFlow
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--color-text-primary)] tracking-tight leading-[1.1]">
            Select workspace
          </h1>
          <p className="text-base text-[var(--color-text-secondary)] pt-1 max-w-lg leading-relaxed">
            Each workspace maintains separate operations and data.
          </p>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div className="px-6 sm:px-10 lg:px-16 mb-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[var(--color-danger-bg)] border border-[var(--color-danger)]/20">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-danger)] flex-shrink-0" />
              <p className="text-sm text-[var(--color-danger)]">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Company grid */}
      <main className="flex-1 px-6 sm:px-10 lg:px-16 pb-12">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {companies.map((company, i) => {
            const { Icon } = company
            const isLoading = loading === company.id
            const disabled = loading !== null

            return (
              <button
                key={company.id}
                onClick={() => handleSelectCompany(company)}
                disabled={disabled}
                className="group text-left rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-brand)] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 overflow-hidden"
                style={{
                  animationDelay: `${i * 60}ms`,
                  animation: 'fadeUp 0.4s ease both',
                }}
              >
                {/* Accent bar */}
                <div className="h-1 w-full" style={{ backgroundColor: company.accentColor }} />

                <div className="p-6 space-y-5">
                  {/* Icon + spinner row */}
                  <div className="flex items-start justify-between">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: company.accentColor + '1A' }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{ color: company.accentColor }}
                      />
                    </div>
                    {isLoading && (
                      <Loader className="w-5 h-5 animate-spin text-[var(--color-text-tertiary)]" />
                    )}
                  </div>

                  {/* Name + description */}
                  <div className="space-y-1">
                    <h2 className="text-base font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand)] transition-colors leading-tight">
                      {company.name}
                    </h2>
                    <p className="text-sm text-[var(--color-text-secondary)] leading-snug">
                      {company.description}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-tertiary)] group-hover:text-[var(--color-brand)] transition-colors">
                    <span>Access workspace</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 sm:px-10 lg:px-16 py-5 border-t border-[var(--color-border-subtle)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <p className="text-xs text-[var(--color-text-tertiary)]">
            Printing Press Management System
          </p>
          <button
            onClick={handleLogout}
            className="text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            Sign out
          </button>
        </div>
      </footer>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
