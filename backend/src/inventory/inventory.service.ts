import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, LessThan } from 'typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import { StockTransaction, TransactionType } from './entities/stock-transaction.entity';
import { CreateInventoryItemDto, UpdateInventoryItemDto } from './dto/inventory-item.dto';
import { CreateStockTransactionDto } from './dto/stock-transaction.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private inventoryItemsRepository: Repository<InventoryItem>,
    @InjectRepository(StockTransaction)
    private stockTransactionsRepository: Repository<StockTransaction>,
  ) {}

  async createItem(createInventoryItemDto: CreateInventoryItemDto): Promise<InventoryItem> {
    const item = this.inventoryItemsRepository.create(createInventoryItemDto);
    return this.inventoryItemsRepository.save(item);
  }

  async findAllItems(
    category?: string,
    search?: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: InventoryItem[]; total: number }> {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.item_name = Like(`%${search}%`);
    }

    const [data, total] = await this.inventoryItemsRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return { data, total };
  }

  async findOneItem(id: string): Promise<InventoryItem> {
    const item = await this.inventoryItemsRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }
    return item;
  }

  async updateItem(id: string, updateInventoryItemDto: UpdateInventoryItemDto): Promise<InventoryItem> {
    const item = await this.findOneItem(id);
    Object.assign(item, updateInventoryItemDto);
    return this.inventoryItemsRepository.save(item);
  }

  async removeItem(id: string): Promise<void> {
    const item = await this.findOneItem(id);
    item.is_active = false;
    await this.inventoryItemsRepository.save(item);
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    return this.inventoryItemsRepository
      .createQueryBuilder('item')
      .where('item.current_stock <= item.reorder_level')
      .andWhere('item.is_active = :isActive', { isActive: true })
      .getMany();
  }

  async createTransaction(
    createStockTransactionDto: CreateStockTransactionDto,
    userId: string,
  ): Promise<StockTransaction> {
    const item = await this.findOneItem(createStockTransactionDto.item_id);

    // Update stock based on transaction type
    if (createStockTransactionDto.transaction_type === TransactionType.STOCK_IN) {
      item.current_stock = Number(item.current_stock) + Number(createStockTransactionDto.quantity);
    } else if (createStockTransactionDto.transaction_type === TransactionType.STOCK_OUT) {
      if (Number(item.current_stock) < Number(createStockTransactionDto.quantity)) {
        throw new BadRequestException('Insufficient stock');
      }
      item.current_stock = Number(item.current_stock) - Number(createStockTransactionDto.quantity);
    } else if (createStockTransactionDto.transaction_type === TransactionType.ADJUSTMENT) {
      item.current_stock = Number(createStockTransactionDto.quantity);
    }

    await this.inventoryItemsRepository.save(item);

    const transaction = this.stockTransactionsRepository.create({
      ...createStockTransactionDto,
      item: { id: createStockTransactionDto.item_id } as any,
      created_by: { id: userId } as any,
    });

    return this.stockTransactionsRepository.save(transaction);
  }

  async findAllTransactions(
    itemId?: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: StockTransaction[]; total: number }> {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (itemId) {
      where.item = { id: itemId };
    }

    const [data, total] = await this.stockTransactionsRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { transaction_date: 'DESC' },
      relations: ['item', 'created_by'],
    });

    return { data, total };
  }

  async getItemTransactions(itemId: string): Promise<StockTransaction[]> {
    return this.stockTransactionsRepository.find({
      where: { item: { id: itemId } },
      order: { transaction_date: 'DESC' },
      relations: ['created_by'],
    });
  }
}
