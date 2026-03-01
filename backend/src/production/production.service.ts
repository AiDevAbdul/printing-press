import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ProductionJob, ProductionJobStatus } from './entities/production-job.entity';
import { ProductionStageHistory } from './entities/production-stage-history.entity';
import { CreateProductionJobDto, UpdateProductionJobDto, UpdateProductionJobStatusDto, StartStageDto, CompleteStageDto, QueryProductionJobsDto } from './dto/production-job.dto';

@Injectable()
export class ProductionService {
  constructor(
    @InjectRepository(ProductionJob)
    private productionJobsRepository: Repository<ProductionJob>,
    @InjectRepository(ProductionStageHistory)
    private stageHistoryRepository: Repository<ProductionStageHistory>,
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
      inline_status: 'Queued - Waiting to Start',
      searchable_text: '',
    });

    const savedJob = await this.productionJobsRepository.save(job);
    await this.updateSearchableText(savedJob.id);
    await this.updateQueuePositions();

    return this.findOne(savedJob.id);
  }

  private async updateSearchableText(jobId: string): Promise<void> {
    const job = await this.productionJobsRepository.findOne({
      where: { id: jobId },
      relations: ['order', 'order.customer', 'assigned_operator'],
    });

    if (!job) return;

    const searchText = [
      job.job_number,
      job.order?.order_number,
      job.order?.product_name,
      job.order?.customer?.name,
      job.current_stage,
      job.current_process,
      job.assigned_machine,
      job.assigned_operator?.full_name,
      job.inline_status,
    ]
      .filter(Boolean)
      .join(' ');

    await this.productionJobsRepository.update(jobId, { searchable_text: searchText });
  }

  private async updateQueuePositions(): Promise<void> {
    const queuedJobs = await this.productionJobsRepository.find({
      where: { status: ProductionJobStatus.QUEUED },
      relations: ['order'],
      order: { created_at: 'ASC' },
    });

    for (let i = 0; i < queuedJobs.length; i++) {
      await this.productionJobsRepository.update(queuedJobs[i].id, {
        queue_position: i + 1,
        inline_status: `Queued (Position #${i + 1} of ${queuedJobs.length})`,
      });
    }
  }

  private generateInlineStatus(job: ProductionJob): string {
    if (job.status === ProductionJobStatus.QUEUED) {
      return job.queue_position
        ? `Queued (Position #${job.queue_position})`
        : 'Queued - Waiting to Start';
    }

    if (job.status === ProductionJobStatus.COMPLETED) {
      return 'Completed - Ready for Delivery';
    }

    if (job.status === ProductionJobStatus.PAUSED) {
      return 'Paused';
    }

    if (job.status === ProductionJobStatus.CANCELLED) {
      return 'Cancelled';
    }

    // In Progress
    if (job.current_stage && job.current_process && job.assigned_machine) {
      return `${job.current_stage} - ${job.current_process} on ${job.assigned_machine}`;
    } else if (job.current_stage && job.assigned_machine) {
      return `${job.current_stage} on ${job.assigned_machine}`;
    } else if (job.current_stage) {
      return job.current_stage;
    }

    return 'In Production';
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

  async findAllWithFilters(queryDto: QueryProductionJobsDto): Promise<{ data: ProductionJob[]; total: number }> {
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 50;
    const skip = (page - 1) * limit;

    const queryBuilder = this.productionJobsRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.order', 'order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('job.assigned_operator', 'operator');

    // Status filter
    if (queryDto.status) {
      queryBuilder.andWhere('job.status = :status', { status: queryDto.status });
    }

    // Stage filter
    if (queryDto.stage) {
      queryBuilder.andWhere('job.current_stage = :stage', { stage: queryDto.stage });
    }

    // Machine filter
    if (queryDto.machine) {
      queryBuilder.andWhere('job.assigned_machine = :machine', { machine: queryDto.machine });
    }

    // Operator filter
    if (queryDto.operator_id) {
      queryBuilder.andWhere('job.assigned_operator = :operatorId', { operatorId: queryDto.operator_id });
    }

    // Customer filter
    if (queryDto.customer) {
      queryBuilder.andWhere('customer.name ILIKE :customer', { customer: `%${queryDto.customer}%` });
    }

    // Product filter
    if (queryDto.product) {
      queryBuilder.andWhere('order.product_name ILIKE :product', { product: `%${queryDto.product}%` });
    }

    // Text search
    if (queryDto.search) {
      queryBuilder.andWhere('job.searchable_text ILIKE :search', { search: `%${queryDto.search}%` });
    }

    // Pagination
    queryBuilder.skip(skip).take(limit);

    // Order by queue position for queued jobs, then by scheduled start date
    queryBuilder.orderBy('job.queue_position', 'ASC', 'NULLS LAST');
    queryBuilder.addOrderBy('job.scheduled_start_date', 'ASC');

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async getQueuedJobs(): Promise<ProductionJob[]> {
    return this.productionJobsRepository.find({
      where: { status: ProductionJobStatus.QUEUED },
      relations: ['order', 'order.customer'],
      order: { queue_position: 'ASC' },
    });
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
    job.inline_status = this.generateInlineStatus(job);

    const savedJob = await this.productionJobsRepository.save(job);
    await this.updateSearchableText(savedJob.id);
    await this.updateQueuePositions();

    return this.findOne(savedJob.id);
  }

  async completeJob(id: string): Promise<ProductionJob> {
    const job = await this.findOne(id);
    job.status = ProductionJobStatus.COMPLETED;
    job.actual_end_date = new Date();
    job.actual_completion = new Date();
    job.progress_percent = 100;
    job.inline_status = 'Completed - Ready for Delivery';

    if (job.actual_start_date) {
      const hours = (job.actual_end_date.getTime() - job.actual_start_date.getTime()) / (1000 * 60 * 60);
      job.actual_hours = Math.round(hours * 100) / 100;
    }

    const savedJob = await this.productionJobsRepository.save(job);
    await this.updateSearchableText(savedJob.id);

    return this.findOne(savedJob.id);
  }

  async startStage(id: string, startStageDto: StartStageDto): Promise<ProductionJob> {
    const job = await this.findOne(id);

    // Complete previous stage if exists
    if (job.current_stage) {
      const previousStage = await this.stageHistoryRepository.findOne({
        where: {
          job: { id },
          stage: job.current_stage,
          completed_at: null as any,
        },
      });

      if (previousStage) {
        previousStage.completed_at = new Date();
        const duration = (previousStage.completed_at.getTime() - previousStage.started_at.getTime()) / (1000 * 60);
        previousStage.duration_minutes = Math.round(duration);
        await this.stageHistoryRepository.save(previousStage);
      }
    }

    // Create new stage history
    const stageHistory = this.stageHistoryRepository.create({
      job: { id } as any,
      stage: startStageDto.stage,
      process: startStageDto.process,
      machine: startStageDto.machine || job.assigned_machine,
      operator: startStageDto.operator_id ? { id: startStageDto.operator_id } as any : job.assigned_operator,
      started_at: new Date(),
    });

    await this.stageHistoryRepository.save(stageHistory);

    // Update job
    job.current_stage = startStageDto.stage;
    job.current_process = startStageDto.process || null;
    if (startStageDto.machine) {
      job.assigned_machine = startStageDto.machine;
    }
    if (startStageDto.operator_id) {
      job.assigned_operator = { id: startStageDto.operator_id } as any;
    }
    job.status = ProductionJobStatus.IN_PROGRESS;
    job.inline_status = this.generateInlineStatus(job);

    const savedJob = await this.productionJobsRepository.save(job);
    await this.updateSearchableText(savedJob.id);

    return this.findOne(savedJob.id);
  }

  async completeStage(id: string, completeStageDto: CompleteStageDto): Promise<ProductionJob> {
    const job = await this.findOne(id);

    if (!job.current_stage) {
      throw new NotFoundException('No active stage to complete');
    }

    // Complete current stage
    const currentStage = await this.stageHistoryRepository.findOne({
      where: {
        job: { id },
        stage: job.current_stage,
        completed_at: null as any,
      },
    });

    if (currentStage) {
      currentStage.completed_at = new Date();
      const duration = (currentStage.completed_at.getTime() - currentStage.started_at.getTime()) / (1000 * 60);
      currentStage.duration_minutes = Math.round(duration);
      currentStage.notes = completeStageDto.notes;
      await this.stageHistoryRepository.save(currentStage);
    }

    // Clear current stage
    job.current_stage = null;
    job.current_process = null;
    job.inline_status = 'In Production - Between Stages';

    const savedJob = await this.productionJobsRepository.save(job);
    await this.updateSearchableText(savedJob.id);

    return this.findOne(savedJob.id);
  }

  async getStageTimeline(id: string): Promise<ProductionStageHistory[]> {
    return this.stageHistoryRepository.find({
      where: { job: { id } },
      relations: ['operator'],
      order: { started_at: 'ASC' },
    });
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
