import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QualityCheckpoint } from './entities/quality-checkpoint.entity';
import { QualityInspection, InspectionStatus } from './entities/quality-inspection.entity';
import { QualityDefect } from './entities/quality-defect.entity';
import { QualityRejection } from './entities/quality-rejection.entity';
import { CustomerComplaint, ComplaintStatus } from './entities/customer-complaint.entity';
import {
  CreateCheckpointDto,
  UpdateCheckpointDto,
  CreateInspectionDto,
  UpdateInspectionDto,
  PassInspectionDto,
  FailInspectionDto,
  CreateDefectDto,
  UpdateDefectDto,
  CreateRejectionDto,
  UpdateRejectionDto,
  CreateComplaintDto,
  UpdateComplaintDto,
  ResolveComplaintDto,
} from './dto/quality.dto';

@Injectable()
export class QualityService {
  constructor(
    @InjectRepository(QualityCheckpoint)
    private checkpointRepository: Repository<QualityCheckpoint>,
    @InjectRepository(QualityInspection)
    private inspectionRepository: Repository<QualityInspection>,
    @InjectRepository(QualityDefect)
    private defectRepository: Repository<QualityDefect>,
    @InjectRepository(QualityRejection)
    private rejectionRepository: Repository<QualityRejection>,
    @InjectRepository(CustomerComplaint)
    private complaintRepository: Repository<CustomerComplaint>,
  ) {}

  // Quality Checkpoints
  async createCheckpoint(dto: CreateCheckpointDto): Promise<QualityCheckpoint> {
    const checkpoint = this.checkpointRepository.create(dto);
    return this.checkpointRepository.save(checkpoint);
  }

  async findAllCheckpoints(stage?: string, isActive?: boolean): Promise<QualityCheckpoint[]> {
    const where: any = {};
    if (stage) where.stage = stage;
    if (isActive !== undefined) where.is_active = isActive;

    return this.checkpointRepository.find({
      where,
      order: { sequence_order: 'ASC', created_at: 'ASC' },
    });
  }

  async findCheckpoint(id: string): Promise<QualityCheckpoint> {
    const checkpoint = await this.checkpointRepository.findOne({ where: { id } });
    if (!checkpoint) {
      throw new NotFoundException('Checkpoint not found');
    }
    return checkpoint;
  }

  async updateCheckpoint(id: string, dto: UpdateCheckpointDto): Promise<QualityCheckpoint> {
    const checkpoint = await this.findCheckpoint(id);
    Object.assign(checkpoint, dto);
    return this.checkpointRepository.save(checkpoint);
  }

  async deleteCheckpoint(id: string): Promise<void> {
    const checkpoint = await this.findCheckpoint(id);
    await this.checkpointRepository.remove(checkpoint);
  }

  // Quality Inspections
  async createInspection(dto: CreateInspectionDto, inspectorId: string): Promise<QualityInspection> {
    const inspectionNumber = await this.generateInspectionNumber();

    const inspection = this.inspectionRepository.create({
      ...dto,
      inspection_number: inspectionNumber,
      inspector_id: inspectorId,
      status: InspectionStatus.PENDING,
    });

    return this.inspectionRepository.save(inspection);
  }

