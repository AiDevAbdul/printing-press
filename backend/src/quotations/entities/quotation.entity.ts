import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { User } from '../../users/entities/user.entity';
import { QuotationItem } from './quotation-item.entity';
import { Order } from '../../orders/entities/order.entity';

export enum QuotationStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  CONVERTED = 'converted',
}

export enum ProductType {
  CPP_CARTON = 'cpp_carton',
  SILVO_BLISTER = 'silvo_blister',
  BENT_FOIL = 'bent_foil',
  ALU_ALU = 'alu_alu',
}

export enum VarnishType {
  WATER_BASE = 'water_base',
  DUCK = 'duck',
  PLAIN_UV = 'plain_uv',
  SPOT_UV = 'spot_uv',
  DRIP_OFF_UV = 'drip_off_uv',
  MATT_UV = 'matt_uv',
  ROUGH_UV = 'rough_uv',
  NONE = 'none',
}

export enum LaminationType {
  SHINE = 'shine',
  MATT = 'matt',
  METALIZE = 'metalize',
  RAINBOW = 'rainbow',
  NONE = 'none',
}

@Entity('quotations')
export class Quotation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  quotation_number: string;

  @Column({ default: 1 })
  version: number;

  @Column({ type: 'uuid', nullable: true })
  parent_quotation_id: string;

  @Column({
    type: 'enum',
    enum: QuotationStatus,
    default: QuotationStatus.DRAFT,
  })
  status: QuotationStatus;

  @ManyToOne(() => Customer, { eager: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ type: 'uuid' })
  customer_id: string;

  @Column({ type: 'date' })
  quotation_date: Date;

  @Column({ type: 'date' })
  valid_until: Date;

  // Product Details
  @Column()
  product_name: string;

  @Column({
    type: 'enum',
    enum: ProductType,
    default: ProductType.CPP_CARTON,
  })
  product_type: ProductType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column()
  unit: string;

  // Dimensions
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  length: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  width: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  height: number;

  @Column({ nullable: true })
  dimension_unit: string;

  // Material Specifications
  @Column({ nullable: true })
  paper_type: string;

  @Column({ type: 'int', nullable: true })
  gsm: number;

  @Column({ nullable: true })
  board_quality: string;

  // Color Specifications
  @Column({ type: 'int', default: 0 })
  color_front: number;

  @Column({ type: 'int', default: 0 })
  color_back: number;

  @Column({ type: 'boolean', default: false })
  pantone_p1: boolean;

  @Column({ nullable: true })
  pantone_p1_code: string;

  @Column({ type: 'boolean', default: false })
  pantone_p2: boolean;

  @Column({ nullable: true })
  pantone_p2_code: string;

  @Column({ type: 'boolean', default: false })
  pantone_p3: boolean;

  @Column({ nullable: true })
  pantone_p3_code: string;

  @Column({ type: 'boolean', default: false })
  pantone_p4: boolean;

  @Column({ nullable: true })
  pantone_p4_code: string;

  // Finishing
  @Column({
    type: 'enum',
    enum: VarnishType,
    default: VarnishType.NONE,
  })
  varnish_type: VarnishType;

  @Column({
    type: 'enum',
    enum: LaminationType,
    default: LaminationType.NONE,
  })
  lamination_type: LaminationType;

  @Column({ type: 'boolean', default: false })
  embossing: boolean;

  @Column({ nullable: true })
  embossing_details: string;

  @Column({ type: 'boolean', default: false })
  foiling: boolean;

  @Column({ nullable: true })
  foiling_details: string;

  @Column({ type: 'boolean', default: false })
  die_cutting: boolean;

  @Column({ nullable: true })
  die_cutting_details: string;

  @Column({ type: 'boolean', default: false })
  pasting: boolean;

  @Column({ nullable: true })
  pasting_details: string;

  // Pre-Press
  @Column({ type: 'boolean', default: false })
  ctp_required: boolean;

  @Column({ nullable: true })
  ctp_details: string;

  @Column({ nullable: true })
  die_type: string;

  @Column({ nullable: true })
  plate_reference: string;

  // Product Type Specific Fields
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cylinder_size: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  foil_thickness: number;

  @Column({ nullable: true })
  tablet_size: string;

  @Column({ nullable: true })
  punch_size: string;

  // Pricing Breakdown
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  material_cost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  printing_cost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  finishing_cost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  pre_press_cost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  overhead_cost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 20 })
  profit_margin_percent: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  profit_margin_amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discount_percent: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 18 })
  tax_percent: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_amount: number;

  // Additional Items
  @OneToMany(() => QuotationItem, (item) => item.quotation, { cascade: true })
  items: QuotationItem[];

  // Notes
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  terms_and_conditions: string;

  // Conversion Tracking
  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'converted_to_order_id' })
  converted_to_order: Order;

  @Column({ type: 'uuid', nullable: true })
  converted_to_order_id: string;

  @Column({ type: 'timestamp', nullable: true })
  converted_at: Date;

  // Audit Fields
  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  created_by: User;

  @Column({ type: 'uuid' })
  created_by_id: string;

  @Column({ type: 'timestamp', nullable: true })
  sent_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  rejected_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
