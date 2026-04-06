import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyService, Company } from '../../services/company.service';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/auth.service';

export const CompanySelector: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    // Get companies from login response stored in localStorage
    const loginCompanies = authService.getLoginCompanies();
    if (loginCompanies.length > 0) {
      setCompanies(loginCompanies);
    } else {
      // Fallback to hardcoded companies if not available
      setCompanies([
        { id: 'fda5b7ab-a765-44d5-bf82-65ab10f2c8ba', name: 'Capital Packages' },
        { id: '2', name: 'CPP Pre Press' },
        { id: '3', name: 'BEST FOIL' },
        { id: '4', name: 'SILVO Enterprises' },
      ]);
    }
  }, []);

  const handleSelectCompany = async (company: Company) => {
    try {
      setLoading(company.id);
      setError(null);

      // Call backend to select company and get JWT with company_id
      const response = await companyService.selectCompany(company.id);

      // Store tokens
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);

      // Store selected company
      companyService.setSelectedCompany(company);

      // Update auth context
      login(response.user);

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to select company. Please try again.');
      console.error('Company selection error:', err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Select Your Company</h1>
          <p className="text-slate-400">Choose which company you'd like to access</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {companies.map((company) => (
            <button
              key={company.id}
              onClick={() => handleSelectCompany(company)}
              disabled={loading !== null}
              className="group relative overflow-hidden rounded-lg bg-slate-800 p-8 text-left transition-all hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700 hover:border-slate-600"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-blue-500/5 transition-all" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {company.name}
                  </h2>
                  {loading === company.id && (
                    <div className="animate-spin">
                      <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                  )}
                </div>

                <p className="text-slate-400 text-sm mb-4">
                  Click to access this company's dashboard
                </p>

                <div className="flex items-center text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                  Select Company
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => {
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              navigate('/login');
            }}
            className="text-slate-400 hover:text-slate-300 text-sm transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};
