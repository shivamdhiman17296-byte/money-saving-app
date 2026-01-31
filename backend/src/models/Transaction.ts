/**
 * Transaction Entity - All payment transactions
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
import { Category } from './Category';

@Entity('transactions')
@Index(['user_id', 'transaction_date'])
@Index(['bank_account_id'])
@Index(['category_id'])
@Index(['status'])
@Index(['upi_reference_number'])
@Index(['is_flagged'])
@Index(['created_at'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  @Column({ type: 'uuid', nullable: true })
  bank_account_id: string;

  // Transaction Details
  @Column({ type: 'enum', enum: ['debit', 'credit'] })
  type: string;

  @Column({ type: 'bigint' })
  amount_paise: number; // Store in paise (1 INR = 100 paise)

  @Column({ type: 'char', length: 3, default: 'INR' })
  currency: string;

  // UPI Specific
  @Column({ type: 'varchar', length: 50, nullable: true })
  upi_transaction_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  upi_reference_number: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  payer_upi_id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  payee_upi_id: string;

  // Description & Notes
  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Party Information
  @Column({ type: 'varchar', length: 100, nullable: true })
  party_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  party_account_number_encrypted: string;

  @Column({ type: 'varchar', length: 11, nullable: true })
  party_ifsc: string;

  @Column({
    type: 'enum',
    enum: ['individual', 'merchant', 'business'],
    default: 'individual',
  })
  party_type: string;

  // Status
  @Column({
    type: 'enum',
    enum: ['pending', 'success', 'failed', 'reversed'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  error_code: string;

  @Column({ type: 'text', nullable: true })
  error_message: string;

  // Category
  @Column({ type: 'uuid', nullable: true })
  category_id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  category_name: string;

  @Column({ type: 'boolean', default: false })
  category_auto_detected: boolean;

  @Column({ type: 'varchar', array: true, default: () => 'ARRAY[]::varchar[]' })
  tags: string[];

  // Manual vs Auto
  @Column({ type: 'boolean', default: false })
  is_manual: boolean;

  @Column({ type: 'boolean', default: false })
  created_by_user: boolean;

  // Timestamps
  @Column({ type: 'timestamp' })
  transaction_date: Date;

  @Column({ type: 'time', nullable: true })
  transaction_time: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Fraud Detection
  @Column({ type: 'boolean', default: false })
  is_flagged: boolean;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  fraud_score: number; // 0.00 to 1.00

  @Column({ type: 'uuid', nullable: true })
  recurring_id: string;

  // Relations
  @ManyToOne(() => User, (user) => user.transactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => BankAccount, { nullable: true })
  @JoinColumn({ name: 'bank_account_id' })
  bank_account: BankAccount;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  // Helper methods
  isSuccessful(): boolean {
    return this.status === 'success';
  }

  getAmountINR(): number {
    return this.amount_paise / 100;
  }

  isIncome(): boolean {
    return this.type === 'credit';
  }

  isExpense(): boolean {
    return this.type === 'debit';
  }
}
