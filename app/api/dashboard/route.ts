import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/tenant';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { companyId } = await getTenantContext(req);

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company not selected' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const endpoint = searchParams.get('endpoint');

    if (endpoint === 'stats') {
      return getStats(companyId);
    } else if (endpoint === 'production-status') {
      return getProductionStatus(companyId);
    } else if (endpoint === 'revenue-trend') {
      return getRevenueTrend(companyId);
    } else if (endpoint === 'pending-deliveries') {
      return getPendingDeliveries(companyId);
    }

    // Default: return all stats
    const stats = await getDashboardStats(companyId);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

async function getStats(companyId: string) {
  try {
    const stats = await getDashboardStats(companyId);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

async function getProductionStatus(companyId: string) {
  try {
    const [inProgress, scheduledToday, overdue] = await Promise.all([
      db.production_jobs.count({
        where: { company_id: companyId, status: 'in_progress' },
      }),
      db.production_jobs.count({
        where: {
          company_id: companyId,
          scheduled_start_date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
      db.production_jobs.count({
        where: {
          company_id: companyId,
          scheduled_end_date: {
            lt: new Date(),
          },
          status: { in: ['queued', 'in_progress'] },
        },
      }),
    ]);

    return NextResponse.json({
      in_progress: inProgress,
      scheduled_today: scheduledToday,
      overdue: overdue,
    });
  } catch (error) {
    console.error('Error getting production status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch production status' },
      { status: 500 }
    );
  }
}

async function getRevenueTrend(companyId: string) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const invoices = await db.invoices.findMany({
      where: {
        company_id: companyId,
        created_at: { gte: thirtyDaysAgo },
      },
      select: {
        created_at: true,
        total_amount: true,
      },
      orderBy: { created_at: 'asc' },
    });

    // Group by date and sum revenue
    const grouped = invoices.reduce((acc, inv) => {
      const date = inv.created_at.toISOString().split('T')[0];
      const existing = acc.find((item) => item.date === date);
      if (existing) {
        existing.revenue += inv.total_amount?.toNumber() || 0;
      } else {
        acc.push({ date, revenue: inv.total_amount?.toNumber() || 0 });
      }
      return acc;
    }, [] as { date: string; revenue: number }[]);

    return NextResponse.json(grouped);
  } catch (error) {
    console.error('Error getting revenue trend:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue trend' },
      { status: 500 }
    );
  }
}

async function getPendingDeliveries(companyId: string) {
  try {
    const orders = await db.orders.findMany({
      where: {
        company_id: companyId,
        status: { in: ['in_production', 'pending', 'approved'] },
      },
      select: {
        id: true,
        order_number: true,
        status: true,
        delivery_date: true,
        customers: { select: { name: true } },
      },
      orderBy: { delivery_date: 'asc' },
      take: 10,
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error getting pending deliveries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending deliveries' },
      { status: 500 }
    );
  }
}

async function getDashboardStats(companyId: string) {
  try {
    const [
      totalOrders,
      pendingOrders,
      ordersInProduction,
      totalProductionJobs,
      queuedJobs,
      lowStockItems,
      pendingInvoices,
    ] = await Promise.all([
      db.orders.count({
        where: { company_id: companyId },
      }),
      db.orders.count({
        where: { company_id: companyId, status: 'pending' },
      }),
      db.orders.count({
        where: { company_id: companyId, status: 'in_production' },
      }),
      db.production_jobs.count({
        where: { company_id: companyId },
      }),
      db.production_jobs.count({
        where: { company_id: companyId, status: 'queued' },
      }),
      db.inventory_items.count({
        where: {
          company_id: companyId,
          // Low stock if quantity < reorder_level
        },
      }),
      db.invoices.aggregate({
        where: {
          company_id: companyId,
          status: 'sent',
        },
        _sum: {
          total_amount: true,
        },
      }),
    ]);

    return {
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        in_production: ordersInProduction,
      },
      production_jobs: {
        total: totalProductionJobs,
        queued: queuedJobs,
      },
      low_stock_items: lowStockItems,
      pending_invoices_amount: pendingInvoices._sum.total_amount?.toNumber() || 0,
    };
  } catch (error) {
    console.error('Error calculating dashboard stats:', error);
    throw error;
  }
}
