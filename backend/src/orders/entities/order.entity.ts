import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { User } from '../../users/entities/user.entity';

export enum OrderStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  IN_PRODUCTION = 'in_production',
  COMPLETED = 'completed',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum OrderPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum PrintingType {
  OFFSET = 'offset',
  DIGITAL = 'digital',
  FLEXO = 'flexo',
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

export enum DieType {
  NEW_DIE = 'new_die',
  OLD_DIE = 'old_die',
  NONE = 'none',
}

export enum DesignFileStatus {
  NOT_RECEIVED = 'not_received',
  RECEIVED = 'received',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REVISION_NEEDED = 'revision_needed',
}

export enum ColorSeparationType {
  CMYK = 'cmyk',
  SPOT_COLORS = 'spot_colors',
  RGB = 'rgb',
  PANTONE = 'pantone',
}

export enum PlateMaterial {
  ALUMINUM = 'aluminum',
  POLYESTER = 'polyester',
  STEEL = 'steel',
}

export enum PlateCondition {
  NEW = 'new',
  REUSED = 'reused',
  REFURBISHED = 'refurbished',
}

export enum PlateApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum ProofStatus {
  NOT_REQUIRED = 'not_required',
  PENDING = 'pending',
  SENT = 'sent',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum ColorMatchingStandard {
  PANTONE = 'pantone',
  CMYK = 'cmyk',
  CUSTOM = 'custom',
  NONE = 'none',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  order_number: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ type: 'date' })
  order_date: Date;

  @Column({ type: 'date' })
  delivery_date: Date;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: OrderPriority,
    default: OrderPriority.NORMAL,
  })
  priority: OrderPriority;

  @Column()
  product_name: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column()
  unit: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  size_length: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  size_width: number;

  @Column({ nullable: true })
  size_unit: string;

  @Column({ nullable: true })
  substrate: string;

  @Column({ nullable: true })
  gsm: string;

  @Column({ nullable: true })
  colors: string;

  @Column({
    type: 'enum',
    enum: PrintingType,
    nullable: true,
  })
  printing_type: PrintingType;

  @Column({ type: 'text', nullable: true })
  finishing_requirements: string;

  @Column({ type: 'text', nullable: true })
  special_instructions: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  quoted_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  final_price: number;

  // Product Type Classification
  @Column({
    type: 'enum',
    enum: ProductType,
    nullable: true,
  })
  product_type: ProductType;

  @Column({ type: 'boolean', default: false })
  is_repeat_order: boolean;

  @Column({ type: 'uuid', nullable: true })
  previous_order_id: string;

  // Detailed Specifications (CPP001)
  @Column({ nullable: true })
  card_size: string;

  @Column({ nullable: true })
  card_width: string;

  @Column({ nullable: true })
  card_length: string;

  @Column({ nullable: true })
  strength: string;

  @Column({ nullable: true })
  type: string;

  // Color Details
  @Column({ nullable: true })
  color_cyan: string;

  @Column({ nullable: true })
  color_magenta: string;

  @Column({ nullable: true })
  color_yellow: string;

  @Column({ nullable: true })
  color_black: string;

  @Column({ nullable: true })
  color_p1: string;

  @Column({ nullable: true })
  color_p2: string;

  @Column({ nullable: true })
  color_p3: string;

  @Column({ nullable: true })
  color_p4: string;

  // Varnish Details
  @Column({ type: 'simple-array', nullable: true })
  varnish_type: string[];

  @Column({ type: 'text', nullable: true })
  varnish_details: string;

  // Lamination
  @Column({ type: 'simple-array', nullable: true })
  lamination_type: string[];

  @Column({ nullable: true })
  lamination_size: string;

  // Embossing & Finishing
  @Column({ type: 'text', nullable: true })
  uv_emboss_details: string;

  @Column({ type: 'boolean', default: false })
  has_back_printing: boolean;

  @Column({ type: 'boolean', default: false })
  has_barcode: boolean;

  @Column({ nullable: true })
  batch_number: string;

  // Pre-Press
  @Column({ type: 'text', nullable: true })
  ctp_info: string;

  @Column({
    type: 'enum',
    enum: DieType,
    nullable: true,
  })
  die_type: DieType;

  @Column({ nullable: true })
  die_reference: string;

  @Column({ type: 'text', nullable: true })
  emboss_film_details: string;

  @Column({ nullable: true })
  plate_reference: string;

  // Design Tracking
  @Column({ nullable: true })
  designer_name: string;

  @Column({ nullable: true })
  design_approved_by: string;

  @Column({ type: 'timestamp', nullable: true })
  design_approved_at: Date;

  // Product-Specific Fields - For Silvo/Blister Foil
  @Column({ nullable: true })
  cylinder_reference: string;

  @Column({ type: 'date', nullable: true })
  cylinder_sent_date: Date;

  @Column({ type: 'date', nullable: true })
  cylinder_approved_date: Date;

  @Column({ type: 'date', nullable: true })
  cylinder_received_date: Date;

  // For Bent Foil / Alu-Alu
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  thickness_micron: number;

  @Column({ nullable: true })
  tablet_size: string;

  @Column({ nullable: true })
  punch_size: string;

  // Enhanced Order Tracking (Part 4)
  @Column({ nullable: true })
  group_name: string;

  @Column({ type: 'text', nullable: true })
  specifications: string;

  @Column({ nullable: true })
  production_status: string;

  @Column({ type: 'boolean', default: true })
  auto_sync_enabled: boolean;

  // Design & File Management
  @Column({
    type: 'enum',
    enum: DesignFileStatus,
    nullable: true,
  })
  design_file_status: DesignFileStatus;

  @Column({ type: 'text', nullable: true })
  design_file_formats: string;

  @Column({ type: 'date', nullable: true })
  design_approval_date: Date;

  @Column({ type: 'int', default: 0 })
  design_revisions_count: number;

  @Column({ type: 'text', nullable: true })
  design_notes: string;

  // Plate & Separation Details
  @Column({
    type: 'enum',
    enum: ColorSeparationType,
    nullable: true,
  })
  color_separation_type: ColorSeparationType;

  @Column({ type: 'int', nullable: true })
  number_of_plates: number;

  @Column({ nullable: true })
  plate_size: string;

  @Column({
    type: 'enum',
    enum: PlateMaterial,
    nullable: true,
  })
  plate_material: PlateMaterial;

  @Column({
    type: 'enum',
    enum: PlateCondition,
    nullable: true,
  })
  plate_condition: PlateCondition;

  @Column({
    type: 'enum',
    enum: PlateApprovalStatus,
    nullable: true,
  })
  plate_approval_status: PlateApprovalStatus;

  @Column({ type: 'date', nullable: true })
  plate_approval_date: Date;

  // Proofing & Quality Control
  @Column({ type: 'text', nullable: true })
  proof_type_required: string;

  @Column({
    type: 'enum',
    enum: ProofStatus,
    nullable: true,
  })
  proof_status: ProofStatus;

  @Column({ type: 'date', nullable: true })
  proof_approval_date: Date;

  @Column({
    type: 'enum',
    enum: ColorMatchingStandard,
    nullable: true,
  })
  color_matching_standard: ColorMatchingStandard;

  @Column({ type: 'text', nullable: true })
  quality_check_notes: string;

  @Column({ nullable: true })
  approved_by: string;

  // Production Setup & Machine Requirements
  @Column({ type: 'text', nullable: true })
  preferred_machines: string;

  @Column({ type: 'boolean', default: false })
  special_setup_required: boolean;

  @Column({ type: 'text', nullable: true })
  setup_instructions: string;

  @Column({ type: 'int', nullable: true })
  estimated_setup_time: number;

  @Column({ type: 'text', nullable: true })
  machine_calibration_notes: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  created_by: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
