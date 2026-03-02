import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delivery, DeliveryStatus } from './entities/delivery.entity';
import { PackingList } from './entities/packing-list.entity';
import { Challan } from './entities/challan.entity';
import { DeliveryTracking } from './entities/delivery-tracking.entity';
import {
  CreateDeliveryDto,
  UpdateDeliveryDto,
  MarkAsPackedDto,
  DispatchDeliveryDto,
  MarkAsDeliveredDto,
  AddTrackingUpdateDto,
  GenerateChallanDto,
} from './dto/dispatch.dto';

@Injectable()
export class DispatchService {
  constructor(
    @InjectRepository(Delivery)
    private deliveryRepository: Repository<Delivery>,
    @InjectRepository(PackingList)
    private packingListRepository: Repository<PackingList>,
    @InjectRepository(Challan)
    private challanRepository: Repository<Challan>,
    @InjectRepository(DeliveryTracking)
    private trackingRepository: Repository<DeliveryTracking>,
  ) {}

  // Deliveries
  async createDelivery(dto: CreateDeliveryDto, userId: string): Promise<Delivery> {
    const deliveryNumber = await this.generateDeliveryNumber();

    const delivery = this.deliveryRepository.create({
      ...dto,
      delivery_number: deliveryNumber,
      created_by_id: userId,
      scheduled_date: new Date(dto.scheduled_date),
    });

    const savedDelivery = await this.deliveryRepository.save(delivery);

    // Create packing list items if provided
    if (dto.packing_list && dto.packing_list.length > 0) {
      const packingListItems = dto.packing_list.map((item) =>
        this.packingListRepository.create({
          ...item,
          delivery_id: savedDelivery.id,
        }),
      );
      await this.packingListRepository.save(packingListItems);
    }

    // Create initial tracking entry
    await this.addTrackingUpdate(
      savedDelivery.id,
      { status: 'Delivery Created', notes: 'Delivery scheduled' },
      userId,
    );

    return this.findOne(savedDelivery.id);
  }

