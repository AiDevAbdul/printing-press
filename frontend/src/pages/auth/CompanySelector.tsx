import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyService, Company } from '../../services/company.service';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/auth.service';

interface CompanyWithMeta extends Company {
  description?: string;
  accentColor?: string;
  icon?: React.ReactNode;
}

const COMPANY_META: Record<string, Omit<CompanyWithMeta, 'id' | 'name'>> = {
  'Capital Packages': {
    description: 'Premium packaging solutions',
    accentColor: 'from-amber-500 to-orange-600',
    icon: '📦',
  },
  'CPP Pre Press': {
    description: 'Design & pre-press services',
    accentColor: 'from-blue-500 to-cyan-600',
    icon: '🎨',
  },
  'BEST FOIL': {
    description: 'Foil stamping & finishing',
    accentColor: 'from-yellow-400 to-amber-500',
    icon: '✨',
  },
  'SILVO Enterprises': {
    description: 'Specialized printing services',
    accentColor: 'from-slate-600 to-slate-700',
    icon: '🖨️',
  },
};

export const CompanySelector: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [companies, setCompanies] = useState<CompanyWithMeta[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loginCompanies = authService.getLoginCompanies();
    const baseCompanies = loginCompanies.length > 0 ? loginCompanies : [
      { id: 'fda5b7ab-a765-44d5-bf82-65ab10f2c8ba', name: 'Capital Packages' },
      { id: '2', name: 'CPP Pre Press' },
      { id: '3', name: 'BEST FOIL' },
      { id: '4', name: 'SILVO Enterprises' },
    ];

    const enrichedCompanies = baseCompanies.map((company) => ({
      ...company,
      ...COMPANY_META[company.name],
    }));

    setCompanies(enrichedCompanies);
  }, []);

  const handleSelectCompany = async (company: CompanyWithMeta) => {
    try {
      setLoading(company.id);
      setError(null);

      const response = await companyService.selectCompany(company.id);

      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);

      companyService.setSelectedCompany(company);
      login(response.user);

      navigate('/dashboard');
    } catch (err) {
      setError('Failed to select company. Please try again.');
      console.error('Company selection error:', err);
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 1px, transparent 2px)',
      }} />

      {/* Header */}
      <div className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-3">
            <h1 className="text-5xl sm:text-6xl font-light tracking-tight text-gray-900">
              Select Your <span className="font-semibold">Workspace</span>
            </h1>
            <p className="text-lg text-gray-500 font-light max-w-2xl">
              Choose which company you'd like to access. Each workspace maintains separate operations and data.
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-5xl mx-auto">
          {/* Error message */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-sm text-red-700 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Company grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {companies.map((company, index) => (
              <button
                key={company.id}
                onClick={() => handleSelectCompany(company)}
                disabled={loading !== null}
                className="group relative text-left transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                {/* Card container */}
                <div className="relative h-full bg-white border border-gray-200 rounded-sm overflow-hidden hover:border-gray-300 transition-all duration-300 hover:shadow-lg">
                  {/* Accent bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${company.accentColor}`} />

                  {/* Content */}
                  <div className="p-8 space-y-6">
                    {/* Icon and header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="text-4xl">{company.icon}</div>
                        <h2 className="text-2xl font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                          {company.name}
                        </h2>
                      </div>

                      {/* Loading spinner */}
                      {loading === company.id && (
                        <div className="flex-shrink-0">
                          <svg className="w-6 h-6 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm font-light leading-relaxed">
                      {company.description}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors pt-2">
                      <span>Access workspace</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>

                  {/* Hover overlay effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50/0 to-gray-50/0 group-hover:from-gray-50/50 group-hover:to-gray-50/0 transition-all duration-300 pointer-events-none" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <p className="text-sm text-gray-500">Printing Press Management System</p>
          <button
            onClick={() => {
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              navigate('/login');
            }}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            Back to Login
          </button>
        </div>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
