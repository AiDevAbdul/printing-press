import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, LessThan } from 'typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import { StockTransaction, TransactionType } from './entities/stock-transaction.entity';
import { CreateInventoryItemDto, UpdateInventoryItemDto } from './dto/inventory-item.dto';
import { CreateStockTransactionDto } from './dto/stock-transaction.dto';
import { QueryInventoryDto } from './dto/query-inventory.dto';

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

  async findAllItems(queryDto: QueryInventoryDto): Promise<{ data: InventoryItem[]; total: number }> {
    const queryBuilder = this.inventoryItemsRepository
      .createQueryBuilder('item')
      .where('item.is_active = :isActive', { isActive: true });

    // Main category filter
    if (queryDto.main_category) {
      queryBuilder.andWhere('item.main_category = :mainCategory', {
        mainCategory: queryDto.main_category
      });
    }

    // Subcategory filter (old category field)
    if (queryDto.category) {
      queryBuilder.andWhere('item.category = :category', {
        category: queryDto.category
      });
    }

    // Size filter
    if (queryDto.size) {
      queryBuilder.andWhere('item.size = :size', { size: queryDto.size });
    }

    // GSM filter (exact match)
    if (queryDto.gsm) {
      queryBuilder.andWhere('item.gsm = :gsm', { gsm: queryDto.gsm });
    }

    // Material type filter
    if (queryDto.material_type) {
      queryBuilder.andWhere('item.material_type ILIKE :materialType', {
        materialType: `%${queryDto.material_type}%`
      });
    }

    // Brand filter (partial match)
    if (queryDto.brand) {
      queryBuilder.andWhere('item.brand ILIKE :brand', {
        brand: `%${queryDto.brand}%`
      });
    }

    // Color filter (partial match)
    if (queryDto.color) {
      queryBuilder.andWhere('item.color ILIKE :color', {
        color: `%${queryDto.color}%`
      });
    }

    // Text search across multiple fields
    if (queryDto.search) {
      queryBuilder.andWhere(
        '(item.item_code ILIKE :search OR item.item_name ILIKE :search OR item.subcategory ILIKE :search)',
        { search: `%${queryDto.search}%` }
      );
    }

    // Pagination
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 50;
    queryBuilder.skip((page - 1) * limit).take(limit);

    // Order by item_code
    queryBuilder.orderBy('item.item_code', 'ASC');

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async getDistinctBrands(mainCategory?: string): Promise<string[]> {
    const query = this.inventoryItemsRepository
      .createQueryBuilder('item')
      .select('DISTINCT item.brand', 'brand')
      .where('item.brand IS NOT NULL')
      .andWhere('item.is_active = :isActive', { isActive: true });

    if (mainCategory) {
      query.andWhere('item.main_category = :mainCategory', { mainCategory });
    }

    const results = await query.getRawMany();
    return results.map(r => r.brand).filter(Boolean);
  }

  async getDistinctColors(mainCategory?: string): Promise<string[]> {
    const query = this.inventoryItemsRepository
      .createQueryBuilder('item')
      .select('DISTINCT item.color', 'color')
      .where('item.color IS NOT NULL')
      .andWhere('item.is_active = :isActive', { isActive: true });

    if (mainCategory) {
      query.andWhere('item.main_category = :mainCategory', { mainCategory });
    }

    const results = await query.getRawMany();
    return results.map(r => r.color).filter(Boolean);
  }

  async getDistinctSizes(): Promise<string[]> {
    const results = await this.inventoryItemsRepository
      .createQueryBuilder('item')
      .select('DISTINCT item.size', 'size')
      .where('item.size IS NOT NULL')
      .andWhere('item.is_active = :isActive', { isActive: true })
      .getRawMany();

    return results.map(r => r.size).filter(Boolean);
  }

  async getDistinctGSMValues(): Promise<number[]> {
    const results = await this.inventoryItemsRepository
      .createQueryBuilder('item')
      .select('DISTINCT item.gsm', 'gsm')
      .where('item.gsm IS NOT NULL')
      .andWhere('item.is_active = :isActive', { isActive: true })
      .orderBy('item.gsm', 'ASC')
      .getRawMany();

    return results.map(r => r.gsm).filter(Boolean);
  }

  async getDistinctMaterialTypes(mainCategory?: string): Promise<string[]> {
    const query = this.inventoryItemsRepository
      .createQueryBuilder('item')
      .select('DISTINCT item.material_type', 'material_type')
      .where('item.material_type IS NOT NULL')
      .andWhere('item.is_active = :isActive', { isActive: true });

    if (mainCategory) {
      query.andWhere('item.main_category = :mainCategory', { mainCategory });
    }

    const results = await query.getRawMany();
    return results.map(r => r.material_type).filter(Boolean);
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