  async findAll(filters?: {
    status?: DeliveryStatus;
    customer_id?: string;
    from_date?: string;
    to_date?: string;
  }): Promise<{ data: Delivery[]; total: number }> {
    const query = this.deliveryRepository.createQueryBuilder('delivery')
      .leftJoinAndSelect('delivery.job', 'job')
      .leftJoinAndSelect('delivery.customer', 'customer')
      .leftJoinAndSelect('delivery.created_by', 'created_by')
      .leftJoinAndSelect('delivery.packing_lists', 'packing_lists');

    if (filters?.status) {
      query.andWhere('delivery.delivery_status = :status', { status: filters.status });
    }

    if (filters?.customer_id) {
      query.andWhere('delivery.customer_id = :customer_id', { customer_id: filters.customer_id });
    }

    if (filters?.from_date && filters?.to_date) {
      query.andWhere('delivery.scheduled_date BETWEEN :from_date AND :to_date', {
        from_date: filters.from_date,
        to_date: filters.to_date,
      });
    }

    query.orderBy('delivery.created_at', 'DESC');

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async findOne(id: string): Promise<Delivery> {
    const delivery = await this.deliveryRepository.findOne({
      where: { id },
      relations: ['job', 'customer', 'created_by', 'packing_lists', 'tracking_history', 'tracking_history.updated_by'],
    });

    if (!delivery) {
      throw new NotFoundException('Delivery not found');
    }

    return delivery;
  }

  async update(id: string, dto: UpdateDeliveryDto): Promise<Delivery> {
    const delivery = await this.findOne(id);

    if (dto.scheduled_date) {
      delivery.scheduled_date = new Date(dto.scheduled_date);
      delete dto.scheduled_date;
    }

    Object.assign(delivery, dto);
    await this.deliveryRepository.save(delivery);

    return this.findOne(id);
  }

  async markAsPacked(id: string, dto: MarkAsPackedDto, userId: string): Promise<Delivery> {
    const delivery = await this.findOne(id);

    if (delivery.delivery_status !== DeliveryStatus.PENDING) {
      throw new BadRequestException('Only pending deliveries can be marked as packed');
    }

    // Delete existing packing list items
    await this.packingListRepository.delete({ delivery_id: id });

    // Create new packing list items
    const packingListItems = dto.packing_list.map((item) =>
      this.packingListRepository.create({
        ...item,
        delivery_id: id,
      }),
    );
    await this.packingListRepository.save(packingListItems);

    delivery.delivery_status = DeliveryStatus.PACKED;
    delivery.packed_at = new Date();
    await this.deliveryRepository.save(delivery);

    await this.addTrackingUpdate(
      id,
      { status: 'Packed', notes: `Packed into ${dto.packing_list.length} boxes` },
      userId,
    );

    return this.findOne(id);
  }

  async dispatch(id: string, dto: DispatchDeliveryDto, userId: string): Promise<Delivery> {
    const delivery = await this.findOne(id);

    if (delivery.delivery_status !== DeliveryStatus.PACKED) {
      throw new BadRequestException('Only packed deliveries can be dispatched');
    }

    Object.assign(delivery, dto);
    delivery.delivery_status = DeliveryStatus.DISPATCHED;
    delivery.dispatched_at = new Date();
    await this.deliveryRepository.save(delivery);

    const trackingNotes = dto.courier_name
      ? `Dispatched via ${dto.courier_name}${dto.tracking_number ? ` (Tracking: ${dto.tracking_number})` : ''}`
      : dto.vehicle_number
      ? `Dispatched via own transport (Vehicle: ${dto.vehicle_number})`
      : 'Dispatched';

    await this.addTrackingUpdate(
      id,
      { status: 'Dispatched', notes: trackingNotes },
      userId,
    );

    return this.findOne(id);
  }

  async markAsDelivered(
    id: string,
    dto: MarkAsDeliveredDto,
    userId: string,
    podPhoto?: Express.Multer.File,
  ): Promise<Delivery> {
    const delivery = await this.findOne(id);

    if (![DeliveryStatus.DISPATCHED, DeliveryStatus.IN_TRANSIT].includes(delivery.delivery_status)) {
      throw new BadRequestException('Only dispatched or in-transit deliveries can be marked as delivered');
    }

    delivery.delivery_status = DeliveryStatus.DELIVERED;
    delivery.delivered_at = new Date();
    delivery.received_by_name = dto.received_by_name;
    delivery.received_by_designation = dto.received_by_designation;

    if (podPhoto) {
      delivery.pod_photo_url = `/uploads/pod/${podPhoto.filename}`;
    }

    await this.deliveryRepository.save(delivery);

    await this.addTrackingUpdate(
      id,
      { status: 'Delivered', notes: `Received by ${dto.received_by_name}${dto.notes ? ` - ${dto.notes}` : ''}` },
      userId,
    );

    return this.findOne(id);
  }

  async uploadPOD(id: string, file: Express.Multer.File): Promise<Delivery> {
    const delivery = await this.findOne(id);
    delivery.pod_photo_url = `/uploads/pod/${file.filename}`;
    await this.deliveryRepository.save(delivery);
    return this.findOne(id);
  }

  // Tracking
  async addTrackingUpdate(
    deliveryId: string,
    dto: AddTrackingUpdateDto,
    userId: string,
  ): Promise<DeliveryTracking> {
    const tracking = this.trackingRepository.create({
      delivery_id: deliveryId,
      status: dto.status,
      location: dto.location,
      notes: dto.notes,
      updated_by_id: userId,
    });

    return this.trackingRepository.save(tracking);
  }

  async getTrackingHistory(deliveryId: string): Promise<DeliveryTracking[]> {
    return this.trackingRepository.find({
      where: { delivery_id: deliveryId },
      relations: ['updated_by'],
      order: { created_at: 'ASC' },
    });
  }

  // Challan
  async generateChallan(deliveryId: string, dto: GenerateChallanDto, userId: string): Promise<Challan> {
    const delivery = await this.findOne(deliveryId);

    const challanNumber = await this.generateChallanNumber();

    const challan = this.challanRepository.create({
      challan_number: challanNumber,
      delivery_id: deliveryId,
      challan_date: new Date(),
      terms_and_conditions: dto.terms_and_conditions,
      notes: dto.notes,
      generated_by_id: userId,
    });

    return this.challanRepository.save(challan);
  }

  async getChallan(deliveryId: string): Promise<Challan | null> {
    return this.challanRepository.findOne({
      where: { delivery_id: deliveryId },
      relations: ['delivery', 'delivery.customer', 'delivery.job', 'delivery.packing_lists', 'generated_by'],
    });
  }

  // Metrics
  async getDeliveryMetrics(startDate?: Date, endDate?: Date): Promise<any> {
    const query = this.deliveryRepository.createQueryBuilder('delivery');

    if (startDate && endDate) {
      query.andWhere('delivery.scheduled_date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const totalDeliveries = await query.getCount();
    const pendingDeliveries = await query.clone().andWhere('delivery.delivery_status = :status', { status: DeliveryStatus.PENDING }).getCount();
    const dispatchedDeliveries = await query.clone().andWhere('delivery.delivery_status = :status', { status: DeliveryStatus.DISPATCHED }).getCount();
    const deliveredDeliveries = await query.clone().andWhere('delivery.delivery_status = :status', { status: DeliveryStatus.DELIVERED }).getCount();
    const failedDeliveries = await query.clone().andWhere('delivery.delivery_status = :status', { status: DeliveryStatus.FAILED }).getCount();

    // On-time delivery rate
    const onTimeDeliveries = await this.deliveryRepository
      .createQueryBuilder('delivery')
      .where('delivery.delivery_status = :status', { status: DeliveryStatus.DELIVERED })
      .andWhere('delivery.delivered_at <= delivery.scheduled_date')
      .getCount();

    const onTimeRate = deliveredDeliveries > 0 ? (onTimeDeliveries / deliveredDeliveries) * 100 : 0;

    // Average delivery time
    const deliveredWithTimes = await this.deliveryRepository
      .createQueryBuilder('delivery')
      .where('delivery.delivery_status = :status', { status: DeliveryStatus.DELIVERED })
      .andWhere('delivery.dispatched_at IS NOT NULL')
      .andWhere('delivery.delivered_at IS NOT NULL')
      .getMany();

    let avgDeliveryTime = 0;
    if (deliveredWithTimes.length > 0) {
      const totalTime = deliveredWithTimes.reduce((sum, delivery) => {
        const time = (new Date(delivery.delivered_at!).getTime() - new Date(delivery.dispatched_at!).getTime()) / (1000 * 60 * 60 * 24);
        return sum + time;
      }, 0);
      avgDeliveryTime = totalTime / deliveredWithTimes.length;
    }

    return {
      total_deliveries: totalDeliveries,
      pending_deliveries: pendingDeliveries,
      dispatched_deliveries: dispatchedDeliveries,
      delivered_deliveries: deliveredDeliveries,
      failed_deliveries: failedDeliveries,
      on_time_delivery_rate: Math.round(onTimeRate * 100) / 100,
      average_delivery_time_days: Math.round(avgDeliveryTime * 100) / 100,
    };
  }

  // Helper methods
  private async generateDeliveryNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    const lastDelivery = await this.deliveryRepository
      .createQueryBuilder('delivery')
      .where('delivery.delivery_number LIKE :pattern', { pattern: `DEL-${dateStr}-%` })
      .orderBy('delivery.delivery_number', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastDelivery) {
      const lastSequence = parseInt(lastDelivery.delivery_number.split('-')[2], 10);
      sequence = lastSequence + 1;
    }

    return `DEL-${dateStr}-${sequence.toString().padStart(3, '0')}`;
  }

  private async generateChallanNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    const lastChallan = await this.challanRepository
      .createQueryBuilder('challan')
      .where('challan.challan_number LIKE :pattern', { pattern: `CH-${dateStr}-%` })
      .orderBy('challan.challan_number', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastChallan) {
      const lastSequence = parseInt(lastChallan.challan_number.split('-')[2], 10);
      sequence = lastSequence + 1;
    }

    return `CH-${dateStr}-${sequence.toString().padStart(3, '0')}`;
  }
}
