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
  Request,
} from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import {
  CreateQuotationDto,
  UpdateQuotationDto,
  CalculatePricingDto,
  ConvertToOrderDto,
} from './dto/quotation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { QuotationStatus } from './entities/quotation.entity';

@Controller('quotations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SALES)
  create(@Body() createQuotationDto: CreateQuotationDto, @CurrentUser() user: any) {
    return this.quotationsService.create(createQuotationDto, user.id, user.company_id);
  }

  @Post('calculate')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  calculatePricing(@Body() calculatePricingDto: CalculatePricingDto) {
    return this.quotationsService.calculatePricing(calculatePricingDto);
  }

  @Get()
  findAll(
    @Query('status') status?: QuotationStatus,
    @Query('customer_id') customer_id?: string,
    @Query('search') search?: string,
    @Query('from_date') from_date?: string,
    @Query('to_date') to_date?: string,
    @CurrentUser() user?: any,
  ) {
    return this.quotationsService.findAll(user.company_id, {
      status,
      customer_id,
      search,
      from_date,
      to_date,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.quotationsService.findOne(id, user.company_id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  update(
    @Param('id') id: string,
    @Body() updateQuotationDto: UpdateQuotationDto,
    @CurrentUser() user: any,
  ) {
    return this.quotationsService.update(id, user.company_id, updateQuotationDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.quotationsService.remove(id, user.company_id);
  }

  @Post(':id/send')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  send(@Param('id') id: string, @Request() req) {
    return this.quotationsService.send(id, req.user.company_id, req.user.userId);
  }

  @Post(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  approve(@Param('id') id: string, @Request() req) {
    return this.quotationsService.approve(id, req.user.company_id, req.user.userId);
  }

  @Post(':id/reject')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  reject(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    return this.quotationsService.reject(id, req.user.company_id, req.user.userId, reason);
  }

  @Post(':id/convert-to-order')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  convertToOrder(
    @Param('id') id: string,
    @Body() convertToOrderDto: ConvertToOrderDto,
    @Request() req,
  ) {
    return this.quotationsService.convertToOrder(
      id,
      req.user.company_id,
      req.user.userId,
      convertToOrderDto,
    );
  }

  @Post(':id/revise')
  @Roles(UserRole.ADMIN, UserRole.SALES)
  createRevision(@Param('id') id: string, @Request() req) {
    return this.quotationsService.createRevision(id, req.user.company_id, req.user.userId);
  }

  @Get(':id/history')
  getHistory(@Param('id') id: string) {
    return this.quotationsService.getHistory(id);
  }
}
