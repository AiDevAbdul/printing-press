import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { ProductionJob, ProductionJobStatus } from '../production/entities/production-job.entity';
import { InventoryItem } from '../inventory/entities/inventory-item.entity';
import { Invoice, InvoiceStatus } from '../costing/entities/invoice.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(ProductionJob)
    private productionJobsRepository: Repository<ProductionJob>,
    @InjectRepository(InventoryItem)
    private inventoryItemsRepository: Repository<InventoryItem>,
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
  ) {}

  async getStats(companyId: string): Promise<any> {
    // Order counts by status
    const orderCounts = await this.ordersRepository
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('order.company_id = :companyId', { companyId })
      .groupBy('order.status')
      .getRawMany();

    const orderStats = {
      pending: 0,
      approved: 0,
      in_production: 0,
      completed: 0,
      delivered: 0,
      total: 0,
    };

    orderCounts.forEach((item) => {
      orderStats[item.status] = parseInt(item.count);
      orderStats.total += parseInt(item.count);
    });

    // Production job counts by status
    const jobCounts = await this.productionJobsRepository
      .createQueryBuilder('job')
      .select('job.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('job.company_id = :companyId', { companyId })
      .groupBy('job.status')
      .getRawMany();

    const jobStats = {
      queued: 0,
      in_progress: 0,
      paused: 0,
      completed: 0,
      total: 0,
    };

    jobCounts.forEach((item) => {
      jobStats[item.status] = parseInt(item.count);
      jobStats.total += parseInt(item.count);
    });

    // Low stock items count
    const lowStockCount = await this.inventoryItemsRepository
      .createQueryBuilder('item')
      .where('item.current_stock <= item.reorder_level')
      .andWhere('item.is_active = :isActive', { isActive: true })
      .andWhere('item.company_id = :companyId', { companyId })
      .getCount();

    // Pending invoices amount
    const pendingInvoices = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.balance_amount)', 'total')
      .where('invoice.status IN (:...statuses)', {
        statuses: [InvoiceStatus.SENT, InvoiceStatus.OVERDUE],
      })
      .andWhere('invoice.company_id = :companyId', { companyId })
      .getRawOne();

    return {
      orders: orderStats,
      production_jobs: jobStats,
      low_stock_items: lowStockCount,
      pending_invoices_amount: parseFloat(pendingInvoices.total) || 0,
    };
  }

  async getProductionStatus(companyId: string): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const inProgress = await this.productionJobsRepository.count({
      where: { status: ProductionJobStatus.IN_PROGRESS, company_id: companyId },
    });

    const scheduledToday = await this.productionJobsRepository.count({
      where: {
        status: ProductionJobStatus.QUEUED,
        scheduled_start_date: today,
        company_id: companyId,
      },
    });

    const overdue = await this.productionJobsRepository
      .createQueryBuilder('job')
      .where('job.status IN (:...statuses)', {
        statuses: [ProductionJobStatus.QUEUED, ProductionJobStatus.IN_PROGRESS],
      })
      .andWhere('job.scheduled_end_date < :today', { today })
      .andWhere('job.company_id = :companyId', { companyId })
      .getCount();

    return {
      in_progress: inProgress,
      scheduled_today: scheduledToday,
      overdue: overdue,
    };
  }

  async getPendingDeliveries(companyId: string): Promise<Order[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.ordersRepository
      .createQueryBuilder('order')
      .where('order.status = :status', { status: OrderStatus.COMPLETED })
      .andWhere('order.delivery_date >= :today', { today })
      .andWhere('order.company_id = :companyId', { companyId })
      .orderBy('order.delivery_date', 'ASC')
      .take(10)
      .leftJoinAndSelect('order.customer', 'customer')
      .getMany();
  }

  async getRevenueTrend(companyId: string): Promise<{ date: string; revenue: number }[]> {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Get daily revenue from invoices for the last 7 days
    const dailyRevenue = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .select('DATE(invoice.invoice_date)', 'date')
      .addSelect('SUM(invoice.total_amount)', 'revenue')
      .where('invoice.invoice_date >= :startDate', { startDate: sevenDaysAgo })
      .andWhere('invoice.status != :status', { status: InvoiceStatus.CANCELLED })
      .andWhere('invoice.company_id = :companyId', { companyId })
      .groupBy('DATE(invoice.invoice_date)')
      .orderBy('DATE(invoice.invoice_date)', 'ASC')
      .getRawMany();

    // Create array with all 7 days (fill missing days with 0)
    const result = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(sevenDaysAgo.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const dayData = dailyRevenue.find(d => d.date === dateStr);
      result.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayData ? parseFloat(dayData.revenue) : 0,
      });
    }

    return result;
  }
}
