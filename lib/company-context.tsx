'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface Company {
  id: string
  name: string
}

interface CompanyContextType {
  selectedCompany: Company | null
  availableCompanies: Company[]
  isLoading: boolean
  selectCompany: (company: Company) => void
  getSelectedCompany: () => Company | null
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [availableCompanies, setAvailableCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load from localStorage
    try {
      const stored = localStorage.getItem('selectedCompany')
      if (stored) {
        setSelectedCompany(JSON.parse(stored))
      }
    } catch (err) {
      console.error('Failed to load company from storage:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Set data-company attribute for CSS theming
    if (selectedCompany) {
      const slug = selectedCompany.name.toLowerCase().replace(/\s+/g, '-')
      document.documentElement.setAttribute('data-company', slug)
      localStorage.setItem('selectedCompany', JSON.stringify(selectedCompany))
    }
  }, [selectedCompany])

  return (
    <CompanyContext.Provider
      value={{
        selectedCompany,
        availableCompanies,
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
  if (!context) {
    throw new Error('useCompany must be used within CompanyProvider')
  }
  return context
}
