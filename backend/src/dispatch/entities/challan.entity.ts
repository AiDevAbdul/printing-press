import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Delivery } from './delivery.entity';
import { User } from '../../users/entities/user.entity';

@Entity('challans')
export class Challan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  challan_number: string;

  @ManyToOne(() => Delivery, { eager: true })
  @JoinColumn({ name: 'delivery_id' })
  delivery: Delivery;

  @Column({ type: 'uuid' })
  delivery_id: string;

  @Column({ type: 'date' })
  challan_date: Date;

  @Column({ type: 'text', nullable: true })
  terms_and_conditions: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'generated_by_id' })
  generated_by: User;

  @Column({ type: 'uuid' })
  generated_by_id: string;

  @CreateDateColumn()
  created_at: Date;
}
