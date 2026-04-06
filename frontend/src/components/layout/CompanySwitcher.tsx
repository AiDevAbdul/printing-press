import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { companyService, Company } from '../../services/company.service';

export const CompanySwitcher: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCompany } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const companies: Company[] = [
    { id: '1', name: 'Capital Packages' },
    { id: '2', name: 'CPP Pre Press' },
    { id: '3', name: 'BEST FOIL' },
    { id: '4', name: 'SILVO Enterprises' },
  ];

  const handleSelectCompany = async (company: Company) => {
    if (company.id === selectedCompany?.id) {
      setIsOpen(false);
      return;
    }

    try {
      setLoading(company.id);

      // Call backend to select company and get JWT with company_id
      const response = await companyService.selectCompany(company.id);

      // Store tokens
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);

      // Store selected company
      companyService.setSelectedCompany(company);

      // Invalidate React Query cache to refresh all data
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Company switch error:', err);
    } finally {
      setLoading(null);
    }
  };

  if (!selectedCompany) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors text-sm font-medium text-white"
      >
        <div className="w-2 h-2 rounded-full bg-blue-400" />
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
        <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-lg shadow-lg border border-slate-700 z-50">
          <div className="p-2">
            {companies.map((company) => (
              <button
                key={company.id}
                onClick={() => handleSelectCompany(company)}
                disabled={loading !== null}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                  company.id === selectedCompany.id
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'hover:bg-slate-700 text-slate-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="text-sm">{company.name}</span>
                {company.id === selectedCompany.id && (
                  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {loading === company.id && (
                  <div className="animate-spin">
                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
