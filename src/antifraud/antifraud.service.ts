import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventConsumption } from '../database/entities';
import { PayloadEvent } from './interfaces/events.interface';

@Injectable()
export class AntifraudService {
  private readonly logger = new Logger(AntifraudService.name);

  constructor(
    @InjectRepository(EventConsumption)
    private readonly eventConsumptionRepository: Repository<EventConsumption>,
  ) {}

  evaluateTransaction(transaction: PayloadEvent) {
    const operator = '>';
    const valueThreshold = 1000;

    if (transaction.value > valueThreshold) {
      this.logger.warn(
        `High value transaction detected: ${transaction.transactionId} with value ${transaction.value}`,
      );
      return;
    }

    this.logger.log(
      `Evaluating transaction: ${transaction.transactionId} with value ${transaction.value}`,
    );
  }
}
