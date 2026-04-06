import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto, UpdateInventoryItemDto } from './dto/inventory-item.dto';
import { CreateStockTransactionDto } from './dto/stock-transaction.dto';
import { QueryInventoryDto } from './dto/query-inventory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('items')
  @Roles(UserRole.ADMIN, UserRole.INVENTORY)
  createItem(@Body() createInventoryItemDto: CreateInventoryItemDto, @CurrentUser() user: any) {
    return this.inventoryService.createItem(createInventoryItemDto, user.company_id);
  }

  @Get('items')
  findAllItems(@Query() queryDto: QueryInventoryDto, @CurrentUser() user: any) {
    return this.inventoryService.findAllItems(user.company_id, queryDto);
  }

  @Get('filters/brands')
  getBrands(@CurrentUser() user: any, @Query('main_category') mainCategory?: string) {
    return this.inventoryService.getDistinctBrands(user.company_id, mainCategory);
  }

  @Get('filters/colors')
  getColors(@CurrentUser() user: any, @Query('main_category') mainCategory?: string) {
    return this.inventoryService.getDistinctColors(user.company_id, mainCategory);
  }

  @Get('filters/sizes')
  getSizes(@CurrentUser() user: any) {
    return this.inventoryService.getDistinctSizes(user.company_id);
  }

  @Get('filters/gsm-values')
  getGSMValues(@CurrentUser() user: any) {
    return this.inventoryService.getDistinctGSMValues(user.company_id);
  }

  @Get('filters/material-types')
  getMaterialTypes(@CurrentUser() user: any, @Query('main_category') mainCategory?: string) {
    return this.inventoryService.getDistinctMaterialTypes(user.company_id, mainCategory);
  }

  @Get('items/low-stock')
  getLowStockItems(@CurrentUser() user: any) {
    return this.inventoryService.getLowStockItems(user.company_id);
  }

  @Get('items/:id')
  findOneItem(@Param('id') id: string, @CurrentUser() user: any) {
    return this.inventoryService.findOneItem(id, user.company_id);
  }

  @Patch('items/:id')
  @Roles(UserRole.ADMIN, UserRole.INVENTORY)
  updateItem(@Param('id') id: string, @Body() updateInventoryItemDto: UpdateInventoryItemDto, @CurrentUser() user: any) {
    return this.inventoryService.updateItem(id, user.company_id, updateInventoryItemDto);
  }

  @Delete('items/:id')
  @Roles(UserRole.ADMIN, UserRole.INVENTORY)
  removeItem(@Param('id') id: string, @CurrentUser() user: any) {
    return this.inventoryService.removeItem(id, user.company_id);
  }

  @Post('transactions')
  @Roles(UserRole.ADMIN, UserRole.INVENTORY, UserRole.PLANNER)
  createTransaction(@Body() createStockTransactionDto: CreateStockTransactionDto, @CurrentUser() user: any) {
    return this.inventoryService.createTransaction(createStockTransactionDto, user.id, user.company_id);
  }

  @Get('transactions')
  findAllTransactions(@CurrentUser() user: any, @Query('itemId') itemId?: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.inventoryService.findAllTransactions(user.company_id, itemId, page, limit);
  }

  @Get('items/:id/transactions')
  getItemTransactions(@Param('id') id: string, @CurrentUser() user: any) {
    return this.inventoryService.getItemTransactions(id, user.company_id);
  }
}
