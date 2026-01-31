/**
 * User Entity - Core user information
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { BankAccount } from './BankAccount';
import { Transaction } from './Transaction';
import { Budget } from './Budget';
import { UPIMandate } from './UPIMandate';

@Entity('users')
@Index(['email'])
@Index(['phone_number'])
@Index(['aadhar_encrypted'])
@Index(['pan_encrypted'])
@Index(['created_at'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  phone_number: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  first_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  last_name: string;

  @Column({ type: 'text', nullable: true })
  profile_pic_url: string;

  // KYC Information (Encrypted)
  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  aadhar_encrypted: string;

  @Column({ type: 'boolean', default: false })
  aadhar_verified: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  pan_encrypted: string;

  @Column({ type: 'boolean', default: false })
  pan_verified: boolean;

  @Column({ type: 'date', nullable: true })
  dob: Date;

  // Account Status
  @Column({
    type: 'enum',
    enum: ['active', 'suspended', 'closed'],
    default: 'active',
  })
  account_status: string;

  @Column({ type: 'boolean', default: false })
  email_verified: boolean;

  @Column({ type: 'boolean', default: false })
  phone_verified: boolean;

  // Settings
  @Column({ type: 'char', length: 3, default: 'INR' })
  currency_preference: string;

  @Column({ type: 'boolean', default: true })
  notification_enabled: boolean;

  @Column({ type: 'boolean', default: false })
  dark_mode: boolean;

  @Column({ type: 'boolean', default: false })
  two_factor_enabled: boolean;

  // Device Binding
  @Column({ type: 'varchar', length: 255, nullable: true })
  device_fingerprint_hash: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  device_id: string;

  // Timestamps
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at: Date;

  // Relations
  @OneToMany(() => BankAccount, (account) => account.user, {
    cascade: true,
  })
  bank_accounts: BankAccount[];

  @OneToMany(() => Transaction, (txn) => txn.user, { cascade: true })
  transactions: Transaction[];

  @OneToMany(() => Budget, (budget) => budget.user, { cascade: true })
  budgets: Budget[];

  @OneToMany(() => UPIMandate, (mandate) => mandate.user, { cascade: true })
  upi_mandates: UPIMandate[];

  // Helper methods
  fullName(): string {
    return `${this.first_name || ''} ${this.last_name || ''}`.trim();
  }

  isKYCComplete(): boolean {
    return this.aadhar_verified && this.pan_verified;
  }

  isActive(): boolean {
    return this.account_status === 'active';
  }
}
