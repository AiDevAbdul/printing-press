import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { QualityService } from './quality.service';
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { InspectionStatus } from './entities/quality-inspection.entity';
import { ComplaintStatus } from './entities/customer-complaint.entity';

// Multer configuration for file uploads
const defectStorage = diskStorage({
  destination: './uploads/quality/defects',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `defect-${uniqueSuffix}${extname(file.originalname)}`);
  },
});

const complaintStorage = diskStorage({
  destination: './uploads/quality/complaints',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `complaint-${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@Controller('quality')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QualityController {
  constructor(private readonly qualityService: QualityService) {}

  // Quality Checkpoints
  @Post('checkpoints')
  @Roles(UserRole.ADMIN)
  createCheckpoint(@Body() dto: CreateCheckpointDto, @CurrentUser() user: any) {
    return this.qualityService.createCheckpoint(dto, user.company_id);
  }

  @Get('checkpoints')
  findAllCheckpoints(@CurrentUser() user: any, @Query('stage') stage?: string, @Query('isActive') isActive?: string) {
    return this.qualityService.findAllCheckpoints(user.company_id, stage, isActive === 'true');
  }

  @Get('checkpoints/:id')
  findCheckpoint(@Param('id') id: string, @CurrentUser() user: any) {
    return this.qualityService.findCheckpoint(id, user.company_id);
  }

  @Patch('checkpoints/:id')
  @Roles(UserRole.ADMIN)
  updateCheckpoint(@Param('id') id: string, @Body() dto: UpdateCheckpointDto, @CurrentUser() user: any) {
    return this.qualityService.updateCheckpoint(id, user.company_id, dto);
  }

  @Delete('checkpoints/:id')
  @Roles(UserRole.ADMIN)
  deleteCheckpoint(@Param('id') id: string, @CurrentUser() user: any) {
    return this.qualityService.deleteCheckpoint(id, user.company_id);
  }

  // Quality Inspections
  @Post('inspections')
  createInspection(@Body() dto: CreateInspectionDto, @CurrentUser() user: any) {
    return this.qualityService.createInspection(dto, user.id, user.company_id);
  }

  @Get('inspections')
  findAllInspections(
    @CurrentUser() user: any,
    @Query('job_id') jobId?: string,
    @Query('status') status?: InspectionStatus,
    @Query('checkpoint_id') checkpointId?: string,
  ) {
    return this.qualityService.findAllInspections(user.company_id, {
      job_id: jobId,
      status,
      checkpoint_id: checkpointId,
    });
  }

  @Get('inspections/:id')
  findInspection(@Param('id') id: string, @CurrentUser() user: any) {
    return this.qualityService.findInspection(id, user.company_id);
  }

  @Patch('inspections/:id')
  updateInspection(@Param('id') id: string, @Body() dto: UpdateInspectionDto, @CurrentUser() user: any) {
    return this.qualityService.updateInspection(id, user.company_id, dto);
  }

  @Post('inspections/:id/pass')
  passInspection(@Param('id') id: string, @Body() dto: PassInspectionDto, @CurrentUser() user: any) {
    return this.qualityService.passInspection(id, user.company_id, dto);
  }

  @Post('inspections/:id/fail')
  failInspection(@Param('id') id: string, @Body() dto: FailInspectionDto, @CurrentUser() user: any) {
    return this.qualityService.failInspection(id, user.company_id, dto);
  }

  // Quality Defects
  @Post('defects')
  @UseInterceptors(FileInterceptor('photo', { storage: defectStorage }))
  createDefect(
    @Body() dto: CreateDefectDto,
    @CurrentUser() user: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.qualityService.createDefect(dto, user.id, user.company_id, file);
  }

  @Get('defects')
  findAllDefects(@CurrentUser() user: any, @Query('inspection_id') inspectionId?: string) {
    return this.qualityService.findAllDefects(user.company_id, inspectionId);
  }

  @Get('defects/:id')
  findDefect(@Param('id') id: string, @CurrentUser() user: any) {
    return this.qualityService.findDefect(id, user.company_id);
  }

  @Patch('defects/:id')
  updateDefect(@Param('id') id: string, @Body() dto: UpdateDefectDto, @CurrentUser() user: any) {
    return this.qualityService.updateDefect(id, user.company_id, dto);
  }

  @Post('defects/:id/upload-photo')
  @UseInterceptors(FileInterceptor('photo', { storage: defectStorage }))
  uploadDefectPhoto(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @CurrentUser() user: any) {
    return this.qualityService.uploadDefectPhoto(id, user.company_id, file);
  }

  // Quality Rejections
  @Post('rejections')
  createRejection(@Body() dto: CreateRejectionDto, @CurrentUser() user: any) {
    return this.qualityService.createRejection(dto, user.id, user.company_id);
  }

  @Get('rejections')
  findAllRejections(@CurrentUser() user: any, @Query('job_id') jobId?: string) {
    return this.qualityService.findAllRejections(user.company_id, jobId);
  }

  @Get('rejections/:id')
  findRejection(@Param('id') id: string, @CurrentUser() user: any) {
    return this.qualityService.findRejection(id, user.company_id);
  }

  @Patch('rejections/:id')
  updateRejection(@Param('id') id: string, @Body() dto: UpdateRejectionDto, @CurrentUser() user: any) {
    return this.qualityService.updateRejection(id, user.company_id, dto);
  }

  // Customer Complaints
  @Post('complaints')
  @UseInterceptors(FileInterceptor('photo', { storage: complaintStorage }))
  createComplaint(
    @Body() dto: CreateComplaintDto,
    @CurrentUser() user: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.qualityService.createComplaint(dto, user.id, user.company_id, file);
  }

  @Get('complaints')
  findAllComplaints(
    @CurrentUser() user: any,
    @Query('customer_id') customerId?: string,
    @Query('status') status?: ComplaintStatus,
    @Query('severity') severity?: string,
  ) {
    return this.qualityService.findAllComplaints(user.company_id, {
      customer_id: customerId,
      status,
      severity,
    });
  }

  @Get('complaints/:id')
  findComplaint(@Param('id') id: string, @CurrentUser() user: any) {
    return this.qualityService.findComplaint(id, user.company_id);
  }

  @Patch('complaints/:id')
  updateComplaint(@Param('id') id: string, @Body() dto: UpdateComplaintDto, @CurrentUser() user: any) {
    return this.qualityService.updateComplaint(id, user.company_id, dto);
  }

  @Post('complaints/:id/resolve')
  resolveComplaint(@Param('id') id: string, @Body() dto: ResolveComplaintDto, @CurrentUser() user: any) {
    return this.qualityService.resolveComplaint(id, user.company_id, dto);
  }

  @Post('complaints/:id/upload-photo')
  @UseInterceptors(FileInterceptor('photo', { storage: complaintStorage }))
  uploadComplaintPhoto(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @CurrentUser() user: any) {
    return this.qualityService.uploadComplaintPhoto(id, user.company_id, file);
  }

  // Quality Metrics
  @Get('metrics')
  getQualityMetrics(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string, @CurrentUser() user?: any) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.qualityService.getQualityMetrics(user.company_id, start, end);
  }
}
