import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface WastageByType {
  type: string;
  count: number;
  cost: number;
}

export interface WastageByStage {
  stage: string;
  quantity: number;
  cost: number;
}

export interface WastageAnalytics {
  wastageByType: WastageByType[];
  wastageByStage: WastageByStage[];
  summary: {
    totalWastage: number;
    totalCost: number;
    avgCostPerIncident: number;
  };
}

export const wastageService = {
  getAnalytics: async (startDate: string, endDate: string): Promise<WastageAnalytics> => {
    const response = await axios.get(`${API_URL}/production/wastage-analytics`, {
      params: { startDate, endDate },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    return response.data;
  },
};
