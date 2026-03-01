import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum InventoryCategory {
  PAPER = 'paper',
  INK = 'ink',
  PLATES = 'plates',
  FINISHING_MATERIALS = 'finishing_materials',
  PACKAGING = 'packaging',
}

export enum MainCategory {
  BLOCK = 'block',
  PAPER = 'paper',
  OTHER_MATERIAL = 'other_material',
}

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  item_code: string;

  @Column()
  item_name: string;

  @Index()
  @Column({
    type: 'enum',
    enum: MainCategory,
    nullable: true,
  })
  main_category: MainCategory;

  @Column({
    type: 'enum',
    enum: InventoryCategory,
  })
  category: InventoryCategory;

  @Column({ nullable: true })
  subcategory: string;

  @Column()
  unit: string;

  @Column({ type: 'int', nullable: true })
  gsm: number;

  @Index()
  @Column({ nullable: true })
  size: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  size_length: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  size_width: number;

  @Column({ nullable: true })
  material_type: string;

  @Index()
  @Column({ nullable: true })
  brand: string;

  @Index()
  @Column({ nullable: true })
  color: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  current_stock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  reorder_level: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  reorder_quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  unit_cost: number;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
