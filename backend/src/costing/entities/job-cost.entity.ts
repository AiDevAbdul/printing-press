import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProductionJob } from '../../production/entities/production-job.entity';
import { InventoryItem } from '../../inventory/entities/inventory-item.entity';

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

  @CreateDateColumn()
  created_at: Date;
}
