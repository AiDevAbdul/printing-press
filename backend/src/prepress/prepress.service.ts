import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Design, DesignStatus, DesignType, ProductCategory } from './entities/design.entity';
import { DesignApproval, ApprovalStatus } from './entities/design-approval.entity';
import { DesignAttachment } from './entities/design-attachment.entity';
import { ProductSpecification, SpecStatus } from './entities/product-specification.entity';
import { SpecificationApproval, ApprovalStatus as SpecApprovalStatus } from './entities/specification-approval.entity';
import { CreateDesignDto, UpdateDesignDto } from './dto/design.dto';
import { CreateDesignApprovalDto, UpdateDesignApprovalDto } from './dto/design-approval.dto';
import { CreateDesignAttachmentDto } from './dto/design-attachment.dto';
import { CreateProductSpecificationDto, UpdateProductSpecificationDto, CreateSpecificationApprovalDto, UpdateSpecificationApprovalDto } from './dto/product-specification.dto';

@Injectable()
export class PrepressService {
  constructor(
    @InjectRepository(Design)
    private designRepository: Repository<Design>,
    @InjectRepository(DesignApproval)
    private approvalRepository: Repository<DesignApproval>,
    @InjectRepository(DesignAttachment)
    private attachmentRepository: Repository<DesignAttachment>,
    @InjectRepository(ProductSpecification)
    private specificationRepository: Repository<ProductSpecification>,
    @InjectRepository(SpecificationApproval)
    private specApprovalRepository: Repository<SpecificationApproval>,
  ) {}

  // Design CRUD Operations
  async createDesign(companyId: string, createDesignDto: CreateDesignDto): Promise<Design> {
    const design = this.designRepository.create({
      ...createDesignDto,
      company_id: companyId,
    });
    return this.designRepository.save(design);
  }

  async getAllDesigns(companyId: string): Promise<Design[]> {
    return this.designRepository.find({
      where: { company_id: companyId },
      relations: ['designer', 'approvals', 'attachments'],
      order: { created_at: 'DESC' },
    });
  }

  async getDesignsByStatus(companyId: string, status: DesignStatus): Promise<Design[]> {
    return this.designRepository.find({
      where: { company_id: companyId, status },
      relations: ['designer', 'approvals', 'attachments'],
      order: { created_at: 'DESC' },
    });
  }

  async getDesignsByCategory(companyId: string, category: ProductCategory): Promise<Design[]> {
    return this.designRepository.find({
      where: { company_id: companyId, product_category: category },
      relations: ['designer', 'approvals', 'attachments'],
      order: { created_at: 'DESC' },
    });
  }

  async getDesignsByType(companyId: string, type: DesignType): Promise<Design[]> {
    return this.designRepository.find({
      where: { company_id: companyId, design_type: type },
      relations: ['designer', 'approvals', 'attachments'],
      order: { created_at: 'DESC' },
    });
  }

  async getDesignById(companyId: string, designId: string): Promise<Design> {
    const design = await this.designRepository.findOne({
      where: { id: designId, company_id: companyId },
      relations: ['designer', 'approvals', 'approvals.approver', 'attachments', 'attachments.uploaded_by'],
    });

    if (!design) {
      throw new NotFoundException(`Design with ID ${designId} not found`);
    }

    return design;
  }

  async updateDesign(companyId: string, designId: string, updateDesignDto: UpdateDesignDto): Promise<Design> {
    const design = await this.getDesignById(companyId, designId);
    Object.assign(design, updateDesignDto);
    return this.designRepository.save(design);
  }

  async deleteDesign(companyId: string, designId: string): Promise<void> {
    const design = await this.getDesignById(companyId, designId);
    await this.designRepository.remove(design);
  }

  async searchDesigns(companyId: string, query: string): Promise<Design[]> {
    return this.designRepository
      .createQueryBuilder('design')
      .where('design.company_id = :companyId', { companyId })
      .andWhere(
        '(design.name ILIKE :query OR design.product_name ILIKE :query OR design.notes ILIKE :query)',
        { query: `%${query}%` },
      )
      .leftJoinAndSelect('design.designer', 'designer')
      .leftJoinAndSelect('design.approvals', 'approvals')
      .leftJoinAndSelect('design.attachments', 'attachments')
      .orderBy('design.created_at', 'DESC')
      .getMany();
  }

  // Design Approval Operations
  async createApproval(companyId: string, createApprovalDto: CreateDesignApprovalDto): Promise<DesignApproval> {
    // Verify design exists
    await this.getDesignById(companyId, createApprovalDto.design_id);

    const approval = this.approvalRepository.create({
      ...createApprovalDto,
      company_id: companyId,
    });
    return this.approvalRepository.save(approval);
  }

