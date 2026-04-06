import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Company {
  id: string;
  name: string;
}

interface CompanyContextType {
  selectedCompany: Company | null;
  availableCompanies: Company[];
  isLoadingCompanies: boolean;
  selectCompany: (company: Company) => void;
  getSelectedCompany: () => Company | null;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Load selected company from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('selectedCompany');
    if (stored) {
      try {
        setSelectedCompany(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored company:', e);
      }
    }
  }, []);

  const selectCompany = (company: Company) => {
    setSelectedCompany(company);
    localStorage.setItem('selectedCompany', JSON.stringify(company));
  };

  const getSelectedCompany = (): Company | null => {
    return selectedCompany;
  };

  const value: CompanyContextType = {
    selectedCompany,
    availableCompanies: [],
    isLoadingCompanies: false,
    selectCompany,
    getSelectedCompany,
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = (): CompanyContextType => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within CompanyProvider');
  }
  return context;
};
