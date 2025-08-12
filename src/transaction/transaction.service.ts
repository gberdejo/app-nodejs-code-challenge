import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTransactionInput } from './dto/create-transaction.input';
import {
  Transaction,
  TransferType,
  TransactionStatusHistory,
  Outbox,
} from '../database/entities';
import { TransactionReason, AggregateType, EventType } from '../enums';
import { v4 } from 'uuid';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(TransferType)
    private readonly transferTypeRepository: Repository<TransferType>,
    @InjectRepository(TransactionStatusHistory)
    private readonly statusHistoryRepository: Repository<TransactionStatusHistory>,
    @InjectRepository(Outbox)
    private readonly outboxRepository: Repository<Outbox>,
  ) {}

  async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    try {
      // Validar que el tipo de transferencia existe
      const transferType = await this.transferTypeRepository.findOne({
        where: { id: input.tranferTypeId },
      });

      if (!transferType) {
        throw new NotFoundException(
          `Transfer type with id ${input.tranferTypeId} not found`,
        );
      }

      // Crear nueva transacción
      const transaction = this.transactionRepository.create({
        accountExternalIdCredit: input.accountExternalIdCredit,
        accountExternalIdDebit: input.accountExternalIdDebit,
        transferTypeId: input.tranferTypeId,
        statusId: 1, // 1 = Pending
        value: input.value, // Convert to cents
      });

      const savedTransaction =
        await this.transactionRepository.save(transaction);

      // Crear historial de estado inicial
      const statusHistory = this.statusHistoryRepository.create({
        transactionId: savedTransaction.id,
        oldStatusId: null,
        newStatusId: 1,
        reason: TransactionReason.TRANSACTION_CREATED,
      });

      await this.statusHistoryRepository.save(statusHistory);

      // Crear evento para Kafka
      const outbox = this.outboxRepository.create({
        eventType: EventType.TRANSACTION_CREATED,
        aggregateType: AggregateType.TRANSACTION,
        aggregateId: v4(),
        payload: {
          transactionId: savedTransaction.id.toString(),
          value: savedTransaction.value,
        },
        occurredAt: new Date(),
        publishedAt: null,
      });

      await this.outboxRepository.save(outbox);

      // Cargar las relaciones para la respuesta
      return (await this.transactionRepository.findOne({
        where: { id: savedTransaction.id },
        relations: ['transferType', 'status'],
      })) as Transaction;
    } catch (error) {
      this.logger.error(
        `Failed to create transaction: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new Error('Failed to create transaction');
    }
  }

  async findTransaction(
    transactionExternalId: string,
  ): Promise<Transaction | null> {
    return await this.transactionRepository.findOne({
      where: { transactionExternalId },
      relations: ['transferType', 'status'],
    });
  }

  async findAllTransactions(): Promise<Transaction[]> {
    return await this.transactionRepository.find({
      relations: ['transferType', 'status'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateTransactionStatus(
    transactionId: number,
    newStatusId: number,
    reason?: string,
  ): Promise<void> {
    try {
      // Buscar la transacción actual
      const transaction = await this.transactionRepository.findOne({
        where: { id: transactionId },
        relations: ['status'],
      });

      if (!transaction) {
        throw new NotFoundException(
          `Transaction with ID ${transactionId} not found`,
        );
      }

      const oldStatusId = transaction.statusId;

      // Solo actualizar si el estado es diferente
      if (oldStatusId === newStatusId) {
        this.logger.log(
          `Transaction ${transactionId} already has status ${newStatusId}`,
        );
        return;
      }

      // Actualizar el estado de la transacción
      const result = await this.transactionRepository.update(
        { id: transactionId },
        { statusId: newStatusId },
      );

      if (result.affected === 0) {
        throw new Error(`Failed to update transaction ${transactionId}`);
      }

      // Crear historial de cambio de estado
      const statusHistory = this.statusHistoryRepository.create({
        transactionId: transactionId,
        oldStatusId: oldStatusId,
        newStatusId: newStatusId,
        reason: reason || 'Status updated by system',
      });

      await this.statusHistoryRepository.save(statusHistory);

      this.logger.log(
        `Transaction ${transactionId} status updated from ${oldStatusId} to ${newStatusId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error updating transaction status: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