  async getApprovalsByDesign(companyId: string, designId: string): Promise<DesignApproval[]> {
    // Verify design exists
    await this.getDesignById(companyId, designId);

    return this.approvalRepository.find({
      where: { company_id: companyId, design_id: designId },
      relations: ['approver'],
      order: { created_at: 'DESC' },
    });
  }

  async getApprovalById(companyId: string, approvalId: string): Promise<DesignApproval> {
    const approval = await this.approvalRepository.findOne({
      where: { id: approvalId, company_id: companyId },
      relations: ['design', 'approver'],
    });

    if (!approval) {
      throw new NotFoundException(`Approval with ID ${approvalId} not found`);
    }

    return approval;
  }

  async updateApproval(
    companyId: string,
    approvalId: string,
    updateApprovalDto: UpdateDesignApprovalDto,
  ): Promise<DesignApproval> {
    const approval = await this.getApprovalById(companyId, approvalId);
    Object.assign(approval, updateApprovalDto);
    return this.approvalRepository.save(approval);
  }

  async deleteApproval(companyId: string, approvalId: string): Promise<void> {
    const approval = await this.getApprovalById(companyId, approvalId);
    await this.approvalRepository.remove(approval);
  }

  // Design Attachment Operations
  async addAttachment(companyId: string, createAttachmentDto: CreateDesignAttachmentDto): Promise<DesignAttachment> {
    // Verify design exists
    await this.getDesignById(companyId, createAttachmentDto.design_id);

    const attachment = this.attachmentRepository.create({
      ...createAttachmentDto,
      company_id: companyId,
    });
    return this.attachmentRepository.save(attachment);
  }

  async getAttachmentsByDesign(companyId: string, designId: string): Promise<DesignAttachment[]> {
    // Verify design exists
    await this.getDesignById(companyId, designId);

    return this.attachmentRepository.find({
      where: { company_id: companyId, design_id: designId },
      relations: ['uploaded_by'],
      order: { created_at: 'DESC' },
    });
  }

  async getAttachmentById(companyId: string, attachmentId: string): Promise<DesignAttachment> {
    const attachment = await this.attachmentRepository.findOne({
      where: { id: attachmentId, company_id: companyId },
      relations: ['design', 'uploaded_by'],
    });

    if (!attachment) {
      throw new NotFoundException(`Attachment with ID ${attachmentId} not found`);
    }

    return attachment;
  }

  async deleteAttachment(companyId: string, attachmentId: string): Promise<void> {
    const attachment = await this.getAttachmentById(companyId, attachmentId);
    await this.attachmentRepository.remove(attachment);
  }

  // Dashboard Statistics
  async getDesignStats(companyId: string) {
    const total = await this.designRepository.count({ where: { company_id: companyId } });
    const inDesign = await this.designRepository.count({
      where: { company_id: companyId, status: DesignStatus.IN_DESIGN },
    });
    const waitingForData = await this.designRepository.count({
      where: { company_id: companyId, status: DesignStatus.WAITING_FOR_DATA },
    });
    const approved = await this.designRepository.count({
      where: { company_id: companyId, status: DesignStatus.APPROVED },
    });
    const rejected = await this.designRepository.count({
      where: { company_id: companyId, status: DesignStatus.REJECTED },
    });

    return {
      total,
      inDesign,
      waitingForData,
      approved,
      rejected,
    };
  }

  // Product Specification CRUD Operations
  async createSpecification(
    companyId: string,
    createSpecDto: CreateProductSpecificationDto,
  ): Promise<ProductSpecification> {
    const specification = this.specificationRepository.create({
      ...createSpecDto,
      company_id: companyId,
    });
    return this.specificationRepository.save(specification);
  }

  async getAllSpecifications(companyId: string): Promise<ProductSpecification[]> {
    return this.specificationRepository.find({
      where: { company_id: companyId },
      relations: ['design', 'prepared_by', 'received_by', 'approvals', 'approvals.approver'],
      order: { created_at: 'DESC' },
    });
  }

  async getSpecificationById(companyId: string, specId: string): Promise<ProductSpecification> {
    const specification = await this.specificationRepository.findOne({
      where: { id: specId, company_id: companyId },
      relations: ['design', 'prepared_by', 'received_by', 'approvals', 'approvals.approver'],
    });

    if (!specification) {
      throw new NotFoundException(`Specification with ID ${specId} not found`);
    }

    return specification;
  }

