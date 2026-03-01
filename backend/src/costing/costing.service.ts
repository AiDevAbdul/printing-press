import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobCost } from './entities/job-cost.entity';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { CostingConfig } from './entities/costing-config.entity';
import { CreateJobCostDto, UpdateJobCostDto, CalculateCostDto, UpdateCostingConfigDto } from './dto/job-cost.dto';
import { CreateInvoiceDto, UpdateInvoiceDto, RecordPaymentDto } from './dto/invoice.dto';
import { ProductionJob } from '../production/entities/production-job.entity';
import { Order } from '../orders/entities/order.entity';

@Injectable()
export class CostingService {
  constructor(
    @InjectRepository(JobCost)
    private jobCostsRepository: Repository<JobCost>,
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemsRepository: Repository<InvoiceItem>,
    @InjectRepository(CostingConfig)
    private costingConfigRepository: Repository<CostingConfig>,
    @InjectRepository(ProductionJob)
    private productionJobsRepository: Repository<ProductionJob>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  // Job Costing Methods
  async createJobCost(createJobCostDto: CreateJobCostDto): Promise<JobCost> {
    const total_cost = createJobCostDto.quantity * createJobCostDto.unit_cost;

    const jobCost = this.jobCostsRepository.create({
      ...createJobCostDto,
      total_cost,
      job: { id: createJobCostDto.job_id } as any,
      item: createJobCostDto.item_id ? { id: createJobCostDto.item_id } as any : null,
    });

    return this.jobCostsRepository.save(jobCost);
  }

  async getJobCosts(jobId: string): Promise<JobCost[]> {
    return this.jobCostsRepository.find({
      where: { job: { id: jobId } },
      relations: ['item'],
      order: { created_at: 'DESC' },
    });
  }

  async updateJobCost(id: string, updateJobCostDto: UpdateJobCostDto): Promise<JobCost> {
    const jobCost = await this.jobCostsRepository.findOne({ where: { id } });
    if (!jobCost) {
      throw new NotFoundException('Job cost not found');
    }

    Object.assign(jobCost, updateJobCostDto);

    if (updateJobCostDto.quantity || updateJobCostDto.unit_cost) {
      jobCost.total_cost = (updateJobCostDto.quantity || jobCost.quantity) * (updateJobCostDto.unit_cost || jobCost.unit_cost);
    }

    if (updateJobCostDto.item_id) {
      jobCost.item = { id: updateJobCostDto.item_id } as any;
    }

    return this.jobCostsRepository.save(jobCost);
  }

  async deleteJobCost(id: string): Promise<void> {
    const result = await this.jobCostsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Job cost not found');
    }
  }

  async getJobCostSummary(jobId: string): Promise<any> {
    const costs = await this.getJobCosts(jobId);

    const summary = {
      material: 0,
      labor: 0,
      machine: 0,
      overhead: 0,
      total: 0,
    };

    costs.forEach((cost) => {
      const amount = Number(cost.total_cost);
      summary[cost.cost_type] += amount;
      summary.total += amount;
    });

    return summary;
  }

  // Auto-Calculation Methods
  private async getCostingConfig(): Promise<CostingConfig> {
    let config = await this.costingConfigRepository.findOne({
      where: { is_active: true },
      order: { updated_at: 'DESC' },
    });

    if (!config) {
      // Create default config if none exists
      config = this.costingConfigRepository.create({
        paper_rate_per_kg: 150,
        gsm_rate_factor: 0.0001,
        cmyk_base_rate: 2000,
        special_color_rate: 800,
        spot_uv_rate_per_sqm: 50,
        lamination_rate_per_sqm: 30,
        embossing_rate_per_job: 1500,
        die_cutting_rate_per_1000: 500,
        pre_press_simple: 2000,
        pre_press_medium: 3500,
        pre_press_complex: 5000,
        pre_press_rush: 8000,
      });
      config = await this.costingConfigRepository.save(config);
    }

    return config;
  }

