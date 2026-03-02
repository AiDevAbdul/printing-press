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
  createCheckpoint(@Body() dto: CreateCheckpointDto) {
    return this.qualityService.createCheckpoint(dto);
  }

  @Get('checkpoints')
  findAllCheckpoints(@Query('stage') stage?: string, @Query('isActive') isActive?: string) {
    return this.qualityService.findAllCheckpoints(stage, isActive === 'true');
  }

  @Get('checkpoints/:id')
  findCheckpoint(@Param('id') id: string) {
    return this.qualityService.findCheckpoint(id);
  }

  @Patch('checkpoints/:id')
  @Roles(UserRole.ADMIN)
  updateCheckpoint(@Param('id') id: string, @Body() dto: UpdateCheckpointDto) {
    return this.qualityService.updateCheckpoint(id, dto);
  }

  @Delete('checkpoints/:id')
  @Roles(UserRole.ADMIN)
  deleteCheckpoint(@Param('id') id: string) {
    return this.qualityService.deleteCheckpoint(id);
  }

  // Quality Inspections
  @Post('inspections')
  createInspection(@Body() dto: CreateInspectionDto, @Req() req: any) {
    return this.qualityService.createInspection(dto, req.user.userId);
  }

  @Get('inspections')
  findAllInspections(
    @Query('job_id') jobId?: string,
    @Query('status') status?: InspectionStatus,
    @Query('checkpoint_id') checkpointId?: string,
  ) {
    return this.qualityService.findAllInspections({
      job_id: jobId,
      status,
      checkpoint_id: checkpointId,
    });
  }

  @Get('inspections/:id')
  findInspection(@Param('id') id: string) {
    return this.qualityService.findInspection(id);
  }

  @Patch('inspections/:id')
  updateInspection(@Param('id') id: string, @Body() dto: UpdateInspectionDto) {
    return this.qualityService.updateInspection(id, dto);
  }

  @Post('inspections/:id/pass')
  passInspection(@Param('id') id: string, @Body() dto: PassInspectionDto) {
    return this.qualityService.passInspection(id, dto);
  }

  @Post('inspections/:id/fail')
  failInspection(@Param('id') id: string, @Body() dto: FailInspectionDto) {
    return this.qualityService.failInspection(id, dto);
  }

  // Quality Defects
  @Post('defects')
  @UseInterceptors(FileInterceptor('photo', { storage: defectStorage }))
  createDefect(
    @Body() dto: CreateDefectDto,
    @Req() req: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.qualityService.createDefect(dto, req.user.userId, file);
  }

  @Get('defects')
  findAllDefects(@Query('inspection_id') inspectionId?: string) {
    return this.qualityService.findAllDefects(inspectionId);
  }

  @Get('defects/:id')
  findDefect(@Param('id') id: string) {
    return this.qualityService.findDefect(id);
  }

  @Patch('defects/:id')
  updateDefect(@Param('id') id: string, @Body() dto: UpdateDefectDto) {
    return this.qualityService.updateDefect(id, dto);
  }

  @Post('defects/:id/upload-photo')
  @UseInterceptors(FileInterceptor('photo', { storage: defectStorage }))
  uploadDefectPhoto(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.qualityService.uploadDefectPhoto(id, file);
  }

  // Quality Rejections
  @Post('rejections')
  createRejection(@Body() dto: CreateRejectionDto, @Req() req: any) {
    return this.qualityService.createRejection(dto, req.user.userId);
  }

  @Get('rejections')
  findAllRejections(@Query('job_id') jobId?: string) {
    return this.qualityService.findAllRejections(jobId);
  }

  @Get('rejections/:id')
  findRejection(@Param('id') id: string) {
    return this.qualityService.findRejection(id);
  }

  @Patch('rejections/:id')
  updateRejection(@Param('id') id: string, @Body() dto: UpdateRejectionDto) {
    return this.qualityService.updateRejection(id, dto);
  }

  // Customer Complaints
  @Post('complaints')
  @UseInterceptors(FileInterceptor('photo', { storage: complaintStorage }))
  createComplaint(
    @Body() dto: CreateComplaintDto,
    @Req() req: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.qualityService.createComplaint(dto, req.user.userId, file);
  }

  @Get('complaints')
  findAllComplaints(
    @Query('customer_id') customerId?: string,
    @Query('status') status?: ComplaintStatus,
    @Query('severity') severity?: string,
  ) {
    return this.qualityService.findAllComplaints({
      customer_id: customerId,
      status,
      severity,
    });
  }

  @Get('complaints/:id')
  findComplaint(@Param('id') id: string) {
    return this.qualityService.findComplaint(id);
  }

  @Patch('complaints/:id')
  updateComplaint(@Param('id') id: string, @Body() dto: UpdateComplaintDto) {
    return this.qualityService.updateComplaint(id, dto);
  }

  @Post('complaints/:id/resolve')
  resolveComplaint(@Param('id') id: string, @Body() dto: ResolveComplaintDto) {
    return this.qualityService.resolveComplaint(id, dto);
  }

  @Post('complaints/:id/upload-photo')
  @UseInterceptors(FileInterceptor('photo', { storage: complaintStorage }))
  uploadComplaintPhoto(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.qualityService.uploadComplaintPhoto(id, file);
  }

  // Quality Metrics
  @Get('metrics')
  getQualityMetrics(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.qualityService.getQualityMetrics(start, end);
  }
}
