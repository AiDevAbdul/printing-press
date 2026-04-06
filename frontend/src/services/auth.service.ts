import api from './api';

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: any;
  companies: Array<{ id: string; name: string }>;
  selected_company?: { id: string; name: string };
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });

    // Store temporary access token for company selection
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }

    // Store companies list for selector
    localStorage.setItem('login_companies', JSON.stringify(response.data.companies));

    return response.data;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('login_companies');
    localStorage.removeItem('selectedCompany');
  },

  async getCurrentUser(): Promise<any> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async refreshToken(): Promise<{ access_token: string }> {
    const response = await api.post('/auth/refresh');
    localStorage.setItem('access_token', response.data.access_token);
    return response.data;
  },

  getStoredUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  storeUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },

  getLoginCompanies(): Array<{ id: string; name: string }> {
    const companies = localStorage.getItem('login_companies');
    return companies ? JSON.parse(companies) : [];
  },

  clearLoginCompanies(): void {
    localStorage.removeItem('login_companies');
  },
};