  private calculateMaterialCost(
    length: number,
    width: number,
    gsm: number,
    quantity: number,
    config: CostingConfig,
  ): number {
    // Area in cm²
    const area = length * width;
    // Total area in cm²
    const totalArea = area * quantity;
    // Weight in kg (gsm is grams per square meter, 1 m² = 10000 cm²)
    const weight = (totalArea * gsm) / 10000 / 1000;
    // Cost
    return weight * Number(config.paper_rate_per_kg);
  }

  private calculatePrintingCost(
    hasCMYK: boolean,
    specialColorsCount: number,
    quantity: number,
    config: CostingConfig,
  ): { cmyk: number; special: number } {
    const cmykCost = hasCMYK ? (Number(config.cmyk_base_rate) * quantity) / 1000 : 0;
    const specialCost = (specialColorsCount * Number(config.special_color_rate) * quantity) / 1000;

    return { cmyk: cmykCost, special: specialCost };
  }

  private calculateFinishingCosts(
    length: number,
    width: number,
    quantity: number,
    uvType: string,
    hasLamination: boolean,
    hasEmbossing: boolean,
    config: CostingConfig,
  ): { uv: number; lamination: number; embossing: number; dieCutting: number } {
    // Area in square meters
    const areaInSqm = (length * width) / 10000;
    const totalAreaSqm = areaInSqm * quantity;

    const uvCost = uvType && uvType !== 'none' ? totalAreaSqm * Number(config.spot_uv_rate_per_sqm) : 0;
    const laminationCost = hasLamination ? totalAreaSqm * Number(config.lamination_rate_per_sqm) : 0;
    const embossingCost = hasEmbossing ? Number(config.embossing_rate_per_job) : 0;
    const dieCuttingCost = (Number(config.die_cutting_rate_per_1000) * quantity) / 1000;

    return {
      uv: uvCost,
      lamination: laminationCost,
      embossing: embossingCost,
      dieCutting: dieCuttingCost,
    };
  }

  async calculateJobCost(calculateCostDto: CalculateCostDto): Promise<any> {
    // Get production job with order
    const job = await this.productionJobsRepository.findOne({
      where: { id: calculateCostDto.job_id },
      relations: ['order', 'order.customer'],
    });

    if (!job || !job.order) {
      throw new NotFoundException('Production job or associated order not found');
    }

    const order = job.order;
    const config = await this.getCostingConfig();

    // Extract specifications from order
    const length = Number(order.size_length) || 0;
    const width = Number(order.size_width) || 0;
    const gsm = order.gsm ? parseInt(order.gsm) : 0;
    const quantity = Number(order.quantity) || 0;

    // Validate required fields
    if (length <= 0 || width <= 0 || gsm <= 0 || quantity <= 0) {
      throw new Error('Invalid product specifications - length, width, GSM, and quantity are required');
    }

    // Count special colors
    const specialColors = [];
    if (order.color_p1) specialColors.push(order.color_p1);
    if (order.color_p2) specialColors.push(order.color_p2);
    if (order.color_p3) specialColors.push(order.color_p3);
    if (order.color_p4) specialColors.push(order.color_p4);

    const hasCMYK = order.color_cmyk ? true : false;
    const specialColorsCount = specialColors.length;

    // Calculate costs
    const materialCost = this.calculateMaterialCost(length, width, gsm, quantity, config);
    const printingCosts = this.calculatePrintingCost(hasCMYK, specialColorsCount, quantity, config);

    const uvType = order.varnish_type || 'none';
    const hasLamination = order.lamination_type && order.lamination_type !== 'none';
    const hasEmbossing = order.uv_emboss_details ? true : false;

    const finishingCosts = this.calculateFinishingCosts(
      length,
      width,
      quantity,
      uvType,
      hasLamination,
      hasEmbossing,
      config,
    );

    // Determine pre-press charges
    let prePressCost = calculateCostDto.pre_press_charges || Number(config.pre_press_medium);
    if (!calculateCostDto.pre_press_charges) {
      // Auto-determine based on complexity
      if (specialColorsCount >= 3 || hasEmbossing) {
        prePressCost = Number(config.pre_press_complex);
      } else if (specialColorsCount >= 1 || uvType !== 'none') {
        prePressCost = Number(config.pre_press_medium);
      } else {
        prePressCost = Number(config.pre_press_simple);
      }
    }

    const totalProcessingCost =
      printingCosts.cmyk +
      printingCosts.special +
      finishingCosts.uv +
      finishingCosts.lamination +
      finishingCosts.embossing +
      finishingCosts.dieCutting +
      prePressCost;

    const totalCost = materialCost + totalProcessingCost;
    const costPerUnit = totalCost / quantity;

    return {
      job_id: job.id,
      order_id: order.id,
      product_name: order.product_name,
      specifications: {
        card_length: length,
        card_width: width,
        card_gsm: gsm,
        card_type: order.type,
        quantity: quantity,
        colors_cmyk: hasCMYK,
        special_colors_count: specialColorsCount,
        special_colors: specialColors.join(', '),
        uv_type: uvType,
        lamination_required: hasLamination,
        embossing_required: hasEmbossing,
      },
      cost_breakdown: {
        material_cost: Math.round(materialCost * 100) / 100,
        printing_cost_cmyk: Math.round(printingCosts.cmyk * 100) / 100,
        printing_cost_special: Math.round(printingCosts.special * 100) / 100,
        uv_cost: Math.round(finishingCosts.uv * 100) / 100,
        lamination_cost: Math.round(finishingCosts.lamination * 100) / 100,
        embossing_cost: Math.round(finishingCosts.embossing * 100) / 100,
        die_cutting_cost: Math.round(finishingCosts.dieCutting * 100) / 100,
        pre_press_charges: Math.round(prePressCost * 100) / 100,
        total_processing_cost: Math.round(totalProcessingCost * 100) / 100,
        total_cost: Math.round(totalCost * 100) / 100,
        cost_per_unit: Math.round(costPerUnit * 100) / 100,
      },
      formulas_used: {
        material: `(${length} × ${width} × ${gsm} × ${quantity}) / 10000 / 1000 × ${config.paper_rate_per_kg}`,
        printing_cmyk: hasCMYK ? `${config.cmyk_base_rate} × ${quantity} / 1000` : 'N/A',
        printing_special: specialColorsCount > 0 ? `${specialColorsCount} × ${config.special_color_rate} × ${quantity} / 1000` : 'N/A',
      },
    };
  }

