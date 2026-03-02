import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ProductionJob } from '../../production/entities/production-job.entity';
import { ProductionStageHistory } from '../../production/entities/production-stage-history.entity';
import { QualityCheckpoint } from './quality-checkpoint.entity';
import { User } from '../../users/entities/user.entity';
import { QualityDefect } from './quality-defect.entity';

export enum InspectionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  PASSED = 'passed',
  FAILED = 'failed',
}

@Entity('quality_inspections')
export class QualityInspection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  inspection_number: string;

  @ManyToOne(() => ProductionJob, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: ProductionJob;

  @Column({ type: 'uuid' })
  job_id: string;

  @ManyToOne(() => ProductionStageHistory, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'stage_history_id' })
  stage_history: ProductionStageHistory;

  @Column({ type: 'uuid', nullable: true })
  stage_history_id: string;

  @ManyToOne(() => QualityCheckpoint, { eager: true })
  @JoinColumn({ name: 'checkpoint_id' })
  checkpoint: QualityCheckpoint;

  @Column({ type: 'uuid' })
  checkpoint_id: string;

  @Column({
    type: 'enum',
    enum: InspectionStatus,
    default: InspectionStatus.PENDING,
  })
  status: InspectionStatus;

  @Column({ type: 'int', nullable: true })
  sample_size: number;

  @Column({ type: 'int', nullable: true })
  defects_found: number;

  @Column({ type: 'jsonb', nullable: true })
  checklist_results: Record<string, boolean>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  failure_reason: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'inspector_id' })
  inspector: User;

  @Column({ type: 'uuid' })
  inspector_id: string;

  @Column({ type: 'timestamp', nullable: true })
  inspected_at: Date;

  @OneToMany(() => QualityDefect, (defect) => defect.inspection)
  defects: QualityDefect[];

  @CreateDateColumn()
  created_at: Date;
}
