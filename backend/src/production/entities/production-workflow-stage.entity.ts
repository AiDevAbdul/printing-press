import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProductionJob } from './production-job.entity';
import { User } from '../../users/entities/user.entity';

export enum WorkflowStageStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  COMPLETED = 'completed',
}

@Entity('production_workflow_stages')
export class ProductionWorkflowStage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ProductionJob, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: ProductionJob;

  @Column({ type: 'varchar', length: 100 })
  stage_name: string;

  @Column({ type: 'int' })
  stage_order: number;

  @Column({
    type: 'enum',
    enum: WorkflowStageStatus,
    default: WorkflowStageStatus.PENDING,
  })
  status: WorkflowStageStatus;

  // Timestamps
  @Column({ type: 'timestamp', nullable: true })
  started_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  paused_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  resumed_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  // Duration tracking
  @Column({ type: 'int', default: 0 })
  active_duration_minutes: number;

  @Column({ type: 'int', default: 0 })
  pause_duration_minutes: number;

  @Column({ type: 'int', nullable: true })
  total_duration_minutes: number;

  // Assignment
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'operator_id' })
  operator: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  operator_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  machine: string;

  // Additional data
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  waste_quantity: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  pause_reason: string;

  // Metadata
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
