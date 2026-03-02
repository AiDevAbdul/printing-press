const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const exportService = {
  downloadWastageAnalytics: (startDate: string, endDate: string) => {
    window.open(
      `${API_URL}/export/wastage-analytics?startDate=${startDate}&endDate=${endDate}`,
      '_blank'
    );
  },

  downloadQualityMetrics: (startDate: string, endDate: string) => {
    window.open(
      `${API_URL}/export/quality-metrics?startDate=${startDate}&endDate=${endDate}`,
      '_blank'
    );
  },

  downloadDashboardStats: () => {
    window.open(`${API_URL}/export/dashboard-stats`, '_blank');
  },
};
