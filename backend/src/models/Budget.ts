/**
 * Budget Entity
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User';
import { Category } from './Category';

@Entity('budgets')
@Index(['user_id'])
@Index(['category_id'])
@Index(['status'])
@Index(['period'])
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column('uuid')
  category_id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'bigint' })
  limit_amount_paise: number;

  @Column({ type: 'char', length: 3, default: 'INR' })
  currency: string;

  // Period
  @Column({
    type: 'enum',
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: 'monthly',
  })
  period: string;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  end_date: Date;

  // Status & Progress
  @Column({
    type: 'enum',
    enum: ['active', 'paused', 'closed'],
    default: 'active',
  })
  status: string;

  @Column({ type: 'bigint', default: 0 })
  spent_amount_paise: number;

  // Alerts
  @Column({ type: 'integer', default: 80 })
  alert_at_percentage: number;

  @Column({ type: 'boolean', default: true })
  alert_enabled: boolean;

  @Column({ type: 'boolean', default: true })
  send_notification: boolean;

  // Rollover
  @Column({ type: 'boolean', default: false })
  allow_rollover: boolean;

  @Column({ type: 'bigint', default: 0 })
  rollover_amount_paise: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.budgets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  // Computed properties
  getRemainingAmount(): number {
    return this.limit_amount_paise - this.spent_amount_paise;
  }

  getSpentPercentage(): number {
    return (this.spent_amount_paise / this.limit_amount_paise) * 100;
  }

  isExceeded(): boolean {
    return this.spent_amount_paise > this.limit_amount_paise;
  }

  shouldAlert(): boolean {
    return (
      this.alert_enabled &&
      this.getSpentPercentage() >= this.alert_at_percentage
    );
  }
}