  async saveCalculatedCost(calculateCostDto: CalculateCostDto): Promise<JobCost> {
    const calculation = await this.calculateJobCost(calculateCostDto);

    const jobCost = this.jobCostsRepository.create({
      job: { id: calculateCostDto.job_id } as any,
      order: { id: calculation.order_id } as any,
      cost_type: 'material' as any,
      description: `Auto-calculated cost for ${calculation.product_name}`,
      quantity: calculation.specifications.quantity,
      unit_cost: calculation.cost_breakdown.cost_per_unit,
      total_cost: calculation.cost_breakdown.total_cost,
      // Specifications
      card_length: calculation.specifications.card_length,
      card_width: calculation.specifications.card_width,
      card_gsm: calculation.specifications.card_gsm,
      card_type: calculation.specifications.card_type,
      colors_cmyk: calculation.specifications.colors_cmyk,
      special_colors_count: calculation.specifications.special_colors_count,
      special_colors: calculation.specifications.special_colors,
      uv_type: calculation.specifications.uv_type,
      lamination_required: calculation.specifications.lamination_required,
      embossing_required: calculation.specifications.embossing_required,
      // Cost breakdown
      material_cost: calculation.cost_breakdown.material_cost,
      printing_cost_cmyk: calculation.cost_breakdown.printing_cost_cmyk,
      printing_cost_special: calculation.cost_breakdown.printing_cost_special,
      uv_cost: calculation.cost_breakdown.uv_cost,
      lamination_cost: calculation.cost_breakdown.lamination_cost,
      die_cutting_cost: calculation.cost_breakdown.die_cutting_cost,
      embossing_cost: calculation.cost_breakdown.embossing_cost,
      pre_press_charges: calculation.cost_breakdown.pre_press_charges,
      total_processing_cost: calculation.cost_breakdown.total_processing_cost,
      cost_per_unit: calculation.cost_breakdown.cost_per_unit,
    });

    return this.jobCostsRepository.save(jobCost);
  }

