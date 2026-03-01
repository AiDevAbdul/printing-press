import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';

export enum ProductionJobStatus {
  QUEUED = 'queued',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('production_jobs')
export class ProductionJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  job_number: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ type: 'date', nullable: true })
  scheduled_start_date: Date;

  @Column({ type: 'date', nullable: true })
  scheduled_end_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  actual_start_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  actual_end_date: Date;

  @Column({
    type: 'enum',
    enum: ProductionJobStatus,
    default: ProductionJobStatus.QUEUED,
  })
  status: ProductionJobStatus;

  @Column({ nullable: true })
  assigned_machine: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_operator' })
  assigned_operator: User;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimated_hours: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actual_hours: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'int', nullable: true })
  queue_position: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  current_stage: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  current_process: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  inline_status: string;

  @Column({ type: 'text', nullable: true })
  searchable_text: string;

  @Column({ type: 'timestamp', nullable: true })
  estimated_start: Date;

  @Column({ type: 'timestamp', nullable: true })
  estimated_completion: Date;

  @Column({ type: 'timestamp', nullable: true })
  actual_completion: Date;

  @Column({ type: 'int', default: 0 })
  progress_percent: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
