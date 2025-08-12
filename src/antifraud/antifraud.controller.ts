import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, Ctx } from '@nestjs/microservices';
import { KafkaContext } from '@nestjs/microservices';
import { AntifraudService } from './antifraud.service';
import type {
  DebeziumCreateMessage,
  PayloadEvent,
} from './interfaces/events.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { EventConsumption } from 'src/database/entities';
import { Repository } from 'typeorm';

@Controller()
export class AntifraudController {
  private readonly logger = new Logger(AntifraudController.name);

  constructor(
    private readonly antifraudService: AntifraudService,
    @InjectRepository(EventConsumption)
    private readonly eventConsumptionRepository: Repository<EventConsumption>,
  ) {}

  @MessagePattern('pg.public.outbox')
  async handleTransactionCreated(
    @Payload() data: DebeziumCreateMessage,
    @Ctx() context: KafkaContext,
  ): Promise<void> {
    try {
      this.logger.log('Processing transaction.created event', data);
      const topic = context.getTopic();
      const partition = context.getPartition();
      const { key, offset } = context.getMessage();

      const msgKey = key ? key.toString() : '';

      const dataQueue = this.eventConsumptionRepository.create({
        consumerName: context.getTopic(),
        messageKey: msgKey,
        messageId: `${topic}:${partition}:${offset}`,
      });

      await this.eventConsumptionRepository.save(dataQueue);

      const payload = JSON.parse(data.after.payload) as PayloadEvent;

      await this.antifraudService.evaluateTransaction(payload);

      this.logger.log(
        `Successfully processed transaction.created for: ${payload.transactionId}`,
      );
    } catch (error) {
      this.logger.error(
        'Error handling transaction.created event',
        (error as Error).stack || error,
      );
    }
  }

  // Health check endpoint para el consumer
  @MessagePattern('antifraud.health')
  healthCheck(): { status: string; timestamp: string } {
    this.logger.log('Health check requested');
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
