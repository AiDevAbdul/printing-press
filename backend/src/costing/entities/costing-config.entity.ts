import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('costing_config')
export class CostingConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Material Rates
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 150 })
  paper_rate_per_kg: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, default: 0.0001 })
  gsm_rate_factor: number;

  // Printing Rates (per 1000 pieces)
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 2000 })
  cmyk_base_rate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 800 })
  special_color_rate: number;

  // Finishing Rates
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 50 })
  spot_uv_rate_per_sqm: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 30 })
  lamination_rate_per_sqm: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1500 })
  embossing_rate_per_job: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 500 })
  die_cutting_rate_per_1000: number;

  // Pre-Press Charges
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 2000 })
  pre_press_simple: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 3500 })
  pre_press_medium: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 5000 })
  pre_press_complex: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 8000 })
  pre_press_rush: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @UpdateDateColumn()
  updated_at: Date;
}
