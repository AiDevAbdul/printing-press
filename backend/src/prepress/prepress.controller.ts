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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DesignStatus, DesignType, ProductCategory } from './entities/design.entity';

@Controller('api/prepress')
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
}
