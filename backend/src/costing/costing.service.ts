import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobCost } from './entities/job-cost.entity';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { CreateJobCostDto, UpdateJobCostDto } from './dto/job-cost.dto';
import { CreateInvoiceDto, UpdateInvoiceDto, RecordPaymentDto } from './dto/invoice.dto';

@Injectable()
export class CostingService {
  constructor(
    @InjectRepository(JobCost)
    private jobCostsRepository: Repository<JobCost>,
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemsRepository: Repository<InvoiceItem>,
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
