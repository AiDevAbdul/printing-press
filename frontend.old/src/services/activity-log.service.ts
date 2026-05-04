import api from './api';

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  changes?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface ActivityLogResponse {
  data: ActivityLog[];
  total: number;
  limit: number;
  offset: number;
}

class ActivityLogService {
  async getUserActivityLog(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ActivityLogResponse> {
    const response = await api.get(`/users/${userId}/activity-log`, {
      params: { limit, offset },
    });
    return response.data;
  }
}

export default new ActivityLogService();
