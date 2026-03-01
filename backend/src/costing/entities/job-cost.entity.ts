import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProductionJob } from '../../production/entities/production-job.entity';
import { InventoryItem } from '../../inventory/entities/inventory-item.entity';
import { Order } from '../../orders/entities/order.entity';

export enum CostType {
  MATERIAL = 'material',
  LABOR = 'labor',
  MACHINE = 'machine',
  OVERHEAD = 'overhead',
}

@Entity('job_costs')
export class JobCost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProductionJob)
  @JoinColumn({ name: 'job_id' })
  job: ProductionJob;

  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({
    type: 'enum',
    enum: CostType,
  })
  cost_type: CostType;

  @ManyToOne(() => InventoryItem, { nullable: true })
  @JoinColumn({ name: 'item_id' })
  item: InventoryItem;

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_cost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_cost: number;

  // Product Specification Fields (Auto-loaded from Order)
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  card_length: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  card_width: number;

  @Column({ type: 'int', nullable: true })
  card_gsm: number;

  @Column({ nullable: true })
  card_type: string;

  @Column({ type: 'boolean', default: false })
  colors_cmyk: boolean;

  @Column({ type: 'int', default: 0 })
  special_colors_count: number;

  @Column({ type: 'text', nullable: true })
  special_colors: string;

  @Column({ nullable: true })
  uv_type: string;

  @Column({ type: 'boolean', default: false })
  lamination_required: boolean;

  @Column({ type: 'boolean', default: false })
  embossing_required: boolean;

  // Auto-Calculated Cost Breakdown
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  material_cost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  printing_cost_cmyk: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  printing_cost_special: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  uv_cost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  lamination_cost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  die_cutting_cost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  embossing_cost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  pre_press_charges: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_processing_cost: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  cost_per_unit: number;

  @CreateDateColumn()
  created_at: Date;
}
