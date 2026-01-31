/**
 * BankAccount Entity
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
  Unique,
} from 'typeorm';
import { User } from './User';

@Entity('bank_accounts')
@Index(['user_id'])
@Index(['upi_handle'])
@Unique(['user_id', 'account_number_encrypted'])
export class BankAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  user_id: string;

  // Bank Details (encrypted)
  @Column({ type: 'varchar', length: 255 })
  account_number_encrypted: string;

  @Column({ type: 'varchar', length: 11 })
  ifsc_code: string;

  @Column({ type: 'varchar', length: 100 })
  bank_name: string;

  @Column({ type: 'varchar', length: 100 })
  account_holder_name: string;

  @Column({
    type: 'enum',
    enum: ['savings', 'current', 'salary'],
    default: 'savings',
  })
  account_type: string;

  // Verification
  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({
    type: 'enum',
    enum: ['penny_test', 'aadhar_match', 'auto'],
    default: 'penny_test',
  })
  verification_method: string;

  @Column({ type: 'timestamp', nullable: true })
  verification_date: Date;

  // UPI Handle
  @Column({ type: 'varchar', length: 50, nullable: true, unique: true })
  upi_handle: string;

  @Column({ type: 'boolean', default: false })
  upi_verified: boolean;

  // Sync Configuration
  @Column({ type: 'boolean', default: true })
  auto_sync_enabled: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_sync_at: Date;

  @Column({
    type: 'enum',
    enum: ['daily', 'weekly', 'manual'],
    default: 'daily',
  })
  sync_frequency: string;

  // Status
  @Column({ type: 'boolean', default: false })
  is_primary: boolean;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  linked_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.bank_accounts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Helper methods
  getAccountNumberMasked(): string {
    if (!this.account_number_encrypted) return '****';
    const accountNum = this.account_number_encrypted.slice(-4);
    return `****${accountNum}`;
  }

  isFullyVerified(): boolean {
    return this.is_verified && this.upi_verified;
  }
}
