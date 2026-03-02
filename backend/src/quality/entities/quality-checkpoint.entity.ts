import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CheckpointType {
  PRE_PRESS = 'pre_press',
  PRINTING = 'printing',
  LAMINATION = 'lamination',
  UV_COATING = 'uv_coating',
  DIE_CUTTING = 'die_cutting',
  PASTING = 'pasting',
  FINAL_INSPECTION = 'final_inspection',
}

export enum CheckpointSeverity {
  OPTIONAL = 'optional',
  MANDATORY = 'mandatory',
  CRITICAL = 'critical',
}

@Entity('quality_checkpoints')
export class QualityCheckpoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: CheckpointType,
  })
  stage: CheckpointType;

  @Column({
    type: 'enum',
    enum: CheckpointSeverity,
    default: CheckpointSeverity.MANDATORY,
  })
  severity: CheckpointSeverity;

  @Column({ type: 'jsonb', nullable: true })
  checklist_items: string[];

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'int', default: 0 })
  sequence_order: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
