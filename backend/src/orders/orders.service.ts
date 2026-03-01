import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderDto, UpdateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  private generateOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${year}${month}${day}-${random}`;
  }

  async create(createOrderDto: CreateOrderDto, userId: string): Promise<Order> {
    const order = this.ordersRepository.create({
      ...createOrderDto,
      order_number: this.generateOrderNumber(),
      customer: { id: createOrderDto.customer_id } as any,
      created_by: { id: userId } as any,
    });
    return this.ordersRepository.save(order);
  }

  async findAll(
    status?: OrderStatus,
    customerId?: string,
    startDate?: Date,
    endDate?: Date,
    page = 1,
    limit = 10,
    search?: string,
    productType?: string,
    priority?: string,
  ): Promise<{ data: Order[]; total: number }> {
    const skip = (page - 1) * limit;
    const queryBuilder = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.created_by', 'created_by');

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    if (customerId) {
      queryBuilder.andWhere('order.customer.id = :customerId', { customerId });
    }

    if (productType) {
      queryBuilder.andWhere('order.product_type = :productType', { productType });
    }

    if (priority) {
      queryBuilder.andWhere('order.priority = :priority', { priority });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('order.order_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    // Multi-field search
    if (search) {
      queryBuilder.andWhere(
        '(order.order_number ILIKE :search OR ' +
        'order.product_name ILIKE :search OR ' +
        'order.group_name ILIKE :search OR ' +
        'order.batch_number ILIKE :search OR ' +
        'order.specifications ILIKE :search OR ' +
        'customer.name ILIKE :search OR ' +
        'customer.company_name ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    queryBuilder
      .orderBy('order.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['customer', 'created_by'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);

    if (updateOrderDto.customer_id) {
      order.customer = { id: updateOrderDto.customer_id } as any;
      delete updateOrderDto.customer_id;
    }

    Object.assign(order, updateOrderDto);
    return this.ordersRepository.save(order);
  }

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findOne(id);
    order.status = updateOrderStatusDto.status;
    return this.ordersRepository.save(order);
  }

  async remove(id: string): Promise<Order> {
    const order = await this.findOne(id);
    order.status = OrderStatus.CANCELLED;
    return this.ordersRepository.save(order);
  }

  async createRepeatOrder(originalOrderId: string, updates: Partial<CreateOrderDto>, userId: string): Promise<Order> {
    const originalOrder = await this.findOne(originalOrderId);

    const repeatOrder = this.ordersRepository.create({
      ...originalOrder,
      id: undefined,
      order_number: this.generateOrderNumber(),
      is_repeat_order: true,
      previous_order_id: originalOrderId,
      status: OrderStatus.PENDING,
      created_by: { id: userId } as any,
      created_at: undefined,
      updated_at: undefined,
      ...updates,
    });

    return this.ordersRepository.save(repeatOrder);
  }

  async getOrderSpecifications(id: string): Promise<Order> {
    return this.findOne(id);
  }

  async updateDesignApproval(id: string, approvedBy: string): Promise<Order> {
    const order = await this.findOne(id);
    order.design_approved_by = approvedBy;
    order.design_approved_at = new Date();
    return this.ordersRepository.save(order);
  }
}
