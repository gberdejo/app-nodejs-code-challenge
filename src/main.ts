import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Microservicio Kafka para consumir eventos Outbox (Debezium)
  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: process.env.KAFKA_CLIENT_ID ?? 'transaction-service',
        brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
      },
      consumer: {
        // 👇 Este es TU groupId (todas las réplicas del mismo servicio comparten este valor)
        groupId: process.env.KAFKA_GROUP_ID ?? 'transaction-group',
      },
      // Opcional:
      // subscribe: { fromBeginning: false },
      // run: { autoCommit: true },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
