import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Quotation, QuotationStatus } from './quotation.entity';
import { User } from '../../users/entities/user.entity';

@Entity('quotation_history')
export class QuotationHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Quotation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quotation_id' })
  quotation: Quotation;

  @Column({ type: 'uuid' })
  quotation_id: string;

  @Column({
    type: 'enum',
    enum: QuotationStatus,
  })
  old_status: QuotationStatus;

  @Column({
    type: 'enum',
    enum: QuotationStatus,
  })
  new_status: QuotationStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'changed_by_id' })
  changed_by: User;

  @Column({ type: 'uuid' })
  changed_by_id: string;

  @CreateDateColumn()
  changed_at: Date;
}
