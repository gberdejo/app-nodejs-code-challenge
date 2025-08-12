import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { TransactionService } from './transaction.service';
import { Transaction } from '../database/entities/transaction.entity';
import { CreateTransactionInput } from './dto/create-transaction.input';

@Resolver(() => Transaction)
export class TransactionResolver {
  constructor(private readonly transactionService: TransactionService) {}

  @Mutation(() => Transaction)
  async createTransaction(
    @Args('input') input: CreateTransactionInput,
  ): Promise<Transaction> {
    return this.transactionService.createTransaction(input);
  }

  @Query(() => Transaction, { nullable: true })
  async transaction(
    @Args('transactionExternalId') transactionExternalId: string,
  ): Promise<Transaction | null> {
    return this.transactionService.findTransaction(transactionExternalId);
  }

  @Query(() => [Transaction])
  async transactions(): Promise<Transaction[]> {
    return this.transactionService.findAllTransactions();
  }
}
