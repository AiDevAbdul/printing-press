import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ProductionJob, ProductionJobStatus } from './entities/production-job.entity';
import { ProductionStageHistory } from './entities/production-stage-history.entity';
import { MaterialConsumption, MaterialTransactionType } from './entities/material-consumption.entity';
import { MachineCounter } from './entities/machine-counter.entity';
import { WastageRecord } from './entities/wastage-record.entity';
import { OfflineSyncQueue, SyncStatus } from './entities/offline-sync-queue.entity';
import { CreateProductionJobDto, UpdateProductionJobDto, UpdateProductionJobStatusDto, StartStageDto, CompleteStageDto, QueryProductionJobsDto } from './dto/production-job.dto';
import { IssueMaterialDto, ReturnMaterialDto } from './dto/material-consumption.dto';
import { RecordMachineCounterDto } from './dto/machine-counter.dto';
import { RecordWastageDto } from './dto/wastage.dto';
import { StartStageEnhancedDto, CompleteStageEnhancedDto, OfflineSyncDto } from './dto/shop-floor.dto';
import * as QRCode from 'qrcode';

@Injectable()
export class ProductionService {
  constructor(
    @InjectRepository(ProductionJob)
    private productionJobsRepository: Repository<ProductionJob>,
    @InjectRepository(ProductionStageHistory)
    private stageHistoryRepository: Repository<ProductionStageHistory>,
    @InjectRepository(MaterialConsumption)
    private materialConsumptionRepository: Repository<MaterialConsumption>,
    @InjectRepository(MachineCounter)
    private machineCounterRepository: Repository<MachineCounter>,
    @InjectRepository(WastageRecord)
    private wastageRecordRepository: Repository<WastageRecord>,
    @InjectRepository(OfflineSyncQueue)
    private offlineSyncQueueRepository: Repository<OfflineSyncQueue>,
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

    // Status filter - support multiple statuses separated by comma
    if (queryDto.status) {
      const statuses = queryDto.status.toString().split(',').map(s => s.trim());
      if (statuses.length > 1) {
        queryBuilder.andWhere('job.status IN (:...statuses)', { statuses });
      } else {
        queryBuilder.andWhere('job.status = :status', { status: queryDto.status });
      }
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

  // Shop Floor Management Methods

  async getMyActiveJobs(operatorId: string): Promise<ProductionJob[]> {
    return this.productionJobsRepository.find({
      where: [
        { assigned_operator: { id: operatorId }, status: ProductionJobStatus.IN_PROGRESS },
        { assigned_operator: { id: operatorId }, status: ProductionJobStatus.QUEUED },
      ],
      relations: ['order', 'order.customer'],
      order: { queue_position: 'ASC' },
    });
  }

  async getJobByQRCode(qrCode: string): Promise<ProductionJob> {
    // QR code format: JOB-{job_number}
    const jobNumber = qrCode.replace('JOB-', '');
    const job = await this.productionJobsRepository.findOne({
      where: { job_number: jobNumber },
      relations: ['order', 'order.customer', 'assigned_operator'],
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  async generateJobQRCode(id: string): Promise<string> {
    const job = await this.findOne(id);
    const qrData = `JOB-${job.job_number}`;

    try {
      const qrCodeDataUrl = await QRCode.toDataURL(qrData);
      return qrCodeDataUrl;
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  async issueMaterial(dto: IssueMaterialDto, userId: string): Promise<MaterialConsumption> {
    const material = this.materialConsumptionRepository.create({
      ...dto,
      transaction_type: MaterialTransactionType.ISSUE,
      issued_by_id: userId,
    });

    return this.materialConsumptionRepository.save(material);
  }

  async returnMaterial(dto: ReturnMaterialDto, userId: string): Promise<MaterialConsumption> {
    const material = this.materialConsumptionRepository.create({
      ...dto,
      transaction_type: MaterialTransactionType.RETURN,
      issued_by_id: userId,
    });

    return this.materialConsumptionRepository.save(material);
  }

  async getMaterialConsumption(jobId: string): Promise<MaterialConsumption[]> {
    return this.materialConsumptionRepository.find({
      where: { job_id: jobId },
      relations: ['issued_by'],
      order: { created_at: 'DESC' },
    });
  }

  async recordMachineCounter(dto: RecordMachineCounterDto, userId: string): Promise<MachineCounter> {
    const counter = this.machineCounterRepository.create({
      ...dto,
      recorded_by_id: userId,
    });

    return this.machineCounterRepository.save(counter);
  }

  async getMachineCounters(jobId: string): Promise<MachineCounter[]> {
    return this.machineCounterRepository.find({
      where: { job_id: jobId },
      relations: ['recorded_by'],
      order: { created_at: 'DESC' },
    });
  }

  async recordWastage(dto: RecordWastageDto, userId: string): Promise<WastageRecord> {
    const wastage = this.wastageRecordRepository.create({
      ...dto,
      recorded_by_id: userId,
    });

    return this.wastageRecordRepository.save(wastage);
  }

  async getWastageRecords(jobId: string): Promise<WastageRecord[]> {
    return this.wastageRecordRepository.find({
      where: { job_id: jobId },
      relations: ['recorded_by'],
      order: { created_at: 'DESC' },
    });
  }

  async getWastageAnalytics(startDate: Date, endDate: Date): Promise<any> {
    // Wastage by type
    const wastageByType = await this.wastageRecordRepository
      .createQueryBuilder('wastage')
      .select('wastage.wastage_type', 'type')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(wastage.estimated_cost)', 'cost')
      .where('wastage.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('wastage.wastage_type')
      .getRawMany();

    // Wastage by stage
    const wastageByStage = await this.wastageRecordRepository
      .createQueryBuilder('wastage')
      .leftJoin('wastage.stage_history', 'stage_history')
      .select('stage_history.stage', 'stage')
      .addSelect('SUM(wastage.quantity)', 'quantity')
      .addSelect('SUM(wastage.estimated_cost)', 'cost')
      .where('wastage.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('stage_history.stage')
      .getRawMany();

    // Calculate totals
    const totalWastage = wastageByType.reduce((sum, item) => sum + parseInt(item.count), 0);
    const totalCost = wastageByType.reduce((sum, item) => sum + parseFloat(item.cost || 0), 0);

    return {
      wastageByType: wastageByType.map(item => ({
        type: item.type,
        count: parseInt(item.count),
        cost: parseFloat(item.cost || 0),
      })),
      wastageByStage: wastageByStage.map(item => ({
        stage: item.stage,
        quantity: parseInt(item.quantity || 0),
        cost: parseFloat(item.cost || 0),
      })),
      summary: {
        totalWastage,
        totalCost,
        avgCostPerIncident: totalWastage > 0 ? totalCost / totalWastage : 0,
      },
    };
  }

  async startStageEnhanced(dto: StartStageEnhancedDto, userId: string): Promise<ProductionJob> {
    const job = await this.findOne(dto.job_id);

    // Complete previous stage if exists
    if (job.current_stage) {
      const previousStage = await this.stageHistoryRepository.findOne({
        where: {
          job: { id: dto.job_id },
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
      job: { id: dto.job_id } as any,
      stage: dto.stage,
      process: dto.process,
      machine: dto.machine || job.assigned_machine,
      operator: { id: userId } as any,
      started_at: new Date(),
      notes: dto.notes,
    });

    const savedStageHistory = await this.stageHistoryRepository.save(stageHistory);

    // Record machine counter if provided
    if (dto.counter_start !== undefined && dto.machine) {
      await this.recordMachineCounter(
        {
          job_id: dto.job_id,
          stage_history_id: savedStageHistory.id,
          machine_name: dto.machine,
          counter_start: dto.counter_start,
        },
        userId,
      );
    }

    // Update job
    job.current_stage = dto.stage;
    job.current_process = dto.process || null;
    if (dto.machine) {
      job.assigned_machine = dto.machine;
    }
    job.assigned_operator = { id: userId } as any;
    job.status = ProductionJobStatus.IN_PROGRESS;
    job.inline_status = this.generateInlineStatus(job);

    const savedJob = await this.productionJobsRepository.save(job);
    await this.updateSearchableText(savedJob.id);

    return this.findOne(savedJob.id);
  }

  async completeStageEnhanced(dto: CompleteStageEnhancedDto, userId: string): Promise<ProductionStageHistory> {
    const stageHistory = await this.stageHistoryRepository.findOne({
      where: { id: dto.stage_history_id },
      relations: ['job'],
    });

    if (!stageHistory) {
      throw new NotFoundException('Stage history not found');
    }

    // Complete stage
    stageHistory.completed_at = new Date();
    const duration = (stageHistory.completed_at.getTime() - stageHistory.started_at.getTime()) / (1000 * 60);
    stageHistory.duration_minutes = Math.round(duration);
    if (dto.notes) {
      stageHistory.notes = dto.notes;
    }

    await this.stageHistoryRepository.save(stageHistory);

    // Update machine counter if provided
    if (dto.counter_end !== undefined) {
      const counter = await this.machineCounterRepository.findOne({
        where: { stage_history_id: dto.stage_history_id },
        order: { created_at: 'DESC' },
      });

      if (counter) {
        counter.counter_end = dto.counter_end;
        counter.good_quantity = dto.good_quantity;
        counter.waste_quantity = dto.waste_quantity;
        await this.machineCounterRepository.save(counter);
      }
    }

    // Record wastage if provided
    if (dto.wastage_records && dto.wastage_records.length > 0) {
      for (const wastageDto of dto.wastage_records) {
        await this.recordWastage(
          {
            ...wastageDto,
            stage_history_id: dto.stage_history_id,
          },
          userId,
        );
      }
    }

    // Update job
    const job = await this.findOne(stageHistory.job.id);
    job.current_stage = null;
    job.current_process = null;
    job.inline_status = 'In Production - Between Stages';

    await this.productionJobsRepository.save(job);
    await this.updateSearchableText(job.id);

    return stageHistory;
  }

  async syncOfflineActions(dto: OfflineSyncDto, userId: string): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const action of dto.actions) {
      try {
        // Queue the action
        const queueItem = this.offlineSyncQueueRepository.create({
          user_id: userId,
          action_type: action.action_type,
          payload: action.payload,
          status: SyncStatus.PENDING,
        });

        await this.offlineSyncQueueRepository.save(queueItem);

        // Process the action immediately
        await this.processOfflineAction(queueItem);

        queueItem.status = SyncStatus.SYNCED;
        await this.offlineSyncQueueRepository.save(queueItem);

        success++;
      } catch (error) {
        failed++;
        // Log error but continue processing other actions
        console.error('Failed to sync action:', error);
      }
    }

    return { success, failed };
  }

  private async processOfflineAction(queueItem: OfflineSyncQueue): Promise<void> {
    const { action_type, payload, user_id } = queueItem;

    switch (action_type) {
      case 'start_stage':
        await this.startStageEnhanced(payload, user_id);
        break;
      case 'complete_stage':
        await this.completeStageEnhanced(payload, user_id);
        break;
      case 'issue_material':
        await this.issueMaterial(payload, user_id);
        break;
      case 'return_material':
        await this.returnMaterial(payload, user_id);
        break;
      case 'record_wastage':
        await this.recordWastage(payload, user_id);
        break;
      case 'record_counter':
        await this.recordMachineCounter(payload, user_id);
        break;
      default:
        throw new Error(`Unknown action type: ${action_type}`);
    }
  }
}
