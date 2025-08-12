import {
  Entity,
  Column,
  ManyToOne,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Transaction } from './transaction.entity';

@Entity({ name: 'antifraud_evaluations' })
@ObjectType('AntifraudEvaluation')
export class AntifraudEvaluation {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  @Field(() => ID)
  id!: number;

  @Column({ name: 'transaction_id', type: 'bigint' })
  transactionId!: number;

  @ManyToOne(() => Transaction, (t) => t.antifraudEvaluations, {
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'transaction_id' })
  @Field(() => Transaction)
  transaction!: Transaction;

  @Column({ name: 'decision', type: 'smallint' })
  @Field(() => Number, { description: '2 = Approved, 3 = Rejected' })
  decision!: number; // 2 = Approved, 3 = Rejected

  @Column({ name: 'rule_applied', type: 'text' })
  @Field()
  ruleApplied!: string;

  @CreateDateColumn({ name: 'evaluated_at', type: 'timestamptz' })
  @Field()
  evaluatedAt!: Date;

  @Column({ type: 'jsonb', nullable: true })
  @Field(() => String, {
    nullable: true,
    description: 'Additional evaluation details in JSON format',
  })
  details!: Record<string, unknown> | null;
}
