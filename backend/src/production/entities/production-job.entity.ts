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

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
