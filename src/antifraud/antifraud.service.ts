import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AntifraudEvaluation } from '../database/entities';
import { PayloadEvent } from './interfaces/events.interface';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AntifraudService {
  private readonly logger = new Logger(AntifraudService.name);

  constructor(
    @InjectRepository(AntifraudEvaluation)
    private readonly antifraudEvaluationRepository: Repository<AntifraudEvaluation>,
    @Inject('KAFKA_SERVICE')
    private readonly transactionClient: ClientKafka,
  ) {}

  async evaluateTransaction(transaction: PayloadEvent) {
    const valueThreshold = 1000;

    const result = transaction.value > valueThreshold;

    this.logger.log(
      `Antifraud evaluation for transaction ${transaction.transactionId}: ${
        result ? 'Approved' : 'Rejected'
      }`,
    );

    const antifraudEvaluation = this.antifraudEvaluationRepository.create({
      transactionId: Number(transaction.transactionId),
      decision: result ? 0 : 1, // 1 = Approved, 0 = Rejected
      ruleApplied: 'Value threshold check',
    });

    const savedEvaluation =
      await this.antifraudEvaluationRepository.save(antifraudEvaluation);

    const topic = result
      ? 'antifraud.evaluation.rejected'
      : 'antifraud.evaluation.approved';

    this.transactionClient
      .emit(topic, JSON.stringify(savedEvaluation))
      .subscribe({
        next: (value) => {
          this.logger.log(
            `${AntifraudService.name}.evaluateTransaction.success`,
            value,
          );
        },
        error: (err) =>
          this.logger.error(
            `${AntifraudService.name}.evaluateTransaction.error`,
            err,
          ),
      });
  }
}
