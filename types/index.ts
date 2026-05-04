export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  activeJobs: number;
  qualityPassRate: number;
  [key: string]: any;
}
