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
  createDelivery(@Body() dto: CreateDeliveryDto, @Req() req: any) {
    return this.dispatchService.createDelivery(dto, req.user.userId);
  }

  @Get('deliveries')
  findAllDeliveries(
    @Query('status') status?: DeliveryStatus,
    @Query('customer_id') customerId?: string,
    @Query('from_date') fromDate?: string,
    @Query('to_date') toDate?: string,
  ) {
    return this.dispatchService.findAll({
      status,
      customer_id: customerId,
      from_date: fromDate,
      to_date: toDate,
    });
  }

  @Get('deliveries/:id')
  findOneDelivery(@Param('id') id: string) {
    return this.dispatchService.findOne(id);
  }

  @Patch('deliveries/:id')
  @Roles(UserRole.ADMIN, UserRole.PLANNER)
  updateDelivery(@Param('id') id: string, @Body() dto: UpdateDeliveryDto) {
    return this.dispatchService.update(id, dto);
  }

  @Post('deliveries/:id/pack')
  @Roles(UserRole.ADMIN, UserRole.PLANNER)
  markAsPacked(@Param('id') id: string, @Body() dto: MarkAsPackedDto, @Req() req: any) {
    return this.dispatchService.markAsPacked(id, dto, req.user.userId);
  }

  @Post('deliveries/:id/dispatch')
  @Roles(UserRole.ADMIN, UserRole.PLANNER)
  dispatchDelivery(@Param('id') id: string, @Body() dto: DispatchDeliveryDto, @Req() req: any) {
    return this.dispatchService.dispatch(id, dto, req.user.userId);
  }

  @Post('deliveries/:id/deliver')
  @UseInterceptors(FileInterceptor('pod_photo', { storage: podStorage }))
  markAsDelivered(
    @Param('id') id: string,
    @Body() dto: MarkAsDeliveredDto,
    @Req() req: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.dispatchService.markAsDelivered(id, dto, req.user.userId, file);
  }

  @Post('deliveries/:id/upload-pod')
  @UseInterceptors(FileInterceptor('pod_photo', { storage: podStorage }))
  uploadPOD(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.dispatchService.uploadPOD(id, file);
  }

  // Tracking
  @Post('deliveries/:id/track')
  addTrackingUpdate(
    @Param('id') id: string,
    @Body() dto: AddTrackingUpdateDto,
    @Req() req: any,
  ) {
    return this.dispatchService.addTrackingUpdate(id, dto, req.user.userId);
  }

  @Get('deliveries/:id/tracking-history')
  getTrackingHistory(@Param('id') id: string) {
    return this.dispatchService.getTrackingHistory(id);
  }

  // Challan
  @Post('deliveries/:id/challan')
  @Roles(UserRole.ADMIN, UserRole.PLANNER)
  generateChallan(
    @Param('id') id: string,
    @Body() dto: GenerateChallanDto,
    @Req() req: any,
  ) {
    return this.dispatchService.generateChallan(id, dto, req.user.userId);
  }

  @Get('deliveries/:id/challan')
  getChallan(@Param('id') id: string) {
    return this.dispatchService.getChallan(id);
  }

  // Metrics
  @Get('metrics')
  getDeliveryMetrics(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.dispatchService.getDeliveryMetrics(start, end);
  }
}
