import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { QualityInspection } from './quality-inspection.entity';
import { User } from '../../users/entities/user.entity';

export enum DefectCategory {
  PRINTING = 'printing',
  COLOR_MISMATCH = 'color_mismatch',
  REGISTRATION = 'registration',
  DIE_CUTTING = 'die_cutting',
  LAMINATION = 'lamination',
  PASTING = 'pasting',
  MATERIAL = 'material',
  FINISHING = 'finishing',
  OTHER = 'other',
}

export enum DefectSeverity {
  MINOR = 'minor',
  MAJOR = 'major',
  CRITICAL = 'critical',
}

@Entity('quality_defects')
export class QualityDefect {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => QualityInspection, (inspection) => inspection.defects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inspection_id' })
  inspection: QualityInspection;

  @Column({ type: 'uuid' })
  inspection_id: string;

  @Column({
    type: 'enum',
    enum: DefectCategory,
  })
  category: DefectCategory;

  @Column({
    type: 'enum',
    enum: DefectSeverity,
  })
  severity: DefectSeverity;

  @Column({ type: 'varchar', length: 200 })
  description: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  photo_url: string;

  @Column({ type: 'text', nullable: true })
  root_cause: string;

  @Column({ type: 'text', nullable: true })
  corrective_action: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'logged_by_id' })
  logged_by: User;

  @Column({ type: 'uuid' })
  logged_by_id: string;

  @CreateDateColumn()
  created_at: Date;
}
