import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductionJob } from './production-job.entity';
import { ProductionStageHistory } from './production-stage-history.entity';
import { User } from '../../users/entities/user.entity';

export enum WastageType {
  SETUP_WASTE = 'setup_waste',
  PRODUCTION_WASTE = 'production_waste',
  QUALITY_REJECTION = 'quality_rejection',
  MACHINE_ERROR = 'machine_error',
  MATERIAL_DEFECT = 'material_defect',
  OTHER = 'other',
}

@Entity('wastage_records')
export class WastageRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProductionJob, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: ProductionJob;

  @Column({ type: 'uuid' })
  job_id: string;

  @ManyToOne(() => ProductionStageHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stage_history_id' })
  stage_history: ProductionStageHistory;

  @Column({ type: 'uuid' })
  stage_history_id: string;

  @Column({
    type: 'enum',
    enum: WastageType,
  })
  wastage_type: WastageType;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'varchar', length: 20 })
  unit: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimated_cost: number;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'text', nullable: true })
  corrective_action: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'recorded_by_id' })
  recorded_by: User;

  @Column({ type: 'uuid' })
  recorded_by_id: string;

  @CreateDateColumn()
  created_at: Date;
}
