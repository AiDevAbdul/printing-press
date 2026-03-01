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
  createItem(@Body() createInventoryItemDto: CreateInventoryItemDto) {
    return this.inventoryService.createItem(createInventoryItemDto);
  }

  @Get('items')
  findAllItems(@Query() queryDto: QueryInventoryDto) {
    return this.inventoryService.findAllItems(queryDto);
  }

  @Get('filters/brands')
  getBrands(@Query('main_category') mainCategory?: string) {
    return this.inventoryService.getDistinctBrands(mainCategory);
  }

  @Get('filters/colors')
  getColors(@Query('main_category') mainCategory?: string) {
    return this.inventoryService.getDistinctColors(mainCategory);
  }

  @Get('filters/sizes')
  getSizes() {
    return this.inventoryService.getDistinctSizes();
  }

  @Get('filters/gsm-values')
  getGSMValues() {
    return this.inventoryService.getDistinctGSMValues();
  }

  @Get('filters/material-types')
  getMaterialTypes(@Query('main_category') mainCategory?: string) {
    return this.inventoryService.getDistinctMaterialTypes(mainCategory);
  }

  @Get('items/low-stock')
  getLowStockItems() {
    return this.inventoryService.getLowStockItems();
  }

  @Get('items/:id')
  findOneItem(@Param('id') id: string) {
    return this.inventoryService.findOneItem(id);
  }

  @Patch('items/:id')
  @Roles(UserRole.ADMIN, UserRole.INVENTORY)
  updateItem(@Param('id') id: string, @Body() updateInventoryItemDto: UpdateInventoryItemDto) {
    return this.inventoryService.updateItem(id, updateInventoryItemDto);
  }

  @Delete('items/:id')
  @Roles(UserRole.ADMIN, UserRole.INVENTORY)
  removeItem(@Param('id') id: string) {
    return this.inventoryService.removeItem(id);
  }

  @Post('transactions')
  @Roles(UserRole.ADMIN, UserRole.INVENTORY, UserRole.PLANNER)
  createTransaction(@Body() createStockTransactionDto: CreateStockTransactionDto, @CurrentUser() user: any) {
    return this.inventoryService.createTransaction(createStockTransactionDto, user.id);
  }

  @Get('transactions')
  findAllTransactions(@Query('itemId') itemId?: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.inventoryService.findAllTransactions(itemId, page, limit);
  }

  @Get('items/:id/transactions')
  getItemTransactions(@Param('id') id: string) {
    return this.inventoryService.getItemTransactions(id);
  }
}
