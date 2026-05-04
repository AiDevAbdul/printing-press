import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { ProductionJob } from '../../production/entities/production-job.entity';
import { User } from '../../users/entities/user.entity';

export enum ComplaintStatus {
  OPEN = 'open',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum ComplaintSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('customer_complaints')
export class CustomerComplaint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  complaint_number: string;

  @ManyToOne(() => Customer, { eager: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ type: 'uuid' })
  customer_id: string;

  @ManyToOne(() => ProductionJob, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'job_id' })
  job: ProductionJob;

  @Column({ type: 'uuid', nullable: true })
  job_id: string;

  @Column({ type: 'varchar', length: 200 })
  subject: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: ComplaintStatus,
    default: ComplaintStatus.OPEN,
  })
  status: ComplaintStatus;

  @Column({
    type: 'enum',
    enum: ComplaintSeverity,
    default: ComplaintSeverity.MEDIUM,
  })
  severity: ComplaintSeverity;

  @Column({ type: 'varchar', length: 255, nullable: true })
  photo_url: string;

  @Column({ type: 'text', nullable: true })
  root_cause_analysis: string;

  @Column({ type: 'text', nullable: true })
  corrective_action: string;

  @Column({ type: 'text', nullable: true })
  preventive_action: string;

  @Column({ type: 'text', nullable: true })
  resolution_notes: string;

  @Column({ type: 'timestamp', nullable: true })
  resolved_at: Date;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assigned_to_id' })
  assigned_to: User;

  @Column({ type: 'uuid', nullable: true })
  assigned_to_id: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_id' })
  created_by: User;

  @Column({ type: 'uuid' })
  created_by_id: string;

  @Column({ type: 'uuid' })
  company_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
