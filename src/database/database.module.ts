import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  Transaction,
  TransferType,
  TransactionStatusHistory,
  AntifraudEvaluation,
  EventConsumption,
  Outbox,
  TransactionStatus,
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        schema: configService.get('DB_SCHEMA', 'public'),
        username: configService.get('DB_USER', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_NAME', 'transactions'),
        entities: [
          TransactionStatus,
          TransferType,
          Transaction,
          TransactionStatusHistory,
          AntifraudEvaluation,
          Outbox,
          EventConsumption,
        ],
        synchronize: false,
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      Transaction,
      TransferType,
      TransactionStatusHistory,
      AntifraudEvaluation,
      Outbox,
      EventConsumption,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
