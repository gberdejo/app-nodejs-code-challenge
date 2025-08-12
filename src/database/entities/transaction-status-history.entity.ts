import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@Entity({ name: 'transaction_status_history' })
@ObjectType('TransactionStatusHistory')
@Index('idx_txn_hist_txn_id_time', ['transactionId', 'changedAt'])
export class TransactionStatusHistory {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  @Field(() => ID)
  id!: number;

  @Column({ name: 'transaction_id', type: 'bigint' })
  @Field(() => ID)
  transactionId!: number;

  @Column({ name: 'old_status_id', type: 'smallint', nullable: true })
  @Field(() => Number, { nullable: true })
  oldStatusId?: number | null;

  @Column({ name: 'new_status_id', type: 'smallint' })
  @Field(() => Number)
  newStatusId!: number;

  @Column({ type: 'text', nullable: true })
  @Field(() => String, { nullable: true })
  reason?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  @Field(() => String, { nullable: true })
  metadata?: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'changed_at', type: 'timestamptz' })
  @Field()
  changedAt!: Date;
}
