import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

export enum UserRole {
  ADMIN = 'admin',
  SALES = 'sales',
  PLANNER = 'planner',
  ACCOUNTS = 'accounts',
  INVENTORY = 'inventory',
  QA_MANAGER = 'qa_manager',
  OPERATOR = 'operator',
  ANALYST = 'analyst',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  company_id: string;

  @ManyToOne(() => Company, (company) => company.users, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column()
  password_hash: string;

  @Column()
  full_name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.SALES,
  })
  role: UserRole;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  department: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ type: 'jsonb', default: [] })
  system_access: string[];

  @Column({ type: 'jsonb', default: {} })
  partial_access: Record<string, string[]>;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'substitute_user_id' })
  substitute_user: User;

  @Column({ type: 'date', nullable: true })
  substitute_start_date: Date;

  @Column({ type: 'date', nullable: true })
  substitute_end_date: Date;

  @Column({ type: 'text', nullable: true })
  substitute_reason: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
