import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'event_consumption' })
@Unique('event_consumption_consumer_name_message_id_key', [
  'consumerName',
  'messageId',
])
export class EventConsumption {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Column({ name: 'consumer_name', type: 'text' })
  consumerName!: string; // p.ej. 'antifraud' | 'transaction-service'

  @Column({ name: 'message_key', type: 'text' })
  messageKey!: string; // transaction_external_id o key de Kafka

  @Column({ name: 'message_id', type: 'text' })
  messageId!: string; // header/eventId

  @CreateDateColumn({ name: 'processed_at', type: 'timestamptz' })
  processedAt!: Date;
}
