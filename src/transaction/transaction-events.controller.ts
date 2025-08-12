import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, Ctx } from '@nestjs/microservices';
import { KafkaContext } from '@nestjs/microservices';
import { TransactionService } from './transaction.service';
import { InjectRepository } from '@nestjs/typeorm';
import { EventConsumption } from '../database/entities';
import { Repository } from 'typeorm';

export interface TransactionStatusUpdateEvent {
  transactionId: string;
  transactionExternalId: string;
  oldStatusId: number;
  newStatusId: number;
  reason?: string;
  updatedAt: string;
}

export interface AntifraudEvaluationResult {
  transactionId: string;
  transactionExternalId: string;
  reason: string;
  score: number;
  ruleApplied: string;
  evaluatedAt: string;
}

@Controller()
export class TransactionEventsController {
  private readonly logger = new Logger(TransactionEventsController.name);

  constructor(
    private readonly transactionService: TransactionService,
    @InjectRepository(EventConsumption)
    private readonly eventConsumptionRepository: Repository<EventConsumption>,
  ) {}

  @MessagePattern('transaction.status.updated')
  async handleStatusUpdate(
    @Payload() data: TransactionStatusUpdateEvent,
    @Ctx() context: KafkaContext,
  ): Promise<void> {
    try {
      this.logger.log('Processing transaction status update', data);

      const topic = context.getTopic();
      const partition = context.getPartition();
      const { key, offset } = context.getMessage();
      const msgKey = key ? key.toString() : '';

      // Registrar el consumo del evento
      const eventConsumption = this.eventConsumptionRepository.create({
        consumerName: topic,
        messageKey: msgKey,
        messageId: `${topic}:${partition}:${offset}`,
      });

      await this.eventConsumptionRepository.save(eventConsumption);

      // Actualizar el estado de la transacción
      await this.transactionService.updateTransactionStatus(
        parseInt(data.transactionId),
        data.newStatusId,
        data.reason,
      );

      this.logger.log(
        `Transaction ${data.transactionId} status updated from ${data.oldStatusId} to ${data.newStatusId}`,
      );
    } catch (error) {
      this.logger.error(
        'Error updating transaction status',
        (error as Error).stack || error,
      );
    }
  }

  @MessagePattern('antifraud.evaluation.approved')
  async handleAntifraudApproved(
    @Payload() data: AntifraudEvaluationResult,
    @Ctx() context: KafkaContext,
  ): Promise<void> {
    try {
      this.logger.log('Processing antifraud approved result', data);

      const topic = context.getTopic();
      const partition = context.getPartition();
      const { key, offset } = context.getMessage();
      const msgKey = key ? key.toString() : '';

      // Registrar el consumo del evento
      const eventConsumption = this.eventConsumptionRepository.create({
        consumerName: topic,
        messageKey: msgKey,
        messageId: `${topic}:${partition}:${offset}`,
      });

      await this.eventConsumptionRepository.save(eventConsumption);

      const newStatusId = 2; // Approved
      const reason = `Antifraud approved: ${data.reason} (Score: ${data.score})`;

      // Actualizar el estado de la transacción a aprobada
      await this.transactionService.updateTransactionStatus(
        parseInt(data.transactionId),
        newStatusId,
        reason,
      );

      this.logger.log(
        `Transaction ${data.transactionId} APPROVED by antifraud system`,
      );
    } catch (error) {
      this.logger.error(
        'Error processing antifraud approved result',
        (error as Error).stack || error,
      );
    }
  }

  @MessagePattern('antifraud.evaluation.rejected')
  async handleAntifraudRejected(
    @Payload() data: AntifraudEvaluationResult,
    @Ctx() context: KafkaContext,
  ): Promise<void> {
    try {
      this.logger.log('Processing antifraud rejected result', data);

      const topic = context.getTopic();
      const partition = context.getPartition();
      const { key, offset } = context.getMessage();
      const msgKey = key ? key.toString() : '';

      // Registrar el consumo del evento
      const eventConsumption = this.eventConsumptionRepository.create({
        consumerName: topic,
        messageKey: msgKey,
        messageId: `${topic}:${partition}:${offset}`,
      });

      await this.eventConsumptionRepository.save(eventConsumption);

      const newStatusId = 3; // Rejected
      const reason = `Antifraud rejected: ${data.reason} (Score: ${data.score})`;

      // Actualizar el estado de la transacción a rechazada
      await this.transactionService.updateTransactionStatus(
        parseInt(data.transactionId),
        newStatusId,
        reason,
      );

      this.logger.log(
        `Transaction ${data.transactionId} REJECTED by antifraud system`,
      );
    } catch (error) {
      this.logger.error(
        'Error processing antifraud rejected result',
        (error as Error).stack || error,
      );
    }
  }

  @MessagePattern('transaction.events.health')
  healthCheck(): { status: string; timestamp: string; service: string } {
    this.logger.log('Transaction events health check requested');
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'transaction-events-consumer',
    };
  }
}
