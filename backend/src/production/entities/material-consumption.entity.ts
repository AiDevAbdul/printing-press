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

export enum MaterialTransactionType {
  ISSUE = 'issue',
  RETURN = 'return',
}

@Entity('material_consumption')
export class MaterialConsumption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({ type: 'varchar', length: 100 })
  material_name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  material_code: string;

  @Column({
    type: 'enum',
    enum: MaterialTransactionType,
  })
  transaction_type: MaterialTransactionType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'varchar', length: 20 })
  unit: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'issued_by_id' })
  issued_by: User;

  @Column({ type: 'uuid' })
  issued_by_id: string;

  @CreateDateColumn()
  created_at: Date;
}
