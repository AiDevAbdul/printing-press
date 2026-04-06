import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { DispatchService } from './dispatch.service';
import {
  CreateDeliveryDto,
  UpdateDeliveryDto,
  MarkAsPackedDto,
  DispatchDeliveryDto,
  MarkAsDeliveredDto,
  AddTrackingUpdateDto,
  GenerateChallanDto,
} from './dto/dispatch.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { DeliveryStatus } from './entities/delivery.entity';

// Multer configuration for POD uploads
const podStorage = diskStorage({
  destination: './uploads/pod',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `pod-${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@Controller('dispatch')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  // Deliveries
  @Post('deliveries')
  @Roles(UserRole.ADMIN, UserRole.PLANNER)
  createDelivery(@Body() dto: CreateDeliveryDto, @CurrentUser() user: any) {
    return this.dispatchService.createDelivery(dto, user.id, user.company_id);
  }

  @Get('deliveries')
  findAllDeliveries(
    @Query('status') status?: DeliveryStatus,
    @Query('customer_id') customerId?: string,
    @Query('from_date') fromDate?: string,
    @Query('to_date') toDate?: string,
    @CurrentUser() user?: any,
  ) {
    return this.dispatchService.findAll(user.company_id, {
      status,
      customer_id: customerId,
      from_date: fromDate,
      to_date: toDate,
    });
  }

  @Get('deliveries/:id')
  findOneDelivery(@Param('id') id: string, @CurrentUser() user: any) {
    return this.dispatchService.findOne(id, user.company_id);
  }

  @Patch('deliveries/:id')
  @Roles(UserRole.ADMIN, UserRole.PLANNER)
  updateDelivery(@Param('id') id: string, @Body() dto: UpdateDeliveryDto, @CurrentUser() user: any) {
    return this.dispatchService.update(id, user.company_id, dto);
  }

  @Post('deliveries/:id/pack')
  @Roles(UserRole.ADMIN, UserRole.PLANNER)
  markAsPacked(@Param('id') id: string, @Body() dto: MarkAsPackedDto, @CurrentUser() user: any) {
    return this.dispatchService.markAsPacked(id, user.company_id, dto, user.id);
  }

  @Post('deliveries/:id/dispatch')
  @Roles(UserRole.ADMIN, UserRole.PLANNER)
  dispatchDelivery(@Param('id') id: string, @Body() dto: DispatchDeliveryDto, @CurrentUser() user: any) {
    return this.dispatchService.dispatch(id, user.company_id, dto, user.id);
  }

  @Post('deliveries/:id/deliver')
  @UseInterceptors(FileInterceptor('pod_photo', { storage: podStorage }))
  markAsDelivered(
    @Param('id') id: string,
    @Body() dto: MarkAsDeliveredDto,
    @CurrentUser() user: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.dispatchService.markAsDelivered(id, user.company_id, dto, user.id, file);
  }

  @Post('deliveries/:id/upload-pod')
  @UseInterceptors(FileInterceptor('pod_photo', { storage: podStorage }))
  uploadPOD(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @CurrentUser() user: any) {
    return this.dispatchService.uploadPOD(id, user.company_id, file);
  }

  // Tracking
  @Post('deliveries/:id/track')
  addTrackingUpdate(
    @Param('id') id: string,
    @Body() dto: AddTrackingUpdateDto,
    @CurrentUser() user: any,
  ) {
    return this.dispatchService.addTrackingUpdate(id, dto, user.id, user.company_id);
  }

  @Get('deliveries/:id/tracking-history')
  getTrackingHistory(@Param('id') id: string, @CurrentUser() user: any) {
    return this.dispatchService.getTrackingHistory(id, user.company_id);
  }

  // Challan
  @Post('deliveries/:id/challan')
  @Roles(UserRole.ADMIN, UserRole.PLANNER)
  generateChallan(
    @Param('id') id: string,
    @Body() dto: GenerateChallanDto,
    @CurrentUser() user: any,
  ) {
    return this.dispatchService.generateChallan(id, user.company_id, dto, user.id);
  }

  @Get('deliveries/:id/challan')
  getChallan(@Param('id') id: string, @CurrentUser() user: any) {
    return this.dispatchService.getChallan(id, user.company_id);
  }

  // Metrics
  @Get('metrics')
  getDeliveryMetrics(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string, @CurrentUser() user?: any) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.dispatchService.getDeliveryMetrics(user.company_id, start, end);
  }
}
