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

@Entity('machine_counters')
export class MachineCounter {
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

  @Column({ type: 'varchar', length: 50 })
  machine_name: string;

  @Column({ type: 'int' })
  counter_start: number;

  @Column({ type: 'int', nullable: true })
  counter_end: number;

  @Column({ type: 'int', nullable: true })
  good_quantity: number;

  @Column({ type: 'int', nullable: true })
  waste_quantity: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'recorded_by_id' })
  recorded_by: User;

  @Column({ type: 'uuid' })
  recorded_by_id: string;

  @CreateDateColumn()
  created_at: Date;
}
