import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Company } from '../../companies/entities/company.entity';
import { Design } from './design.entity';
import { SpecificationApproval } from './specification-approval.entity';

export enum SpecStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum CustomerGroup {
  EXPORT = 'export',
  LOCAL = 'local',
  GOVT = 'govt',
}

export enum CardType {
  PLAIN = 'plain',
  COATED = 'coated',
  UNCOATED = 'uncoated',
  SPECIALTY = 'specialty',
}

export enum LaminationType {
  UV = 'uv',
  MATTE = 'matte',
  GLOSS = 'gloss',
  EMBOSS = 'emboss',
  METALIZE = 'metalize',
  NONE = 'none',
}

export enum VarnishType {
  WATER_BASE = 'water_base',
  DUCK = 'duck',
  NONE = 'none',
}

@Entity('product_specifications')
export class ProductSpecification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  company_id: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ nullable: true })
  design_id: string;

  @ManyToOne(() => Design, { nullable: true })
  @JoinColumn({ name: 'design_id' })
  design: Design;

  @Column()
  product_name: string;

  @Column({ type: 'enum', enum: CustomerGroup, nullable: true })
  customer_group: CustomerGroup;

  @Column({ nullable: true })
  file_folder_name: string;

  @Column({ nullable: true })
  form_number: string;

  @Column({ type: 'enum', enum: CardType, nullable: true })
  card_type: CardType;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  card_gramage: number;

  @Column({ default: false })
  back_printing: boolean;

  // Lamination options
  @Column({ type: 'enum', enum: LaminationType, default: LaminationType.NONE })
  lamination_type: LaminationType;

  @Column({ default: false })
  lamination_shine: boolean;

  @Column({ default: false })
  lamination_metalize: boolean;

  @Column({ default: false })
  lamination_emboss: boolean;

  @Column({ nullable: true })
  lamination_details: string;

  // Varnish options
  @Column({ type: 'enum', enum: VarnishType, default: VarnishType.NONE })
  varnish_type: VarnishType;

  @Column({ default: false })
  varnish_spot_uv: boolean;

  @Column({ default: false })
  varnish_drip_off: boolean;

  @Column({ default: false })
  varnish_matt: boolean;

  // Barcode & Batch
  @Column({ default: false })
  has_barcode: boolean;

  @Column({ nullable: true })
  batch_number: string;

  @Column({ default: false })
  has_price: boolean;

  // Colors (CMYK + Special)
  @Column({ default: false })
  color_cyan: boolean;

  @Column({ default: false })
  color_magenta: boolean;

  @Column({ default: false })
  color_yellow: boolean;

  @Column({ default: false })
  color_black: boolean;

  @Column({ default: false })
  has_special_colors: boolean;

  @Column({ nullable: true })
  special_colors_detail: string;

  @Column({ nullable: true })
  pantone_p1: string;

  @Column({ nullable: true })
  pantone_p2: string;

  @Column({ nullable: true })
  pantone_p3: string;

  @Column({ nullable: true })
  pantone_p4: string;

  // Card sizing
  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  required_card_length: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  required_card_width: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  required_card_gramage: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  printing_card_length: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  printing_card_width: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  printing_card_gramage: number;

  @Column({ nullable: true })
  ups_code: string;

  @Column({ default: false })
  grain_side_first: boolean;

  // Dye information
  @Column({ nullable: true })
  old_dye_code: string;

  @Column({ nullable: true })
  new_dye_code: string;

  @Column({ default: false })
  is_new_dye: boolean;

  // Design section
  @Column({ default: false })
  ctp_required: boolean;

  @Column({ default: false })
  drip_off_required: boolean;

  @Column({ default: false })
  spot_uv_required: boolean;

  @Column({ default: false })
  emboss_required: boolean;

  // Status & Approvals
  @Column({ type: 'enum', enum: SpecStatus, default: SpecStatus.DRAFT })
  status: SpecStatus;

  @Column({ nullable: true })
  prepared_by_id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'prepared_by_id' })
  prepared_by: User;

  @Column({ nullable: true })
  received_by_id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'received_by_id' })
  received_by: User;

  @Column({ nullable: true })
  grn_number: string;

  @Column({ type: 'text', nullable: true })
  other_information: string;

  @OneToMany(() => SpecificationApproval, (approval) => approval.specification, {
    cascade: true,
  })
  approvals: SpecificationApproval[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