  async updateSpecification(
    companyId: string,
    specId: string,
    updateSpecDto: UpdateProductSpecificationDto,
  ): Promise<ProductSpecification> {
    const specification = await this.getSpecificationById(companyId, specId);
    Object.assign(specification, updateSpecDto);
    return this.specificationRepository.save(specification);
  }

  async deleteSpecification(companyId: string, specId: string): Promise<void> {
    const specification = await this.getSpecificationById(companyId, specId);
    await this.specificationRepository.remove(specification);
  }

  async getSpecificationsByDesign(companyId: string, designId: string): Promise<ProductSpecification[]> {
    return this.specificationRepository.find({
      where: { company_id: companyId, design_id: designId },
      relations: ['prepared_by', 'received_by', 'approvals', 'approvals.approver'],
      order: { created_at: 'DESC' },
    });
  }

  async getSpecificationsByStatus(companyId: string, status: SpecStatus): Promise<ProductSpecification[]> {
    return this.specificationRepository.find({
      where: { company_id: companyId, status },
      relations: ['design', 'prepared_by', 'received_by', 'approvals', 'approvals.approver'],
      order: { created_at: 'DESC' },
    });
  }

  async searchSpecifications(companyId: string, query: string): Promise<ProductSpecification[]> {
    return this.specificationRepository
      .createQueryBuilder('spec')
      .where('spec.company_id = :companyId', { companyId })
      .andWhere(
        '(spec.product_name ILIKE :query OR spec.file_folder_name ILIKE :query OR spec.form_number ILIKE :query)',
        { query: `%${query}%` },
      )
      .leftJoinAndSelect('spec.design', 'design')
      .leftJoinAndSelect('spec.prepared_by', 'prepared_by')
      .leftJoinAndSelect('spec.received_by', 'received_by')
      .leftJoinAndSelect('spec.approvals', 'approvals')
      .leftJoinAndSelect('approvals.approver', 'approver')
      .orderBy('spec.created_at', 'DESC')
      .getMany();
  }

  // Specification Approval Operations
  async createSpecApproval(
    companyId: string,
    createApprovalDto: CreateSpecificationApprovalDto,
  ): Promise<SpecificationApproval> {
    // Verify specification exists
    await this.getSpecificationById(companyId, createApprovalDto.specification_id);

    const approval = this.specApprovalRepository.create({
      ...createApprovalDto,
      company_id: companyId,
    });
    return this.specApprovalRepository.save(approval);
  }

  async getSpecApprovalsBySpecification(
    companyId: string,
    specId: string,
  ): Promise<SpecificationApproval[]> {
    // Verify specification exists
    await this.getSpecificationById(companyId, specId);

    return this.specApprovalRepository.find({
      where: { company_id: companyId, specification_id: specId },
      relations: ['approver'],
      order: { created_at: 'DESC' },
    });
  }

  async getSpecApprovalById(companyId: string, approvalId: string): Promise<SpecificationApproval> {
    const approval = await this.specApprovalRepository.findOne({
      where: { id: approvalId, company_id: companyId },
      relations: ['specification', 'approver'],
    });

    if (!approval) {
      throw new NotFoundException(`Specification approval with ID ${approvalId} not found`);
    }

    return approval;
  }

  async updateSpecApproval(
    companyId: string,
    approvalId: string,
    updateApprovalDto: UpdateSpecificationApprovalDto,
  ): Promise<SpecificationApproval> {
    const approval = await this.getSpecApprovalById(companyId, approvalId);
    Object.assign(approval, updateApprovalDto);
    if (updateApprovalDto.status === SpecApprovalStatus.APPROVED) {
      approval.approved_at = new Date();
    }
    return this.specApprovalRepository.save(approval);
  }

  async deleteSpecApproval(companyId: string, approvalId: string): Promise<void> {
    const approval = await this.getSpecApprovalById(companyId, approvalId);
    await this.specApprovalRepository.remove(approval);
  }

  // Specification Statistics
  async getSpecificationStats(companyId: string) {
    const total = await this.specificationRepository.count({ where: { company_id: companyId } });
    const draft = await this.specificationRepository.count({
      where: { company_id: companyId, status: SpecStatus.DRAFT },
    });
    const pendingApproval = await this.specificationRepository.count({
      where: { company_id: companyId, status: SpecStatus.PENDING_APPROVAL },
    });
    const approved = await this.specificationRepository.count({
      where: { company_id: companyId, status: SpecStatus.APPROVED },
    });
    const rejected = await this.specificationRepository.count({
      where: { company_id: companyId, status: SpecStatus.REJECTED },
    });

    return {
      total,
      draft,
      pendingApproval,
      approved,
      rejected,
    };
  }
}
