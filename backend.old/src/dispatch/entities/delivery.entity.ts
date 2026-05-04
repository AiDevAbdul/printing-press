import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ProductionJob } from '../../production/entities/production-job.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { User } from '../../users/entities/user.entity';
import { PackingList } from './packing-list.entity';
import { DeliveryTracking } from './delivery-tracking.entity';

export enum DeliveryStatus {
  PENDING = 'pending',
  PACKED = 'packed',
  DISPATCHED = 'dispatched',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  RETURNED = 'returned',
}

export enum DeliveryType {
  COURIER = 'courier',
  OWN_TRANSPORT = 'own_transport',
  CUSTOMER_PICKUP = 'customer_pickup',
}

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  delivery_number: string;

  @ManyToOne(() => ProductionJob, { eager: true })
  @JoinColumn({ name: 'job_id' })
  job: ProductionJob;

  @Column({ type: 'uuid' })
  job_id: string;

  @ManyToOne(() => Customer, { eager: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ type: 'uuid' })
  customer_id: string;

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.PENDING,
  })
  delivery_status: DeliveryStatus;

  @Column({
    type: 'enum',
    enum: DeliveryType,
  })
  delivery_type: DeliveryType;

  @Column({ type: 'date' })
  scheduled_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  packed_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  dispatched_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  delivered_at: Date;

  // Courier Details
  @Column({ nullable: true })
  courier_name: string;

  @Column({ nullable: true })
  tracking_number: string;

  // Own Transport Details
  @Column({ nullable: true })
  vehicle_number: string;

  @Column({ nullable: true })
  driver_name: string;

  @Column({ nullable: true })
  driver_phone: string;

  // Delivery Address
  @Column({ type: 'text' })
  delivery_address: string;

  @Column({ nullable: true })
  delivery_contact_name: string;

  @Column({ nullable: true })
  delivery_contact_phone: string;

  // Proof of Delivery
  @Column({ nullable: true })
  pod_photo_url: string;

  @Column({ nullable: true })
  pod_signature_url: string;

  @Column({ nullable: true })
  received_by_name: string;

  @Column({ nullable: true })
  received_by_designation: string;

  @Column({ type: 'text', nullable: true })
  delivery_notes: string;

  @Column({ type: 'text', nullable: true })
  failure_reason: string;

  // Packing Lists
  @OneToMany(() => PackingList, (packingList) => packingList.delivery)
  packing_lists: PackingList[];

  // Tracking History
  @OneToMany(() => DeliveryTracking, (tracking) => tracking.delivery)
  tracking_history: DeliveryTracking[];

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_id' })
  created_by: User;

  @Column({ type: 'uuid' })
  created_by_id: string;

  @Column({ type: 'uuid' })
  company_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
