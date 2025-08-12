import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AntifraudService } from './antifraud.service';
import { AntifraudController } from './antifraud.controller';
import {
  AntifraudEvaluation,
  EventConsumption,
  Transaction,
} from '../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AntifraudEvaluation,
      EventConsumption,
      Transaction,
    ]),
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'antifraud-producer',
            brokers: ['localhost:9092'],
          },
          producer: {
            allowAutoTopicCreation: true,
          },
        },
      },
    ]),
  ],
  controllers: [AntifraudController],
  providers: [AntifraudService],
  exports: [AntifraudService],
})
export class AntifraudModule {}
