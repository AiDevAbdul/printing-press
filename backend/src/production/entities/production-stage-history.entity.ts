import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProductionJob } from './production-job.entity';
import { User } from '../../users/entities/user.entity';

@Entity('production_stage_history')
export class ProductionStageHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProductionJob, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: ProductionJob;

  @Column({ type: 'varchar', length: 100 })
  stage: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  process: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  machine: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'operator_id' })
  operator: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  started_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @Column({ type: 'int', nullable: true })
  duration_minutes: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
