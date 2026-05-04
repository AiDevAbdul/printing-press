import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PrepressService } from './prepress.service';
import { CreateDesignDto, UpdateDesignDto } from './dto/design.dto';
import { CreateDesignApprovalDto, UpdateDesignApprovalDto } from './dto/design-approval.dto';
import { CreateDesignAttachmentDto } from './dto/design-attachment.dto';
import { CreateProductSpecificationDto, UpdateProductSpecificationDto, CreateSpecificationApprovalDto, UpdateSpecificationApprovalDto } from './dto/product-specification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DesignStatus, DesignType, ProductCategory } from './entities/design.entity';
import { SpecStatus } from './entities/product-specification.entity';

@Controller('prepress')
@UseGuards(JwtAuthGuard)
export class PrepressController {
  constructor(private readonly prepressService: PrepressService) {}

  // Design Endpoints
  @Post('designs')
  async createDesign(@CurrentUser() user: any, @Body() createDesignDto: CreateDesignDto) {
    return this.prepressService.createDesign(user.company_id, createDesignDto);
  }

  @Get('designs')
  async getAllDesigns(@CurrentUser() user: any) {
    return this.prepressService.getAllDesigns(user.company_id);
  }

  @Get('designs/status/:status')
  async getDesignsByStatus(
    @CurrentUser() user: any,
    @Param('status') status: DesignStatus,
  ) {
    return this.prepressService.getDesignsByStatus(user.company_id, status);
  }

  @Get('designs/category/:category')
  async getDesignsByCategory(
    @CurrentUser() user: any,
    @Param('category') category: ProductCategory,
  ) {
    return this.prepressService.getDesignsByCategory(user.company_id, category);
  }

  @Get('designs/type/:type')
  async getDesignsByType(
    @CurrentUser() user: any,
    @Param('type') type: DesignType,
  ) {
    return this.prepressService.getDesignsByType(user.company_id, type);
  }

  @Get('designs/search')
  async searchDesigns(
    @CurrentUser() user: any,
    @Query('q') query: string,
  ) {
    return this.prepressService.searchDesigns(user.company_id, query);
  }

  @Get('designs/:id')
  async getDesignById(
    @CurrentUser() user: any,
    @Param('id') designId: string,
  ) {
    return this.prepressService.getDesignById(user.company_id, designId);
  }

  @Put('designs/:id')
  async updateDesign(
    @CurrentUser() user: any,
    @Param('id') designId: string,
    @Body() updateDesignDto: UpdateDesignDto,
  ) {
    return this.prepressService.updateDesign(user.company_id, designId, updateDesignDto);
  }

  @Delete('designs/:id')
  async deleteDesign(
    @CurrentUser() user: any,
    @Param('id') designId: string,
  ) {
    return this.prepressService.deleteDesign(user.company_id, designId);
  }

  // Approval Endpoints
  @Post('approvals')
  async createApproval(
    @CurrentUser() user: any,
    @Body() createApprovalDto: CreateDesignApprovalDto,
  ) {
    return this.prepressService.createApproval(user.company_id, createApprovalDto);
  }

  @Get('approvals/design/:designId')
  async getApprovalsByDesign(
    @CurrentUser() user: any,
    @Param('designId') designId: string,
  ) {
    return this.prepressService.getApprovalsByDesign(user.company_id, designId);
  }

  @Get('approvals/:id')
  async getApprovalById(
    @CurrentUser() user: any,
    @Param('id') approvalId: string,
  ) {
    return this.prepressService.getApprovalById(user.company_id, approvalId);
  }

  @Put('approvals/:id')
  async updateApproval(
    @CurrentUser() user: any,
    @Param('id') approvalId: string,
    @Body() updateApprovalDto: UpdateDesignApprovalDto,
  ) {
    return this.prepressService.updateApproval(user.company_id, approvalId, updateApprovalDto);
  }

  @Delete('approvals/:id')
  async deleteApproval(
    @CurrentUser() user: any,
    @Param('id') approvalId: string,
  ) {
    return this.prepressService.deleteApproval(user.company_id, approvalId);
  }

  // Attachment Endpoints
  @Post('attachments')
  async addAttachment(
    @CurrentUser() user: any,
    @Body() createAttachmentDto: CreateDesignAttachmentDto,
  ) {
    return this.prepressService.addAttachment(user.company_id, createAttachmentDto);
  }

