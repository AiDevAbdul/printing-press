'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface Company {
  id: string
  name: string
}

export type CompanySlug = 'cpp' | 'silvo' | 'bestfoil'

interface CompanyContextType {
  selectedCompany: Company | null
  availableCompanies: Company[]
  companySlug: CompanySlug
  isLoading: boolean
  selectCompany: (company: Company) => void
  getSelectedCompany: () => Company | null
}

export function nameToSlug(name: string): CompanySlug {
  const lower = name.toLowerCase()
  if (lower.includes('silvo')) return 'silvo'
  if (lower.includes('foil')) return 'bestfoil'
  return 'cpp'
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [availableCompanies, setAvailableCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          const currentId: string | undefined = data.user?.companyId
          const companies: Company[] = data.companies ?? []
          setAvailableCompanies(companies)

          const current = companies.find(c => c.id === currentId) ?? companies[0] ?? null
          if (current) setSelectedCompany(current)
          return
        }
      } catch {
        // network failure — fall through to localStorage
      }

      // Fallback: localStorage from a previous session
      try {
        const stored = localStorage.getItem('selectedCompany')
        if (stored) setSelectedCompany(JSON.parse(stored))
      } catch {}

      setIsLoading(false)
    }

    init().finally(() => setIsLoading(false))
  }, [])

  const companySlug: CompanySlug = selectedCompany
    ? nameToSlug(selectedCompany.name)
    : 'cpp'

  useEffect(() => {
    document.documentElement.setAttribute('data-company', companySlug)
    if (selectedCompany) {
      localStorage.setItem('selectedCompany', JSON.stringify(selectedCompany))
    }
  }, [companySlug, selectedCompany])

  return (
    <CompanyContext.Provider
      value={{
        selectedCompany,
        availableCompanies,
        companySlug,
        isLoading,
        selectCompany: setSelectedCompany,
        getSelectedCompany: () => selectedCompany,
      }}
    >
      {children}
    </CompanyContext.Provider>
  )
}

export function useCompany() {
  const context = useContext(CompanyContext)
  if (!context) throw new Error('useCompany must be used within CompanyProvider')
  return context
}
