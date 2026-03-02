import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductionJob } from '../../production/entities/production-job.entity';
import { User } from '../../users/entities/user.entity';

export enum RejectionDisposition {
  SCRAP = 'scrap',
  REWORK = 'rework',
  USE_AS_IS = 'use_as_is',
  RETURN_TO_VENDOR = 'return_to_vendor',
}

@Entity('quality_rejections')
export class QualityRejection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  rejection_number: string;

  @ManyToOne(() => ProductionJob, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: ProductionJob;

  @Column({ type: 'uuid' })
  job_id: string;

  @Column({ type: 'int' })
  rejected_quantity: number;

  @Column({ type: 'varchar', length: 20 })
  unit: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({
    type: 'enum',
    enum: RejectionDisposition,
  })
  disposition: RejectionDisposition;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimated_loss: number;

  @Column({ type: 'text', nullable: true })
  corrective_action: string;

  @Column({ type: 'boolean', default: false })
  is_resolved: boolean;

  @Column({ type: 'timestamp', nullable: true })
  resolved_at: Date;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'rejected_by_id' })
  rejected_by: User;

  @Column({ type: 'uuid' })
  rejected_by_id: string;

  @CreateDateColumn()
  created_at: Date;
}
