import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionService } from './transaction.service';
import { TransactionResolver } from './transaction.resolver';
import { TransactionEventsController } from './transaction-events.controller';
import {
  Transaction,
  TransferType,
  TransactionStatusHistory,
  TransactionStatus,
  Outbox,
  EventConsumption,
} from '../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      TransferType,
      TransactionStatusHistory,
      TransactionStatus,
      Outbox,
      EventConsumption,
    ]),
  ],
  controllers: [TransactionEventsController],
  providers: [TransactionService, TransactionResolver],
  exports: [TransactionService],
})
export class TransactionModule {}
