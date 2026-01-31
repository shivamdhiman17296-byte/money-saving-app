/**
 * Category Entity
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';

@Entity('categories')
@Index(['user_id'])
@Index(['name'])
@Unique(['user_id', 'name'])
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string; // NULL for default categories

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  icon_url: string;

  @Column({ type: 'varchar', length: 7, nullable: true })
  color_hex: string;

  // Category Type
  @Column({
    type: 'enum',
    enum: ['expense', 'income', 'transfer'],
    default: 'expense',
  })
  type: string;

  // Built-in vs Custom
  @Column({ type: 'boolean', default: false })
  is_custom: boolean;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  // ML Model Training
  @Column({
    type: 'varchar',
    array: true,
    default: () => 'ARRAY[]::varchar[]',
  })
  keywords: string[];

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  confidence_threshold: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Helper methods
  isDefault(): boolean {
    return this.user_id === null;
  }
}
