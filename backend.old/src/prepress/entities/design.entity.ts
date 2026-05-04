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
import { User } from '../../users/entities/user.entity';
import { Company } from '../../companies/entities/company.entity';
import { DesignApproval } from './design-approval.entity';
import { DesignAttachment } from './design-attachment.entity';

export enum DesignStatus {
  IN_DESIGN = 'in_design',
  WAITING_FOR_DATA = 'waiting_for_data',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum DesignType {
  BOX = 'box',
  LABEL = 'label',
  LITERATURE = 'literature',
  LOGO = 'logo',
  OTHER = 'other',
}

export enum ProductCategory {
  COMMERCIAL = 'commercial',
  LOGO = 'logo',
  PRODUCT = 'product',
  OTHER = 'other',
}

@Entity('designs')
export class Design {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  company_id: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: DesignType })
  design_type: DesignType;

  @Column({ type: 'enum', enum: ProductCategory })
  product_category: ProductCategory;

  @Column({ nullable: true })
  product_name: string;

  @Column({ type: 'enum', enum: DesignStatus, default: DesignStatus.IN_DESIGN })
  status: DesignStatus;

  @Column({ nullable: true })
  designer_id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'designer_id' })
  designer: User;

  @Column({ nullable: true })
  specs_sheet_url: string;

  @Column({ nullable: true })
  approval_sheet_url: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => DesignApproval, (approval) => approval.design, {
    cascade: true,
  })
  approvals: DesignApproval[];

  @OneToMany(() => DesignAttachment, (attachment) => attachment.design, {
    cascade: true,
  })
  attachments: DesignAttachment[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
