import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum InventoryCategory {
  PAPER = 'paper',
  INK = 'ink',
  PLATES = 'plates',
  FINISHING_MATERIALS = 'finishing_materials',
  PACKAGING = 'packaging',
}

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  item_code: string;

  @Column()
  item_name: string;

  @Column({
    type: 'enum',
    enum: InventoryCategory,
  })
  category: InventoryCategory;

  @Column({ nullable: true })
  subcategory: string;

  @Column()
  unit: string;

  @Column({ nullable: true })
  gsm: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  size_length: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  size_width: number;

  @Column({ nullable: true })
  brand: string;

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
