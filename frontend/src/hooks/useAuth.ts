import { useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { companyService, Company } from '../services/company.service';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    const storedUser = authService.getStoredUser();
    if (storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }

    const stored = companyService.getSelectedCompany();
    if (stored) {
      setSelectedCompany(stored);
    }

    setIsLoading(false);
  }, []);

  const login = (userData: any) => {
    setUser(userData);
    setIsAuthenticated(true);
    authService.storeUser(userData);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setSelectedCompany(null);
    companyService.clearSelectedCompany();
  };

  const selectCompany = (company: Company) => {
    setSelectedCompany(company);
    companyService.setSelectedCompany(company);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    selectedCompany,
    login,
    logout,
    selectCompany,
  };
};
