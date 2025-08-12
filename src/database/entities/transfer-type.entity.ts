import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Transaction } from './transaction.entity';

@Entity({ name: 'transfer_types' })
@ObjectType('TransactionType')
export class TransferType {
  @PrimaryColumn({ type: 'smallint' })
  @Field(() => ID)
  id!: number; // 1: Transfer, 2: Payment, 3: Deposit

  @Column({ type: 'text', unique: true })
  @Field()
  name!: string;

  @OneToMany(() => Transaction, (t) => t.transferType)
  @Field(() => [Transaction], { nullable: true })
  transactions?: Transaction[];
}
