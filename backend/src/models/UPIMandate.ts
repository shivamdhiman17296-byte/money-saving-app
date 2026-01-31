/**
 * UPIMandate Entity - For autopay/recurring payments
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
import { BankAccount } from './BankAccount';

@Entity('upi_mandates')
@Index(['user_id'])
@Index(['mandate_id'])
@Index(['status'])
export class UPIMandate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  // Mandate Details
  @Column({ type: 'varchar', length: 50, unique: true })
  mandate_id: string;

  @Column({ type: 'varchar', length: 100 })
  upi_id: string;

  @Column({ type: 'uuid', nullable: true })
  bank_account_id: string;

  // Merchant Details
  @Column({ type: 'varchar', length: 100 })
  merchant_name: string;

  @Column({ type: 'varchar', length: 100 })
  merchant_upi_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  merchant_category: string;

  // Mandate Rules
  @Column({
    type: 'enum',
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
  })
  frequency: string;

  @Column({ type: 'bigint' })
  amount_paise: number;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  end_date: Date;

  // Status
  @Column({
    type: 'enum',
    enum: ['active', 'paused', 'revoked', 'expired'],
    default: 'active',
  })
  status: string;

  @Column({ type: 'date', nullable: true })
  next_collection_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_collection_date: Date;

  @Column({ type: 'integer', default: 0 })
  total_collections_done: number;

  @Column({ type: 'bigint', default: 0 })
  total_amount_collected_paise: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.upi_mandates, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => BankAccount, { nullable: true })
  @JoinColumn({ name: 'bank_account_id' })
  bank_account: BankAccount;

  // Helper methods
  isActive(): boolean {
    return this.status === 'active';
  }

  isExpired(): boolean {
    if (!this.end_date) return false;
    return new Date() > this.end_date;
  }

  canCollect(): boolean {
    return (
      this.isActive() &&
      !this.isExpired() &&
      this.next_collection_date &&
      new Date() >= this.next_collection_date
    );
  }
}
