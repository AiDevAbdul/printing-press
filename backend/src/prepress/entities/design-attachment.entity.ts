import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Design } from './design.entity';
import { User } from '../../users/entities/user.entity';
import { Company } from '../../companies/entities/company.entity';

@Entity('design_attachments')
export class DesignAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  company_id: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column()
  design_id: string;

  @ManyToOne(() => Design, (design) => design.attachments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'design_id' })
  design: Design;

  @Column()
  file_name: string;

  @Column()
  file_url: string;

  @Column({ nullable: true })
  file_type: string;

  @Column({ nullable: true })
  uploaded_by_id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'uploaded_by_id' })
  uploaded_by: User;

  @CreateDateColumn()
  created_at: Date;
}
