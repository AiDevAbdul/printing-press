import axios, { AxiosInstance } from 'axios';
import { AuthToken, MCPError } from './types.js';

export class PrintingPressAPIClient {
  private client: AxiosInstance;
  private authToken: AuthToken | null = null;
  private companyId: string | null = null;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.authToken = null;
        }
        throw error;
      }
    );
  }

  async login(email: string, password: string): Promise<AuthToken> {
    try {
      const response = await this.client.post('/auth/login', { email, password });
      this.authToken = response.data;
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'LOGIN_FAILED');
    }
  }

  async selectCompany(companyId: string): Promise<AuthToken> {
    if (!this.authToken) {
      throw this.createError('NOT_AUTHENTICATED', 'Must login first');
    }

    try {
      const response = await this.client.post(
        '/auth/select-company',
        { company_id: companyId },
        { headers: this.getAuthHeaders() }
      );
      this.authToken = response.data;
      this.companyId = companyId;
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'SELECT_COMPANY_FAILED');
    }
  }

  async getOrders(filters?: {
    status?: string;
    customerId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.customerId) params.append('customerId', filters.customerId);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await this.client.get('/orders', {
        params: Object.fromEntries(params),
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'GET_ORDERS_FAILED');
    }
  }

  async getOrder(id: string): Promise<any> {
    try {
      const response = await this.client.get(`/orders/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'GET_ORDER_FAILED');
    }
  }

  async createOrder(orderData: any): Promise<any> {
    try {
      const response = await this.client.post('/orders', orderData, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'CREATE_ORDER_FAILED');
    }
  }

  async updateOrder(id: string, updateData: any): Promise<any> {
    try {
      const response = await this.client.patch(`/orders/${id}`, updateData, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'UPDATE_ORDER_FAILED');
    }
  }

  async getQuotations(filters?: {
    status?: string;
    customer_id?: string;
    search?: string;
    from_date?: string;
    to_date?: string;
  }): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.customer_id) params.append('customer_id', filters.customer_id);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.from_date) params.append('from_date', filters.from_date);
      if (filters?.to_date) params.append('to_date', filters.to_date);

      const response = await this.client.get('/quotations', {
        params: Object.fromEntries(params),
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'GET_QUOTATIONS_FAILED');
    }
  }

  async getQuotation(id: string): Promise<any> {
    try {
      const response = await this.client.get(`/quotations/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'GET_QUOTATION_FAILED');
    }
  }

  async createQuotation(quotationData: any): Promise<any> {
    try {
      const response = await this.client.post('/quotations', quotationData, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'CREATE_QUOTATION_FAILED');
    }
  }

  async updateQuotation(id: string, updateData: any): Promise<any> {
    try {
      const response = await this.client.patch(`/quotations/${id}`, updateData, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'UPDATE_QUOTATION_FAILED');
    }
  }

  async calculatePricing(pricingData: any): Promise<any> {
    try {
      const response = await this.client.post('/quotations/calculate', pricingData, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'CALCULATE_PRICING_FAILED');
    }
  }

  async convertQuotationToOrder(quotationId: string, convertData: any): Promise<any> {
    try {
      const response = await this.client.post(
        `/quotations/${quotationId}/convert-to-order`,
        convertData,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'CONVERT_QUOTATION_FAILED');
    }
  }

  async getCustomers(filters?: { search?: string; page?: number; limit?: number }): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await this.client.get('/customers', {
        params: Object.fromEntries(params),
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'GET_CUSTOMERS_FAILED');
    }
  }

  async getCustomer(id: string): Promise<any> {
    try {
      const response = await this.client.get(`/customers/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'GET_CUSTOMER_FAILED');
    }
  }

  async getDashboard(role?: string): Promise<any> {
    try {
      const params = role ? { role } : {};
      const response = await this.client.get('/dashboard', {
        params,
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'GET_DASHBOARD_FAILED');
    }
  }

  async getProfile(): Promise<any> {
    try {
      const response = await this.client.get('/auth/me', {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'GET_PROFILE_FAILED');
    }
  }

  async updateOrderStatus(id: string, status: string): Promise<any> {
    try {
      const response = await this.client.patch(
        `/orders/${id}/status`,
        { status },
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'UPDATE_ORDER_STATUS_FAILED');
    }
  }

  async deleteOrder(id: string): Promise<any> {
    try {
      const response = await this.client.delete(`/orders/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'DELETE_ORDER_FAILED');
    }
  }

  async sendQuotation(id: string): Promise<any> {
    try {
      const response = await this.client.post(
        `/quotations/${id}/send`,
        {},
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'SEND_QUOTATION_FAILED');
    }
  }

  async approveQuotation(id: string): Promise<any> {
    try {
      const response = await this.client.post(
        `/quotations/${id}/approve`,
        {},
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'APPROVE_QUOTATION_FAILED');
    }
  }

  async rejectQuotation(id: string, reason: string): Promise<any> {
    try {
      const response = await this.client.post(
        `/quotations/${id}/reject`,
        { reason },
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'REJECT_QUOTATION_FAILED');
    }
  }

  async reviseQuotation(id: string): Promise<any> {
    try {
      const response = await this.client.post(
        `/quotations/${id}/revise`,
        {},
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'REVISE_QUOTATION_FAILED');
    }
  }

  async getQuotationHistory(id: string): Promise<any> {
    try {
      const response = await this.client.get(`/quotations/${id}/history`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'GET_QUOTATION_HISTORY_FAILED');
    }
  }

  async deleteQuotation(id: string): Promise<any> {
    try {
      const response = await this.client.delete(`/quotations/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'DELETE_QUOTATION_FAILED');
    }
  }

  async createCustomer(customerData: any): Promise<any> {
    try {
      const response = await this.client.post('/customers', customerData, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'CREATE_CUSTOMER_FAILED');
    }
  }

  async updateCustomer(id: string, updateData: any): Promise<any> {
    try {
      const response = await this.client.patch(`/customers/${id}`, updateData, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'UPDATE_CUSTOMER_FAILED');
    }
  }

  async getProductionOrders(filters?: { stage?: string; status?: string }): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (filters?.stage) params.append('stage', filters.stage);
      if (filters?.status) params.append('status', filters.status);

      const response = await this.client.get('/production', {
        params: Object.fromEntries(params),
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'GET_PRODUCTION_ORDERS_FAILED');
    }
  }

  async updateProductionStage(stageData: any): Promise<any> {
    try {
      const response = await this.client.patch('/production/stage', stageData, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'UPDATE_PRODUCTION_STAGE_FAILED');
    }
  }

  async getInventory(filters?: { search?: string; low_stock?: boolean }): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.low_stock) params.append('low_stock', 'true');

      const response = await this.client.get('/inventory', {
        params: Object.fromEntries(params),
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'GET_INVENTORY_FAILED');
    }
  }

  async getInventoryItem(id: string): Promise<any> {
    try {
      const response = await this.client.get(`/inventory/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'GET_INVENTORY_ITEM_FAILED');
    }
  }

  async updateInventory(id: string, updateData: any): Promise<any> {
    try {
      const response = await this.client.patch(`/inventory/${id}`, updateData, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'UPDATE_INVENTORY_FAILED');
    }
  }

  async getUsers(filters?: { role?: string }): Promise<any> {
    try {
      const params = new URLSearchParams();
      if (filters?.role) params.append('role', filters.role);

      const response = await this.client.get('/users', {
        params: Object.fromEntries(params),
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'GET_USERS_FAILED');
    }
  }

  async getUser(id: string): Promise<any> {
    try {
      const response = await this.client.get(`/users/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error, 'GET_USER_FAILED');
    }
  }

  private getAuthHeaders() {
    if (!this.authToken) {
      throw this.createError('NOT_AUTHENTICATED', 'No authentication token available');
    }
    return {
      Authorization: `Bearer ${this.authToken.access_token}`,
      'X-Company-ID': this.companyId || this.authToken.user.company_id,
    };
  }

  private handleError(error: any, code: string): MCPError {
    const message = error.response?.data?.message || error.message || 'Unknown error';
    return this.createError(code, message, error.response?.data);
  }

  private createError(code: string, message: string, details?: any): MCPError {
    return { code, message, details };
  }

  isAuthenticated(): boolean {
    return this.authToken !== null;
  }

  getAuthToken(): AuthToken | null {
    return this.authToken;
  }
}