  @Get('attachments/design/:designId')
  async getAttachmentsByDesign(
    @CurrentUser() user: any,
    @Param('designId') designId: string,
  ) {
    return this.prepressService.getAttachmentsByDesign(user.company_id, designId);
  }

  @Get('attachments/:id')
  async getAttachmentById(
    @CurrentUser() user: any,
    @Param('id') attachmentId: string,
  ) {
    return this.prepressService.getAttachmentById(user.company_id, attachmentId);
  }

  @Delete('attachments/:id')
  async deleteAttachment(
    @CurrentUser() user: any,
    @Param('id') attachmentId: string,
  ) {
    return this.prepressService.deleteAttachment(user.company_id, attachmentId);
  }

  // Statistics
  @Get('stats/overview')
  async getDesignStats(@CurrentUser() user: any) {
    return this.prepressService.getDesignStats(user.company_id);
  }

  // Product Specification Endpoints
  @Post('specifications')
  async createSpecification(
    @CurrentUser() user: any,
    @Body() createSpecDto: CreateProductSpecificationDto,
  ) {
    return this.prepressService.createSpecification(user.company_id, createSpecDto);
  }

  @Get('specifications')
  async getAllSpecifications(@CurrentUser() user: any) {
    return this.prepressService.getAllSpecifications(user.company_id);
  }

  @Get('specifications/status/:status')
  async getSpecificationsByStatus(
    @CurrentUser() user: any,
    @Param('status') status: SpecStatus,
  ) {
    return this.prepressService.getSpecificationsByStatus(user.company_id, status);
  }

  @Get('specifications/design/:designId')
  async getSpecificationsByDesign(
    @CurrentUser() user: any,
    @Param('designId') designId: string,
  ) {
    return this.prepressService.getSpecificationsByDesign(user.company_id, designId);
  }

  @Get('specifications/search')
  async searchSpecifications(
    @CurrentUser() user: any,
    @Query('q') query: string,
  ) {
    return this.prepressService.searchSpecifications(user.company_id, query);
  }

  @Get('specifications/:id')
  async getSpecificationById(
    @CurrentUser() user: any,
    @Param('id') specId: string,
  ) {
    return this.prepressService.getSpecificationById(user.company_id, specId);
  }

  @Put('specifications/:id')
  async updateSpecification(
    @CurrentUser() user: any,
    @Param('id') specId: string,
    @Body() updateSpecDto: UpdateProductSpecificationDto,
  ) {
    return this.prepressService.updateSpecification(user.company_id, specId, updateSpecDto);
  }

  @Delete('specifications/:id')
  async deleteSpecification(
    @CurrentUser() user: any,
    @Param('id') specId: string,
  ) {
    return this.prepressService.deleteSpecification(user.company_id, specId);
  }

  // Specification Approval Endpoints
  @Post('spec-approvals')
  async createSpecApproval(
    @CurrentUser() user: any,
    @Body() createApprovalDto: CreateSpecificationApprovalDto,
  ) {
    return this.prepressService.createSpecApproval(user.company_id, createApprovalDto);
  }

  @Get('spec-approvals/specification/:specId')
  async getSpecApprovalsBySpecification(
    @CurrentUser() user: any,
    @Param('specId') specId: string,
  ) {
    return this.prepressService.getSpecApprovalsBySpecification(user.company_id, specId);
  }

  @Get('spec-approvals/:id')
  async getSpecApprovalById(
    @CurrentUser() user: any,
    @Param('id') approvalId: string,
  ) {
    return this.prepressService.getSpecApprovalById(user.company_id, approvalId);
  }

  @Put('spec-approvals/:id')
  async updateSpecApproval(
    @CurrentUser() user: any,
    @Param('id') approvalId: string,
    @Body() updateApprovalDto: UpdateSpecificationApprovalDto,
  ) {
    return this.prepressService.updateSpecApproval(user.company_id, approvalId, updateApprovalDto);
  }

  @Delete('spec-approvals/:id')
  async deleteSpecApproval(
    @CurrentUser() user: any,
    @Param('id') approvalId: string,
  ) {
    return this.prepressService.deleteSpecApproval(user.company_id, approvalId);
  }

  // Specification Statistics
  @Get('stats/specifications')
  async getSpecificationStats(@CurrentUser() user: any) {
    return this.prepressService.getSpecificationStats(user.company_id);
  }
}
