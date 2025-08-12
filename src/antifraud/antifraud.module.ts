import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AntifraudService } from './antifraud.service';
import { AntifraudController } from './antifraud.controller';
import { AntifraudEvaluation, EventConsumption } from '../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([AntifraudEvaluation, EventConsumption])],
  controllers: [AntifraudController],
  providers: [AntifraudService],
  exports: [AntifraudService],
})
export class AntifraudModule {}
