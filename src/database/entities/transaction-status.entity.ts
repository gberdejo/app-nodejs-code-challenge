import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Transaction } from './transaction.entity';

@Entity({ name: 'transaction_status' })
@ObjectType('TransactionStatus')
export class TransactionStatus {
  @PrimaryColumn({ type: 'smallint' })
  @Field(() => ID)
  id!: number; // 1: Pending, 2: Approved, 3: Rejected

  @Column({ type: 'text', unique: true })
  @Field()
  name!: string;

  @OneToMany(() => Transaction, (t) => t.status)
  @Field(() => [Transaction], { nullable: true })
  transactions?: Transaction[];
}
