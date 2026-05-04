import api from './api';

export interface Company {
  id: string;
  name: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  };
  companies: Company[];
  selected_company?: Company;
}

export interface SelectCompanyResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
    company_id: string;
  };
}

export const companyService = {
  async getCompanies(): Promise<Company[]> {
    const response = await api.get('/companies');
    return response.data;
  },

  async selectCompany(companyId: string): Promise<SelectCompanyResponse> {
    const response = await api.post('/auth/select-company', { company_id: companyId });
    return response.data;
  },

  getSelectedCompany(): Company | null {
    const stored = localStorage.getItem('selectedCompany');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored company:', e);
        return null;
      }
    }
    return null;
  },

  setSelectedCompany(company: Company): void {
    localStorage.setItem('selectedCompany', JSON.stringify(company));
  },

  getSelectedCompanyId(): string | null {
    const company = this.getSelectedCompany();
    return company ? company.id : null;
  },

  clearSelectedCompany(): void {
    localStorage.removeItem('selectedCompany');
  },
};
