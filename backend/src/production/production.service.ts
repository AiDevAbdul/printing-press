import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ProductionJob, ProductionJobStatus } from './entities/production-job.entity';
import { CreateProductionJobDto, UpdateProductionJobDto, UpdateProductionJobStatusDto } from './dto/production-job.dto';

@Injectable()
export class ProductionService {
  constructor(
    @InjectRepository(ProductionJob)
    private productionJobsRepository: Repository<ProductionJob>,
  ) {}

  private generateJobNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `JOB-${year}${month}${day}-${random}`;
  }

  async create(createProductionJobDto: CreateProductionJobDto): Promise<ProductionJob> {
    const job = this.productionJobsRepository.create({
      ...createProductionJobDto,
      job_number: this.generateJobNumber(),
      order: { id: createProductionJobDto.order_id } as any,
      assigned_operator: createProductionJobDto.assigned_operator_id
        ? { id: createProductionJobDto.assigned_operator_id } as any
        : null,
    });
    return this.productionJobsRepository.save(job);
  }

  async findAll(
    status?: ProductionJobStatus,
    machine?: string,
    startDate?: Date,
    endDate?: Date,
    page = 1,
    limit = 10,
  ): Promise<{ data: ProductionJob[]; total: number }> {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (machine) {
      where.assigned_machine = machine;
    }

    if (startDate && endDate) {
      where.scheduled_start_date = Between(startDate, endDate);
    }

    const [data, total] = await this.productionJobsRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { scheduled_start_date: 'ASC' },
      relations: ['order', 'order.customer', 'assigned_operator'],
    });

    return { data, total };
  }

  async findOne(id: string): Promise<ProductionJob> {
    const job = await this.productionJobsRepository.findOne({
      where: { id },
      relations: ['order', 'order.customer', 'assigned_operator'],
    });

    if (!job) {
      throw new NotFoundException('Production job not found');
    }

    return job;
  }

  async update(id: string, updateProductionJobDto: UpdateProductionJobDto): Promise<ProductionJob> {
    const job = await this.findOne(id);

    if (updateProductionJobDto.assigned_operator_id) {
      job.assigned_operator = { id: updateProductionJobDto.assigned_operator_id } as any;
      delete updateProductionJobDto.assigned_operator_id;
    }

    Object.assign(job, updateProductionJobDto);
    return this.productionJobsRepository.save(job);
  }

  async updateStatus(id: string, updateStatusDto: UpdateProductionJobStatusDto): Promise<ProductionJob> {
    const job = await this.findOne(id);
    job.status = updateStatusDto.status;
    return this.productionJobsRepository.save(job);
  }

  async startJob(id: string): Promise<ProductionJob> {
    const job = await this.findOne(id);
    job.status = ProductionJobStatus.IN_PROGRESS;
    job.actual_start_date = new Date();
    return this.productionJobsRepository.save(job);
  }

  async completeJob(id: string): Promise<ProductionJob> {
    const job = await this.findOne(id);
    job.status = ProductionJobStatus.COMPLETED;
    job.actual_end_date = new Date();

    if (job.actual_start_date) {
      const hours = (job.actual_end_date.getTime() - job.actual_start_date.getTime()) / (1000 * 60 * 60);
      job.actual_hours = Math.round(hours * 100) / 100;
    }

    return this.productionJobsRepository.save(job);
  }

  async getSchedule(startDate: Date, endDate: Date): Promise<ProductionJob[]> {
    return this.productionJobsRepository.find({
      where: {
        scheduled_start_date: Between(startDate, endDate),
      },
      order: { scheduled_start_date: 'ASC' },
      relations: ['order', 'order.customer', 'assigned_operator'],
    });
  }
}
