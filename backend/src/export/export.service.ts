import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { WastageRecord } from '../production/entities/wastage-record.entity';
import { QualityInspection } from '../quality/entities/quality-inspection.entity';
import { Order } from '../orders/entities/order.entity';
import { ProductionJob } from '../production/entities/production-job.entity';

@Injectable()
export class ExportService {
  constructor(
    @InjectRepository(WastageRecord)
    private wastageRepository: Repository<WastageRecord>,
    @InjectRepository(QualityInspection)
    private qualityRepository: Repository<QualityInspection>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(ProductionJob)
    private productionRepository: Repository<ProductionJob>,
  ) {}

  async exportWastageAnalytics(startDate: Date, endDate: Date): Promise<ExcelJS.Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Wastage Analytics');

    // Add headers
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Job Number', key: 'job_number', width: 20 },
      { header: 'Stage', key: 'stage', width: 15 },
      { header: 'Wastage Type', key: 'wastage_type', width: 20 },
      { header: 'Quantity', key: 'quantity', width: 12 },
      { header: 'Unit', key: 'unit', width: 10 },
      { header: 'Estimated Cost', key: 'estimated_cost', width: 15 },
      { header: 'Reason', key: 'reason', width: 30 },
      { header: 'Corrective Action', key: 'corrective_action', width: 30 },
      { header: 'Recorded By', key: 'recorded_by', width: 20 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Fetch data
    const wastageRecords = await this.wastageRepository
      .createQueryBuilder('wastage')
      .leftJoinAndSelect('wastage.job', 'job')
      .leftJoinAndSelect('wastage.stage_history', 'stage_history')
      .leftJoinAndSelect('wastage.recorded_by', 'recorded_by')
      .where('wastage.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('wastage.created_at', 'DESC')
      .getMany();

    // Add data rows
    wastageRecords.forEach((record) => {
      worksheet.addRow({
        date: record.created_at.toISOString().split('T')[0],
        job_number: record.job?.job_number || 'N/A',
        stage: record.stage_history?.stage || 'N/A',
        wastage_type: record.wastage_type.replace(/_/g, ' ').toUpperCase(),
        quantity: record.quantity,
        unit: record.unit,
        estimated_cost: record.estimated_cost || 0,
        reason: record.reason || '',
        corrective_action: record.corrective_action || '',
        recorded_by: record.recorded_by?.full_name || 'N/A',
      });
    });

    // Add summary section
    const summaryRow = worksheet.rowCount + 2;
    worksheet.getCell(`A${summaryRow}`).value = 'SUMMARY';
    worksheet.getCell(`A${summaryRow}`).font = { bold: true, size: 14 };

    const totalCost = wastageRecords.reduce((sum, r) => sum + (parseFloat(r.estimated_cost as any) || 0), 0);
    const totalQuantity = wastageRecords.reduce((sum, r) => sum + r.quantity, 0);

    worksheet.getCell(`A${summaryRow + 1}`).value = 'Total Records:';
    worksheet.getCell(`B${summaryRow + 1}`).value = wastageRecords.length;

    worksheet.getCell(`A${summaryRow + 2}`).value = 'Total Quantity:';
    worksheet.getCell(`B${summaryRow + 2}`).value = totalQuantity;

    worksheet.getCell(`A${summaryRow + 3}`).value = 'Total Cost:';
    worksheet.getCell(`B${summaryRow + 3}`).value = `₹${totalCost.toFixed(2)}`;

    return await workbook.xlsx.writeBuffer();
  }

  async exportQualityMetrics(startDate: Date, endDate: Date): Promise<ExcelJS.Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Quality Metrics');

    // Add headers
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Inspection Number', key: 'inspection_number', width: 20 },
      { header: 'Job Number', key: 'job_number', width: 20 },
      { header: 'Stage', key: 'stage', width: 15 },
      { header: 'Checkpoint', key: 'checkpoint', width: 25 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Defects Found', key: 'defects_found', width: 15 },
      { header: 'Inspector', key: 'inspector', width: 20 },
      { header: 'Notes', key: 'notes', width: 30 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Fetch data
    const inspections = await this.qualityRepository
      .createQueryBuilder('inspection')
      .leftJoinAndSelect('inspection.job', 'job')
      .leftJoinAndSelect('inspection.checkpoint', 'checkpoint')
      .leftJoinAndSelect('inspection.inspector', 'inspector')
      .where('inspection.inspected_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('inspection.inspected_at', 'DESC')
      .getMany();

    // Add data rows
    inspections.forEach((inspection) => {
      worksheet.addRow({
        date: inspection.inspected_at?.toISOString().split('T')[0] || inspection.created_at.toISOString().split('T')[0],
        inspection_number: inspection.inspection_number,
        job_number: inspection.job?.job_number || 'N/A',
        stage: inspection.checkpoint?.stage || 'N/A',
        checkpoint: inspection.checkpoint?.name || 'N/A',
        status: inspection.status.toUpperCase(),
        defects_found: inspection.defects_found || 0,
        inspector: inspection.inspector?.full_name || 'N/A',
        notes: inspection.notes || '',
      });
    });

    // Add summary
    const summaryRow = worksheet.rowCount + 2;
    worksheet.getCell(`A${summaryRow}`).value = 'SUMMARY';
    worksheet.getCell(`A${summaryRow}`).font = { bold: true, size: 14 };

    const passedCount = inspections.filter((i) => i.status === 'passed').length;
    const failedCount = inspections.filter((i) => i.status === 'failed').length;
    const fpy = inspections.length > 0 ? (passedCount / inspections.length) * 100 : 0;

    worksheet.getCell(`A${summaryRow + 1}`).value = 'Total Inspections:';
    worksheet.getCell(`B${summaryRow + 1}`).value = inspections.length;

    worksheet.getCell(`A${summaryRow + 2}`).value = 'Passed:';
    worksheet.getCell(`B${summaryRow + 2}`).value = passedCount;

    worksheet.getCell(`A${summaryRow + 3}`).value = 'Failed:';
    worksheet.getCell(`B${summaryRow + 3}`).value = failedCount;

    worksheet.getCell(`A${summaryRow + 4}`).value = 'First Pass Yield:';
    worksheet.getCell(`B${summaryRow + 4}`).value = `${fpy.toFixed(2)}%`;

    return await workbook.xlsx.writeBuffer();
  }

  async exportDashboardStats(): Promise<ExcelJS.Buffer> {
    const workbook = new ExcelJS.Workbook();

    // Orders sheet
    const ordersSheet = workbook.addWorksheet('Orders');
    ordersSheet.columns = [
      { header: 'Order Number', key: 'order_number', width: 20 },
      { header: 'Customer', key: 'customer', width: 25 },
      { header: 'Product', key: 'product', width: 25 },
      { header: 'Quantity', key: 'quantity', width: 12 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Order Date', key: 'order_date', width: 15 },
      { header: 'Delivery Date', key: 'delivery_date', width: 15 },
      { header: 'Final Price', key: 'final_price', width: 15 },
    ];

    ordersSheet.getRow(1).font = { bold: true };
    ordersSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    const orders = await this.orderRepository.find({
      relations: ['customer'],
      order: { created_at: 'DESC' },
      take: 1000,
    });

    orders.forEach((order) => {
      ordersSheet.addRow({
        order_number: order.order_number,
        customer: order.customer?.name || 'N/A',
        product: order.product_name,
        quantity: order.quantity,
        status: order.status.toUpperCase(),
        order_date: order.order_date.toISOString().split('T')[0],
        delivery_date: order.delivery_date.toISOString().split('T')[0],
        final_price: order.final_price,
      });
    });

    // Production sheet
    const productionSheet = workbook.addWorksheet('Production Jobs');
    productionSheet.columns = [
      { header: 'Job Number', key: 'job_number', width: 20 },
      { header: 'Order Number', key: 'order_number', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Current Stage', key: 'current_stage', width: 20 },
      { header: 'Machine', key: 'machine', width: 20 },
      { header: 'Operator', key: 'operator', width: 20 },
      { header: 'Scheduled Start', key: 'scheduled_start', width: 15 },
      { header: 'Scheduled End', key: 'scheduled_end', width: 15 },
    ];

    productionSheet.getRow(1).font = { bold: true };
    productionSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    const jobs = await this.productionRepository.find({
      relations: ['order', 'assigned_operator'],
      order: { created_at: 'DESC' },
      take: 1000,
    });

    jobs.forEach((job) => {
      productionSheet.addRow({
        job_number: job.job_number,
        order_number: job.order?.order_number || 'N/A',
        status: job.status.toUpperCase(),
        current_stage: job.current_stage || 'N/A',
        machine: job.assigned_machine || 'N/A',
        operator: job.assigned_operator?.full_name || 'N/A',
        scheduled_start: job.scheduled_start_date?.toISOString().split('T')[0] || 'N/A',
        scheduled_end: job.scheduled_end_date?.toISOString().split('T')[0] || 'N/A',
      });
    });

    return await workbook.xlsx.writeBuffer();
  }
}
