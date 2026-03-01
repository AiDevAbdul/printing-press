import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Quotation, QuotationStatus } from './entities/quotation.entity';
import { QuotationItem } from './entities/quotation-item.entity';
import { QuotationHistory } from './entities/quotation-history.entity';
import {
  CreateQuotationDto,
  UpdateQuotationDto,
  CalculatePricingDto,
  ConvertToOrderDto,
} from './dto/quotation.dto';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class QuotationsService {
  constructor(
    @InjectRepository(Quotation)
    private quotationRepository: Repository<Quotation>,
    @InjectRepository(QuotationItem)
    private quotationItemRepository: Repository<QuotationItem>,
    @InjectRepository(QuotationHistory)
    private quotationHistoryRepository: Repository<QuotationHistory>,
    private ordersService: OrdersService,
  ) {}

  async create(createQuotationDto: CreateQuotationDto, userId: string): Promise<Quotation> {
    // Generate quotation number
    const quotationNumber = await this.generateQuotationNumber();

    // Calculate pricing
    const pricing = await this.calculatePricing({
      product_type: createQuotationDto.product_type,
      quantity: createQuotationDto.quantity,
      length: createQuotationDto.length,
      width: createQuotationDto.width,
      gsm: createQuotationDto.gsm,
      color_front: createQuotationDto.color_front,
      color_back: createQuotationDto.color_back,
      pantone_p1: createQuotationDto.pantone_p1,
      pantone_p2: createQuotationDto.pantone_p2,
      pantone_p3: createQuotationDto.pantone_p3,
      pantone_p4: createQuotationDto.pantone_p4,
      varnish_type: createQuotationDto.varnish_type,
      lamination_type: createQuotationDto.lamination_type,
      embossing: createQuotationDto.embossing,
      foiling: createQuotationDto.foiling,
      die_cutting: createQuotationDto.die_cutting,
      pasting: createQuotationDto.pasting,
      ctp_required: createQuotationDto.ctp_required,
      profit_margin_percent: createQuotationDto.profit_margin_percent,
      discount_percent: createQuotationDto.discount_percent,
      tax_percent: createQuotationDto.tax_percent,
      items: createQuotationDto.items,
    });

    // Create quotation
    const quotation = this.quotationRepository.create({
      ...createQuotationDto,
      quotation_number: quotationNumber,
      created_by_id: userId,
      ...pricing,
    });

    const savedQuotation = await this.quotationRepository.save(quotation);

    // Create additional items if provided
    if (createQuotationDto.items && createQuotationDto.items.length > 0) {
      const items = createQuotationDto.items.map((item) =>
        this.quotationItemRepository.create({
          ...item,
          quotation_id: savedQuotation.id,
          total_price: item.quantity * item.unit_price,
        }),
      );
      await this.quotationItemRepository.save(items);
    }

    return this.findOne(savedQuotation.id);
  }

  async findAll(filters?: {
    status?: QuotationStatus;
    customer_id?: string;
    search?: string;
    from_date?: string;
    to_date?: string;
  }): Promise<{ data: Quotation[]; total: number }> {
    const query = this.quotationRepository.createQueryBuilder('quotation')
      .leftJoinAndSelect('quotation.customer', 'customer')
      .leftJoinAndSelect('quotation.created_by', 'created_by')
      .leftJoinAndSelect('quotation.items', 'items');

    if (filters?.status) {
      query.andWhere('quotation.status = :status', { status: filters.status });
    }

    if (filters?.customer_id) {
      query.andWhere('quotation.customer_id = :customer_id', {
        customer_id: filters.customer_id,
      });
    }

    if (filters?.search) {
      query.andWhere(
        '(quotation.quotation_number ILIKE :search OR quotation.product_name ILIKE :search OR customer.company_name ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters?.from_date && filters?.to_date) {
      query.andWhere('quotation.quotation_date BETWEEN :from_date AND :to_date', {
        from_date: filters.from_date,
        to_date: filters.to_date,
      });
    }

    query.orderBy('quotation.created_at', 'DESC');

    const [data, total] = await query.getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<Quotation> {
    const quotation = await this.quotationRepository.findOne({
      where: { id },
      relations: ['customer', 'created_by', 'items', 'converted_to_order'],
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }

    return quotation;
  }

  async update(id: string, updateQuotationDto: UpdateQuotationDto): Promise<Quotation> {
    const quotation = await this.findOne(id);

    if (quotation.status !== QuotationStatus.DRAFT) {
      throw new BadRequestException('Only draft quotations can be updated');
    }

    // Recalculate pricing if relevant fields changed
    if (
      updateQuotationDto.quantity ||
      updateQuotationDto.length ||
      updateQuotationDto.width ||
      updateQuotationDto.gsm ||
      updateQuotationDto.color_front ||
      updateQuotationDto.color_back ||
      updateQuotationDto.profit_margin_percent !== undefined ||
      updateQuotationDto.discount_percent !== undefined ||
      updateQuotationDto.tax_percent !== undefined
    ) {
      const pricing = await this.calculatePricing({
        product_type: updateQuotationDto.product_type || quotation.product_type,
        quantity: updateQuotationDto.quantity || quotation.quantity,
        length: updateQuotationDto.length || quotation.length,
        width: updateQuotationDto.width || quotation.width,
        gsm: updateQuotationDto.gsm || quotation.gsm,
        color_front: updateQuotationDto.color_front ?? quotation.color_front,
        color_back: updateQuotationDto.color_back ?? quotation.color_back,
        pantone_p1: updateQuotationDto.pantone_p1 ?? quotation.pantone_p1,
        pantone_p2: updateQuotationDto.pantone_p2 ?? quotation.pantone_p2,
        pantone_p3: updateQuotationDto.pantone_p3 ?? quotation.pantone_p3,
        pantone_p4: updateQuotationDto.pantone_p4 ?? quotation.pantone_p4,
        varnish_type: updateQuotationDto.varnish_type || quotation.varnish_type,
        lamination_type: updateQuotationDto.lamination_type || quotation.lamination_type,
        embossing: updateQuotationDto.embossing ?? quotation.embossing,
        foiling: updateQuotationDto.foiling ?? quotation.foiling,
        die_cutting: updateQuotationDto.die_cutting ?? quotation.die_cutting,
        pasting: updateQuotationDto.pasting ?? quotation.pasting,
        ctp_required: updateQuotationDto.ctp_required ?? quotation.ctp_required,
        profit_margin_percent: updateQuotationDto.profit_margin_percent ?? quotation.profit_margin_percent,
        discount_percent: updateQuotationDto.discount_percent ?? quotation.discount_percent,
        tax_percent: updateQuotationDto.tax_percent ?? quotation.tax_percent,
        items: updateQuotationDto.items,
      });

      Object.assign(quotation, updateQuotationDto, pricing);
    } else {
      Object.assign(quotation, updateQuotationDto);
    }

    const updated = await this.quotationRepository.save(quotation);

    // Update items if provided
    if (updateQuotationDto.items) {
      // Delete existing items
      await this.quotationItemRepository.delete({ quotation_id: id });

      // Create new items
      const items = updateQuotationDto.items.map((item) =>
        this.quotationItemRepository.create({
          ...item,
          quotation_id: id,
          total_price: item.quantity * item.unit_price,
        }),
      );
      await this.quotationItemRepository.save(items);
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const quotation = await this.findOne(id);

    if (quotation.status === QuotationStatus.CONVERTED) {
      throw new BadRequestException('Cannot delete converted quotations');
    }

    await this.quotationRepository.remove(quotation);
  }

  async calculatePricing(dto: CalculatePricingDto): Promise<any> {
    // Material Cost Calculation
    const area = (dto.length || 0) * (dto.width || 0) / 1000000; // Convert to sq meters
    const paperCostPerKg = 80; // Base rate per kg
    const weightPerSheet = area * (dto.gsm || 300) / 1000; // kg per sheet
    const materialCost = weightPerSheet * paperCostPerKg * dto.quantity;

    // Printing Cost Calculation
    const colorCount = (dto.color_front || 0) + (dto.color_back || 0);
    const pantoneCount = [dto.pantone_p1, dto.pantone_p2, dto.pantone_p3, dto.pantone_p4].filter(Boolean).length;
    const totalColors = colorCount + pantoneCount;
    const printingCostPerColor = 0.5; // Per color per unit
    const printingCost = totalColors * printingCostPerColor * dto.quantity;

    // Finishing Cost Calculation
    let finishingCost = 0;

    if (dto.varnish_type && dto.varnish_type !== 'none') {
      finishingCost += 0.3 * dto.quantity; // UV/Varnish cost
    }

    if (dto.lamination_type && dto.lamination_type !== 'none') {
      finishingCost += 0.5 * dto.quantity; // Lamination cost
    }

    if (dto.embossing) {
      finishingCost += 0.8 * dto.quantity; // Embossing cost
    }

    if (dto.foiling) {
      finishingCost += 1.0 * dto.quantity; // Foiling cost
    }

    if (dto.die_cutting) {
      finishingCost += 0.4 * dto.quantity; // Die cutting cost
    }

    if (dto.pasting) {
      finishingCost += 0.3 * dto.quantity; // Pasting cost
    }

    // Pre-Press Cost Calculation
    let prePressCost = 500; // Base pre-press cost

    if (dto.ctp_required) {
      prePressCost += 200 * totalColors; // CTP plate cost per color
    }

    // Additional Items Cost
    let additionalItemsCost = 0;
    if (dto.items && dto.items.length > 0) {
      additionalItemsCost = dto.items.reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0,
      );
    }

    // Subtotal
    const subtotal = materialCost + printingCost + finishingCost + prePressCost + additionalItemsCost;

    // Overhead (15% default)
    const overheadCost = subtotal * 0.15;

    // Profit Margin
    const profitMarginPercent = dto.profit_margin_percent ?? 20;
    const profitMarginAmount = (subtotal + overheadCost) * (profitMarginPercent / 100);

    // Discount
    const discountPercent = dto.discount_percent ?? 0;
    const discountAmount = (subtotal + overheadCost + profitMarginAmount) * (discountPercent / 100);

    // Tax
    const taxPercent = dto.tax_percent ?? 18;
    const taxableAmount = subtotal + overheadCost + profitMarginAmount - discountAmount;
    const taxAmount = taxableAmount * (taxPercent / 100);

    // Total
    const totalAmount = taxableAmount + taxAmount;

    return {
      material_cost: Math.round(materialCost * 100) / 100,
      printing_cost: Math.round(printingCost * 100) / 100,
      finishing_cost: Math.round(finishingCost * 100) / 100,
      pre_press_cost: Math.round(prePressCost * 100) / 100,
      overhead_cost: Math.round(overheadCost * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
      profit_margin_percent: profitMarginPercent,
      profit_margin_amount: Math.round(profitMarginAmount * 100) / 100,
      discount_percent: discountPercent,
      discount_amount: Math.round(discountAmount * 100) / 100,
      tax_percent: taxPercent,
      tax_amount: Math.round(taxAmount * 100) / 100,
      total_amount: Math.round(totalAmount * 100) / 100,
    };
  }

  async send(id: string, userId: string): Promise<Quotation> {
    const quotation = await this.findOne(id);

    if (quotation.status !== QuotationStatus.DRAFT) {
      throw new BadRequestException('Only draft quotations can be sent');
    }

    await this.createHistory(
      id,
      quotation.status,
      QuotationStatus.SENT,
      userId,
      'Quotation sent to customer',
    );

    quotation.status = QuotationStatus.SENT;
    quotation.sent_at = new Date();

    return this.quotationRepository.save(quotation);
  }

  async approve(id: string, userId: string): Promise<Quotation> {
    const quotation = await this.findOne(id);

    if (quotation.status !== QuotationStatus.SENT) {
      throw new BadRequestException('Only sent quotations can be approved');
    }

    await this.createHistory(
      id,
      quotation.status,
      QuotationStatus.APPROVED,
      userId,
      'Quotation approved by customer',
    );

    quotation.status = QuotationStatus.APPROVED;
    quotation.approved_at = new Date();

    return this.quotationRepository.save(quotation);
  }

  async reject(id: string, userId: string, reason?: string): Promise<Quotation> {
    const quotation = await this.findOne(id);

    if (quotation.status !== QuotationStatus.SENT) {
      throw new BadRequestException('Only sent quotations can be rejected');
    }

    await this.createHistory(
      id,
      quotation.status,
      QuotationStatus.REJECTED,
      userId,
      reason || 'Quotation rejected by customer',
    );

    quotation.status = QuotationStatus.REJECTED;
    quotation.rejected_at = new Date();

    return this.quotationRepository.save(quotation);
  }

  async convertToOrder(
    id: string,
    userId: string,
    dto?: ConvertToOrderDto,
  ): Promise<any> {
    const quotation = await this.findOne(id);

    if (quotation.status !== QuotationStatus.APPROVED) {
      throw new BadRequestException('Only approved quotations can be converted to orders');
    }

    if (quotation.converted_to_order_id) {
      throw new BadRequestException('Quotation already converted to order');
    }

    // Create order from quotation
    const orderData = {
      customer_id: quotation.customer_id,
      order_date: dto?.order_date || new Date().toISOString(),
      delivery_date: dto?.delivery_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      product_name: quotation.product_name,
      product_type: quotation.product_type,
      quantity: quotation.quantity,
      unit: quotation.unit,
      length: quotation.length,
      width: quotation.width,
      height: quotation.height,
      dimension_unit: quotation.dimension_unit,
      paper_type: quotation.paper_type,
      gsm: quotation.gsm,
      board_quality: quotation.board_quality,
      color_front: quotation.color_front,
      color_back: quotation.color_back,
      pantone_p1: quotation.pantone_p1,
      pantone_p1_code: quotation.pantone_p1_code,
      pantone_p2: quotation.pantone_p2,
      pantone_p2_code: quotation.pantone_p2_code,
      pantone_p3: quotation.pantone_p3,
      pantone_p3_code: quotation.pantone_p3_code,
      pantone_p4: quotation.pantone_p4,
      pantone_p4_code: quotation.pantone_p4_code,
      varnish_type: quotation.varnish_type,
      lamination_type: quotation.lamination_type,
      embossing: quotation.embossing,
      embossing_details: quotation.embossing_details,
      foiling: quotation.foiling,
      foiling_details: quotation.foiling_details,
      die_cutting: quotation.die_cutting,
      die_cutting_details: quotation.die_cutting_details,
      pasting: quotation.pasting,
      pasting_details: quotation.pasting_details,
      ctp_required: quotation.ctp_required,
      ctp_details: quotation.ctp_details,
      die_type: quotation.die_type,
      plate_reference: quotation.plate_reference,
      cylinder_size: quotation.cylinder_size,
      foil_thickness: quotation.foil_thickness,
      tablet_size: quotation.tablet_size,
      punch_size: quotation.punch_size,
      notes: dto?.notes || quotation.notes,
    };

    const order = await this.ordersService.create(orderData, userId);

    // Update quotation
    await this.createHistory(
      id,
      quotation.status,
      QuotationStatus.CONVERTED,
      userId,
      `Converted to order ${order.order_number}`,
    );

    quotation.status = QuotationStatus.CONVERTED;
    quotation.converted_to_order_id = order.id;
    quotation.converted_at = new Date();

    await this.quotationRepository.save(quotation);

    return order;
  }

  async createRevision(id: string, userId: string): Promise<Quotation> {
    const parentQuotation = await this.findOne(id);

    // Generate new quotation number with incremented version
    const newVersion = parentQuotation.version + 1;
    const quotationNumber = await this.generateQuotationNumber();

    // Create new quotation as revision
    const revision = this.quotationRepository.create({
      ...parentQuotation,
      id: undefined,
      quotation_number: quotationNumber,
      version: newVersion,
      parent_quotation_id: parentQuotation.id,
      status: QuotationStatus.DRAFT,
      created_by_id: userId,
      sent_at: null,
      approved_at: null,
      rejected_at: null,
      converted_to_order_id: null,
      converted_at: null,
      created_at: undefined,
      updated_at: undefined,
    });

    const savedRevision = await this.quotationRepository.save(revision);

    // Copy items
    if (parentQuotation.items && parentQuotation.items.length > 0) {
      const items = parentQuotation.items.map((item) =>
        this.quotationItemRepository.create({
          ...item,
          id: undefined,
          quotation_id: savedRevision.id,
        }),
      );
      await this.quotationItemRepository.save(items);
    }

    return this.findOne(savedRevision.id);
  }

  async getHistory(id: string): Promise<QuotationHistory[]> {
    return this.quotationHistoryRepository.find({
      where: { quotation_id: id },
      relations: ['changed_by'],
      order: { changed_at: 'ASC' },
    });
  }

  private async createHistory(
    quotationId: string,
    oldStatus: QuotationStatus,
    newStatus: QuotationStatus,
    userId: string,
    notes?: string,
  ): Promise<void> {
    const history = this.quotationHistoryRepository.create({
      quotation_id: quotationId,
      old_status: oldStatus,
      new_status: newStatus,
      changed_by_id: userId,
      notes,
    });

    await this.quotationHistoryRepository.save(history);
  }

  private async generateQuotationNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    const lastQuotation = await this.quotationRepository
      .createQueryBuilder('quotation')
      .where('quotation.quotation_number LIKE :pattern', {
        pattern: `QUO-${dateStr}-%`,
      })
      .orderBy('quotation.quotation_number', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastQuotation) {
      const lastSequence = parseInt(
        lastQuotation.quotation_number.split('-')[2],
        10,
      );
      sequence = lastSequence + 1;
    }

    return `QUO-${dateStr}-${sequence.toString().padStart(3, '0')}`;
  }
}
