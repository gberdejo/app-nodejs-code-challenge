import { Entity, PrimaryGeneratedColumn, Column, Index, Unique } from 'typeorm';

@Entity({ name: 'outbox' })
// Mantengo el UNIQUE solicitado originalmente
@Unique('outbox_aggregate_type_id_key', ['aggregateType', 'id'])
@Index('idx_outbox_unpublished', ['publishedAt'], {
  where: '"published_at" IS NULL',
})
export class Outbox {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'aggregate_type', type: 'text' })
  aggregateType!: string; // e.g. 'transaction'

  @Column({ name: 'aggregate_id', type: 'uuid' })
  aggregateId!: string; // transaction_external_id o id interno

  @Column({ name: 'event_type', type: 'text' })
  eventType!: string; // 'transaction.created' | 'transaction.status.updated'

  @Column({ type: 'jsonb' })
  payload!: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  headers!: Record<string, unknown> | null;

  @Column({ name: 'occurred_at', type: 'timestamptz', default: () => 'now()' })
  occurredAt!: Date;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;
}