  // Costing Configuration Methods
  async getCostingConfiguration(): Promise<CostingConfig> {
    return this.getCostingConfig();
  }

  async updateCostingConfiguration(updateDto: UpdateCostingConfigDto): Promise<CostingConfig> {
    const config = await this.getCostingConfig();
    Object.assign(config, updateDto);
    return this.costingConfigRepository.save(config);
  }

  // Invoice Methods
  private generateInvoiceNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}${day}-${random}`;
  }

  async createInvoice(createInvoiceDto: CreateInvoiceDto, userId: string): Promise<Invoice> {
    const tax_rate = createInvoiceDto.tax_rate || 0;
    const tax_amount = (createInvoiceDto.subtotal * tax_rate) / 100;
    const total_amount = createInvoiceDto.subtotal + tax_amount;

    const invoice = this.invoicesRepository.create({
      invoice_number: this.generateInvoiceNumber(),
      order: { id: createInvoiceDto.order_id } as any,
      customer: { id: createInvoiceDto.customer_id } as any,
      invoice_date: createInvoiceDto.invoice_date,
      due_date: createInvoiceDto.due_date,
      subtotal: createInvoiceDto.subtotal,
      tax_rate,
      tax_amount,
      total_amount,
      balance_amount: total_amount,
      payment_terms: createInvoiceDto.payment_terms,
      notes: createInvoiceDto.notes,
      created_by: { id: userId } as any,
    });

    const savedInvoice = await this.invoicesRepository.save(invoice);

    // Create invoice items
    for (const itemDto of createInvoiceDto.items) {
      const total_price = itemDto.quantity * itemDto.unit_price;
      const invoiceItem = this.invoiceItemsRepository.create({
        invoice: savedInvoice,
        description: itemDto.description,
        quantity: itemDto.quantity,
        unit_price: itemDto.unit_price,
        total_price,
      });
      await this.invoiceItemsRepository.save(invoiceItem);
    }

    return this.findOneInvoice(savedInvoice.id);
  }

  async findAllInvoices(
    status?: InvoiceStatus,
    customerId?: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: Invoice[]; total: number }> {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customer = { id: customerId };
    }

    const [data, total] = await this.invoicesRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { created_at: 'DESC' },
      relations: ['order', 'customer', 'created_by'],
    });

    return { data, total };
  }

  async findOneInvoice(id: string): Promise<Invoice> {
    const invoice = await this.invoicesRepository.findOne({
      where: { id },
      relations: ['order', 'customer', 'created_by'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async updateInvoice(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.findOneInvoice(id);

    Object.assign(invoice, updateInvoiceDto);

    if (updateInvoiceDto.subtotal || updateInvoiceDto.tax_rate) {
      const subtotal = updateInvoiceDto.subtotal || invoice.subtotal;
      const tax_rate = updateInvoiceDto.tax_rate !== undefined ? updateInvoiceDto.tax_rate : invoice.tax_rate;
      invoice.tax_amount = (Number(subtotal) * Number(tax_rate)) / 100;
      invoice.total_amount = Number(subtotal) + Number(invoice.tax_amount);
      invoice.balance_amount = Number(invoice.total_amount) - Number(invoice.paid_amount);
    }

    return this.invoicesRepository.save(invoice);
  }

  async deleteInvoice(id: string): Promise<Invoice> {
    const invoice = await this.findOneInvoice(id);
    invoice.status = InvoiceStatus.CANCELLED;
    return this.invoicesRepository.save(invoice);
  }

  async recordPayment(id: string, recordPaymentDto: RecordPaymentDto): Promise<Invoice> {
    const invoice = await this.findOneInvoice(id);

    invoice.paid_amount = Number(invoice.paid_amount) + Number(recordPaymentDto.amount);
    invoice.balance_amount = Number(invoice.total_amount) - Number(invoice.paid_amount);

    if (invoice.balance_amount <= 0) {
      invoice.status = InvoiceStatus.PAID;
    }

    return this.invoicesRepository.save(invoice);
  }

  async getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
    return this.invoiceItemsRepository.find({
      where: { invoice: { id: invoiceId } },
      order: { created_at: 'ASC' },
    });
  }
}
