import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return { Authorization: `Bearer ${token}` };
};

export interface Delivery {
  id: string;
  delivery_number: string;
  job: {
    job_number: string;
    order: {
      product_name: string;
    };
  };
  customer: {
    company_name: string;
  };
  delivery_status: string;
  delivery_type: string;
  scheduled_date: string;
  packed_at: string;
  dispatched_at: string;
  delivered_at: string;
  courier_name: string;
  tracking_number: string;
  vehicle_number: string;
  driver_name: string;
  delivery_address: string;
  pod_photo_url: string;
  received_by_name: string;
  packing_lists: PackingListItem[];
  tracking_history: TrackingUpdate[];
  created_at: string;
}

export interface PackingListItem {
  id: string;
  box_number: number;
  item_description: string;
  quantity: number;
  unit: string;
  weight_kg: number;
  notes: string;
}

export interface TrackingUpdate {
  id: string;
  status: string;
  location: string;
  notes: string;
  updated_by: {
    full_name: string;
  };
  created_at: string;
}

export interface Challan {
  id: string;
  challan_number: string;
  challan_date: string;
  delivery: Delivery;
  terms_and_conditions: string;
  notes: string;
}

export const dispatchService = {
  async createDelivery(data: any): Promise<Delivery> {
    const response = await axios.post(`${API_URL}/dispatch/deliveries`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async getDeliveries(filters?: {
    status?: string;
    customer_id?: string;
    from_date?: string;
    to_date?: string;
  }): Promise<{ data: Delivery[]; total: number }> {
    const response = await axios.get(`${API_URL}/dispatch/deliveries`, {
      headers: getAuthHeader(),
      params: filters,
    });
    return response.data;
  },

  async getDelivery(id: string): Promise<Delivery> {
    const response = await axios.get(`${API_URL}/dispatch/deliveries/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async updateDelivery(id: string, data: any): Promise<Delivery> {
    const response = await axios.patch(`${API_URL}/dispatch/deliveries/${id}`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async markAsPacked(id: string, packingList: any[]): Promise<Delivery> {
    const response = await axios.post(
      `${API_URL}/dispatch/deliveries/${id}/pack`,
      { packing_list: packingList },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  async dispatch(id: string, data: any): Promise<Delivery> {
    const response = await axios.post(`${API_URL}/dispatch/deliveries/${id}/dispatch`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async markAsDelivered(id: string, data: any, podPhoto?: File): Promise<Delivery> {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });
    if (podPhoto) {
      formData.append('pod_photo', podPhoto);
    }

    const response = await axios.post(`${API_URL}/dispatch/deliveries/${id}/deliver`, formData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async uploadPOD(id: string, photo: File): Promise<Delivery> {
    const formData = new FormData();
    formData.append('pod_photo', photo);

    const response = await axios.post(`${API_URL}/dispatch/deliveries/${id}/upload-pod`, formData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async addTrackingUpdate(id: string, data: any): Promise<TrackingUpdate> {
    const response = await axios.post(`${API_URL}/dispatch/deliveries/${id}/track`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async getTrackingHistory(id: string): Promise<TrackingUpdate[]> {
    const response = await axios.get(`${API_URL}/dispatch/deliveries/${id}/tracking-history`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async generateChallan(id: string, data: any): Promise<Challan> {
    const response = await axios.post(`${API_URL}/dispatch/deliveries/${id}/challan`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async getChallan(id: string): Promise<Challan> {
    const response = await axios.get(`${API_URL}/dispatch/deliveries/${id}/challan`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async getMetrics(startDate?: string, endDate?: string): Promise<any> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await axios.get(`${API_URL}/dispatch/metrics`, {
      headers: getAuthHeader(),
      params,
    });
    return response.data;
  },
};