  async findAllInspections(filters?: {
    job_id?: string;
    status?: InspectionStatus;
    checkpoint_id?: string;
  }): Promise<{ data: QualityInspection[]; total: number }> {
    const query = this.inspectionRepository.createQueryBuilder('inspection')
      .leftJoinAndSelect('inspection.job', 'job')
      .leftJoinAndSelect('inspection.checkpoint', 'checkpoint')
      .leftJoinAndSelect('inspection.inspector', 'inspector')
      .leftJoinAndSelect('inspection.defects', 'defects');

    if (filters?.job_id) {
      query.andWhere('inspection.job_id = :job_id', { job_id: filters.job_id });
    }

    if (filters?.status) {
      query.andWhere('inspection.status = :status', { status: filters.status });
    }

    if (filters?.checkpoint_id) {
      query.andWhere('inspection.checkpoint_id = :checkpoint_id', { checkpoint_id: filters.checkpoint_id });
    }

    query.orderBy('inspection.created_at', 'DESC');

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async findInspection(id: string): Promise<QualityInspection> {
    const inspection = await this.inspectionRepository.findOne({
      where: { id },
      relations: ['job', 'checkpoint', 'inspector', 'defects', 'defects.logged_by'],
    });

    if (!inspection) {
      throw new NotFoundException('Inspection not found');
    }

    return inspection;
  }

  async updateInspection(id: string, dto: UpdateInspectionDto): Promise<QualityInspection> {
    const inspection = await this.findInspection(id);
    Object.assign(inspection, dto);
    return this.inspectionRepository.save(inspection);
  }

  async passInspection(id: string, dto: PassInspectionDto): Promise<QualityInspection> {
    const inspection = await this.findInspection(id);

    if (inspection.status === InspectionStatus.PASSED) {
      throw new BadRequestException('Inspection already passed');
    }

    inspection.status = InspectionStatus.PASSED;
    inspection.inspected_at = new Date();
    inspection.checklist_results = dto.checklist_results || inspection.checklist_results;
    inspection.notes = dto.notes || inspection.notes;
    inspection.defects_found = 0;

    return this.inspectionRepository.save(inspection);
  }

  async failInspection(id: string, dto: FailInspectionDto): Promise<QualityInspection> {
    const inspection = await this.findInspection(id);

    if (inspection.status === InspectionStatus.FAILED) {
      throw new BadRequestException('Inspection already failed');
    }

    inspection.status = InspectionStatus.FAILED;
    inspection.inspected_at = new Date();
    inspection.failure_reason = dto.failure_reason;
    inspection.defects_found = dto.defects_found || 0;
    inspection.checklist_results = dto.checklist_results || inspection.checklist_results;
    inspection.notes = dto.notes || inspection.notes;

    return this.inspectionRepository.save(inspection);
  }

  // Quality Defects
  async createDefect(dto: CreateDefectDto, userId: string, file?: Express.Multer.File): Promise<QualityDefect> {
    const defect = this.defectRepository.create({
      ...dto,
      logged_by_id: userId,
      photo_url: file ? `/uploads/quality/defects/${file.filename}` : undefined,
    });

    return this.defectRepository.save(defect);
  }

  async findAllDefects(inspectionId?: string): Promise<QualityDefect[]> {
    const where: any = {};
    if (inspectionId) where.inspection_id = inspectionId;

    return this.defectRepository.find({
      where,
      relations: ['inspection', 'logged_by'],
      order: { created_at: 'DESC' },
    });
  }

  async findDefect(id: string): Promise<QualityDefect> {
    const defect = await this.defectRepository.findOne({
      where: { id },
      relations: ['inspection', 'logged_by'],
    });

    if (!defect) {
      throw new NotFoundException('Defect not found');
    }

    return defect;
  }

  async updateDefect(id: string, dto: UpdateDefectDto): Promise<QualityDefect> {
    const defect = await this.findDefect(id);
    Object.assign(defect, dto);
    return this.defectRepository.save(defect);
  }

  async uploadDefectPhoto(id: string, file: Express.Multer.File): Promise<QualityDefect> {
    const defect = await this.findDefect(id);
    defect.photo_url = `/uploads/quality/defects/${file.filename}`;
    return this.defectRepository.save(defect);
  }

  // Quality Rejections
  async createRejection(dto: CreateRejectionDto, userId: string): Promise<QualityRejection> {
    const rejectionNumber = await this.generateRejectionNumber();

    const rejection = this.rejectionRepository.create({
      ...dto,
      rejection_number: rejectionNumber,
      rejected_by_id: userId,
    });

    return this.rejectionRepository.save(rejection);
  }

  async findAllRejections(jobId?: string): Promise<{ data: QualityRejection[]; total: number }> {
    const query = this.rejectionRepository.createQueryBuilder('rejection')
      .leftJoinAndSelect('rejection.job', 'job')
      .leftJoinAndSelect('rejection.rejected_by', 'rejected_by');

    if (jobId) {
      query.andWhere('rejection.job_id = :job_id', { job_id: jobId });
    }

    query.orderBy('rejection.created_at', 'DESC');

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async findRejection(id: string): Promise<QualityRejection> {
    const rejection = await this.rejectionRepository.findOne({
      where: { id },
      relations: ['job', 'rejected_by'],
    });

    if (!rejection) {
      throw new NotFoundException('Rejection not found');
    }

    return rejection;
  }

  async updateRejection(id: string, dto: UpdateRejectionDto): Promise<QualityRejection> {
    const rejection = await this.findRejection(id);
    Object.assign(rejection, dto);

    if (dto.is_resolved && !rejection.resolved_at) {
      rejection.resolved_at = new Date();
    }

    return this.rejectionRepository.save(rejection);
  }

  // Customer Complaints
  async createComplaint(dto: CreateComplaintDto, userId: string, file?: Express.Multer.File): Promise<CustomerComplaint> {
    const complaintNumber = await this.generateComplaintNumber();

    const complaint = this.complaintRepository.create({
      ...dto,
      complaint_number: complaintNumber,
      created_by_id: userId,
      photo_url: file ? `/uploads/quality/complaints/${file.filename}` : undefined,
    });

    return this.complaintRepository.save(complaint);
  }

  async findAllComplaints(filters?: {
    customer_id?: string;
    status?: ComplaintStatus;
    severity?: string;
  }): Promise<{ data: CustomerComplaint[]; total: number }> {
    const query = this.complaintRepository.createQueryBuilder('complaint')
      .leftJoinAndSelect('complaint.customer', 'customer')
      .leftJoinAndSelect('complaint.job', 'job')
      .leftJoinAndSelect('complaint.assigned_to', 'assigned_to')
      .leftJoinAndSelect('complaint.created_by', 'created_by');

    if (filters?.customer_id) {
      query.andWhere('complaint.customer_id = :customer_id', { customer_id: filters.customer_id });
    }

    if (filters?.status) {
      query.andWhere('complaint.status = :status', { status: filters.status });
    }

    if (filters?.severity) {
      query.andWhere('complaint.severity = :severity', { severity: filters.severity });
    }

    query.orderBy('complaint.created_at', 'DESC');

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async findComplaint(id: string): Promise<CustomerComplaint> {
    const complaint = await this.complaintRepository.findOne({
      where: { id },
      relations: ['customer', 'job', 'assigned_to', 'created_by'],
    });

    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    return complaint;
  }

  async updateComplaint(id: string, dto: UpdateComplaintDto): Promise<CustomerComplaint> {
    const complaint = await this.findComplaint(id);
    Object.assign(complaint, dto);
    return this.complaintRepository.save(complaint);
  }

  async resolveComplaint(id: string, dto: ResolveComplaintDto): Promise<CustomerComplaint> {
    const complaint = await this.findComplaint(id);

    complaint.status = ComplaintStatus.RESOLVED;
    complaint.resolution_notes = dto.resolution_notes;
    complaint.corrective_action = dto.corrective_action || complaint.corrective_action;
    complaint.preventive_action = dto.preventive_action || complaint.preventive_action;
    complaint.resolved_at = new Date();

    return this.complaintRepository.save(complaint);
  }

  async uploadComplaintPhoto(id: string, file: Express.Multer.File): Promise<CustomerComplaint> {
    const complaint = await this.findComplaint(id);
    complaint.photo_url = `/uploads/quality/complaints/${file.filename}`;
    return this.complaintRepository.save(complaint);
  }

  // Quality Metrics
  async getQualityMetrics(startDate?: Date, endDate?: Date): Promise<any> {
    const query = this.inspectionRepository.createQueryBuilder('inspection');

    if (startDate && endDate) {
      query.andWhere('inspection.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const totalInspections = await query.getCount();
    const passedInspections = await query.clone().andWhere('inspection.status = :status', { status: InspectionStatus.PASSED }).getCount();
    const failedInspections = await query.clone().andWhere('inspection.status = :status', { status: InspectionStatus.FAILED }).getCount();

    const firstPassYield = totalInspections > 0 ? (passedInspections / totalInspections) * 100 : 0;

    // Defect rate by category
    const defectsByCategory = await this.defectRepository
      .createQueryBuilder('defect')
      .select('defect.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('defect.category')
      .getRawMany();

    // Rejection rate
    const totalRejections = await this.rejectionRepository.count();
    const rejectionRate = totalInspections > 0 ? (totalRejections / totalInspections) * 100 : 0;

    // Customer complaints
    const openComplaints = await this.complaintRepository.count({ where: { status: ComplaintStatus.OPEN } });
    const totalComplaints = await this.complaintRepository.count();

    return {
      first_pass_yield: Math.round(firstPassYield * 100) / 100,
      total_inspections: totalInspections,
      passed_inspections: passedInspections,
      failed_inspections: failedInspections,
      defects_by_category: defectsByCategory,
      rejection_rate: Math.round(rejectionRate * 100) / 100,
      total_rejections: totalRejections,
      open_complaints: openComplaints,
      total_complaints: totalComplaints,
    };
  }

  // Helper methods
  private async generateInspectionNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    const lastInspection = await this.inspectionRepository
      .createQueryBuilder('inspection')
      .where('inspection.inspection_number LIKE :pattern', { pattern: `INS-${dateStr}-%` })
      .orderBy('inspection.inspection_number', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastInspection) {
      const lastSequence = parseInt(lastInspection.inspection_number.split('-')[2], 10);
      sequence = lastSequence + 1;
    }

    return `INS-${dateStr}-${sequence.toString().padStart(3, '0')}`;
  }

  private async generateRejectionNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    const lastRejection = await this.rejectionRepository
      .createQueryBuilder('rejection')
      .where('rejection.rejection_number LIKE :pattern', { pattern: `REJ-${dateStr}-%` })
      .orderBy('rejection.rejection_number', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastRejection) {
      const lastSequence = parseInt(lastRejection.rejection_number.split('-')[2], 10);
      sequence = lastSequence + 1;
    }

    return `REJ-${dateStr}-${sequence.toString().padStart(3, '0')}`;
  }

  private async generateComplaintNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    const lastComplaint = await this.complaintRepository
      .createQueryBuilder('complaint')
      .where('complaint.complaint_number LIKE :pattern', { pattern: `CMP-${dateStr}-%` })
      .orderBy('complaint.complaint_number', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastComplaint) {
      const lastSequence = parseInt(lastComplaint.complaint_number.split('-')[2], 10);
      sequence = lastSequence + 1;
    }

    return `CMP-${dateStr}-${sequence.toString().padStart(3, '0')}`;
  }
}
