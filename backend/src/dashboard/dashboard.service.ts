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

  async getStats(): Promise<any> {
    // Order counts by status
    const orderCounts = await this.ordersRepository
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(*)', 'count')
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
      .getCount();

    // Pending invoices amount
    const pendingInvoices = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.balance_amount)', 'total')
      .where('invoice.status IN (:...statuses)', {
        statuses: [InvoiceStatus.SENT, InvoiceStatus.OVERDUE],
      })
      .getRawOne();

    return {
      orders: orderStats,
      production_jobs: jobStats,
      low_stock_items: lowStockCount,
      pending_invoices_amount: parseFloat(pendingInvoices.total) || 0,
    };
  }

  async getRecentOrders(limit = 10): Promise<Order[]> {
    return this.ordersRepository.find({
      take: limit,
      order: { created_at: 'DESC' },
      relations: ['customer', 'created_by'],
    });
  }

  async getProductionStatus(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const inProgress = await this.productionJobsRepository.count({
      where: { status: ProductionJobStatus.IN_PROGRESS },
    });

    const scheduledToday = await this.productionJobsRepository.count({
      where: {
        status: ProductionJobStatus.QUEUED,
        scheduled_start_date: today,
      },
    });

    const overdue = await this.productionJobsRepository
      .createQueryBuilder('job')
      .where('job.status IN (:...statuses)', {
        statuses: [ProductionJobStatus.QUEUED, ProductionJobStatus.IN_PROGRESS],
      })
      .andWhere('job.scheduled_end_date < :today', { today })
      .getCount();

    return {
      in_progress: inProgress,
      scheduled_today: scheduledToday,
      overdue: overdue,
    };
  }

  async getPendingDeliveries(): Promise<Order[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.ordersRepository
      .createQueryBuilder('order')
      .where('order.status = :status', { status: OrderStatus.COMPLETED })
      .andWhere('order.delivery_date >= :today', { today })
      .orderBy('order.delivery_date', 'ASC')
      .take(10)
      .leftJoinAndSelect('order.customer', 'customer')
      .getMany();
  }
}
