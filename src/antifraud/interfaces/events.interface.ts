export interface TransactionCreatedEvent {
  transactionId: string;
  transactionExternalId: string;
  accountExternalIdDebit: string;
  accountExternalIdCredit: string;
  transferTypeId: number;
  amountMinor: string;
  currency: string;
  createdAt: string;
}

export interface TransactionStatusUpdatedEvent {
  transactionId: string;
  transactionExternalId: string;
  oldStatus: string;
  newStatus: string;
  updatedAt: string;
  reason?: string;
}

export interface PayloadEvent {
  value: number;
  transactionId: string;
}
export interface OutboxEvent {
  id: number;
  aggregate_type: string;
  aggregate_id: string;
  event_type: string;
  payload: string;
  headers: Record<string, any> | null;
  occurred_at: string;
  published_at: string | null;
}

// Interfaz para el source de Debezium
export interface DebeziumSource {
  version: string;
  connector: string;
  name: string;
  ts_ms: number;
  snapshot: string;
  db: string;
  sequence: string[];
  ts_us: number;
  ts_ns: number;
  schema: string;
  table: string;
  txId: number;
  lsn: number;
  xmin: null | number;
}

// Interfaz completa para el mensaje de Debezium
export interface DebeziumMessage {
  before: OutboxEvent | null;
  after: OutboxEvent | null;
  source: DebeziumSource;
  transaction: string | null;
  op: 'c' | 'u' | 'd' | 'r'; // create, update, delete, read
  ts_ms: number;
  ts_us: number;
  ts_ns: number;
}

// Tipo específico para eventos de creación
export interface DebeziumCreateMessage extends DebeziumMessage {
  op: 'c';
  after: OutboxEvent;
  before: null;
}

// Tipo específico para eventos de actualización
export interface DebeziumUpdateMessage extends DebeziumMessage {
  op: 'u';
  after: OutboxEvent;
  before: OutboxEvent;
}

// Tipo específico para eventos de eliminación
export interface DebeziumDeleteMessage extends DebeziumMessage {
  op: 'd';
  after: null;
  before: OutboxEvent;
}
