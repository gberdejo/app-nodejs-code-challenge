import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { TransferType } from './transfer-type.entity';
import { AntifraudEvaluation } from './antifraud-evaluation.entity';
import { TransactionStatus } from './transaction-status.entity';

@Entity({ name: 'transactions' })
@ObjectType('Transaction')
@Index('idx_txn_external_id', ['transactionExternalId'])
@Index('idx_txn_created_at', ['createdAt'])
@Index('idx_txn_status_pending', ['status'])
export class Transaction {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  @Field(() => ID)
  id!: number;

  @Column({
    name: 'transaction_external_id',
    type: 'uuid',
    unique: true,
    default: () => 'gen_random_uuid()',
  })
  @Field(() => ID)
  transactionExternalId!: string;

  @Column({ name: 'account_external_id_debit', type: 'uuid' })
  @Field()
  accountExternalIdDebit!: string;

  @Column({ name: 'account_external_id_credit', type: 'uuid' })
  @Field()
  accountExternalIdCredit!: string;

  @ManyToOne(() => TransferType, (tt) => tt.transactions, {
    eager: true,
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'transfer_type_id' })
  @Field(() => TransferType)
  transferType!: TransferType;

  @Column({ name: 'transfer_type_id', type: 'smallint' })
  transferTypeId!: number;

  @Column({ name: 'status_id', type: 'smallint', default: 1 })
  statusId!: number;

  @ManyToOne(() => TransactionStatus, { eager: true })
  @JoinColumn({ name: 'status_id' })
  @Field(() => TransactionStatus)
  status!: TransactionStatus;

  @Column({ type: 'bigint', name: 'value' })
  @Field(() => Float)
  value!: number;

  @Column({ type: 'char', length: 3, default: 'PEN' })
  @Field()
  currency!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  @Field()
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  @Field()
  updatedAt!: Date;

  @OneToMany(() => AntifraudEvaluation, (a) => a.transaction)
  @Field(() => [AntifraudEvaluation], { nullable: true })
  antifraudEvaluations?: AntifraudEvaluation[];
}
