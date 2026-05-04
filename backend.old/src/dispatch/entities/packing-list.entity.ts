import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Delivery } from './delivery.entity';

@Entity('packing_lists')
export class PackingList {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Delivery, (delivery) => delivery.packing_lists, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'delivery_id' })
  delivery: Delivery;

  @Column({ type: 'uuid' })
  delivery_id: string;

  @Column({ type: 'int' })
  box_number: number;

  @Column({ type: 'varchar', length: 200 })
  item_description: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'varchar', length: 20 })
  unit: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight_kg: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;
}
