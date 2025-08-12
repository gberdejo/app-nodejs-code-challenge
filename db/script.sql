CREATE TABLE transaction_status (
    id   SMALLINT NOT NULL
        CONSTRAINT "PK_05fbbdf6bc1db819f47975c8c0b"
            PRIMARY KEY,
    name TEXT NOT NULL
        CONSTRAINT "UQ_bdc1017b79532763afb7872a626"
            UNIQUE
);

ALTER TABLE transaction_status OWNER TO postgres;

INSERT INTO transaction_status (id, name) VALUES 
    (1, 'Pending'), 
    (2, 'Approved'), 
    (3, 'Rejected') 
ON CONFLICT (id) DO NOTHING;

CREATE TABLE transfer_types (
    id   SMALLINT NOT NULL
        CONSTRAINT "PK_72d9123b523b471cd9ea1286cf6"
            PRIMARY KEY,
    name TEXT NOT NULL
        CONSTRAINT "UQ_628ab9b67f4ed1cae3135c4d467"
            UNIQUE
);

ALTER TABLE transfer_types OWNER TO postgres;
    
INSERT INTO transfer_types (id, name) VALUES 
    (1, 'Transfer'), 
    (2, 'Payment'), 
    (3, 'Deposit') 
ON CONFLICT (id) DO NOTHING;

CREATE TABLE transactions (
    id                         BIGSERIAL
        CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9"
            PRIMARY KEY,
    transaction_external_id    UUID DEFAULT gen_random_uuid() NOT NULL
        CONSTRAINT "UQ_4b34e695642d9991e8c82daac5c"
            UNIQUE,
    account_external_id_debit  UUID NOT NULL,
    account_external_id_credit UUID NOT NULL,
    transfer_type_id           SMALLINT NOT NULL
        CONSTRAINT "FK_303b5efab792f9ecaf5d18c0f72"
            REFERENCES transfer_types
            ON UPDATE CASCADE ON DELETE RESTRICT,
    status_id                  SMALLINT DEFAULT '1'::SMALLINT NOT NULL
        CONSTRAINT "FK_819b9b741319d533ea9e5617eb0"
            REFERENCES transaction_status,
    value                      BIGINT NOT NULL,
    currency                   CHAR(3) DEFAULT 'PEN'::BPCHAR NOT NULL,
    created_at                 TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at                 TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE transactions OWNER TO postgres;

CREATE TABLE antifraud_evaluations (
    id             BIGSERIAL
        CONSTRAINT "PK_515d40eb6885e34ce592546c56b"
            PRIMARY KEY,
    transaction_id BIGINT NOT NULL
        CONSTRAINT "FK_e0fbf2788b46a812680bca8b184"
            REFERENCES transactions
            ON UPDATE CASCADE,
    decision       SMALLINT NOT NULL,
    rule_applied   TEXT NOT NULL,
    evaluated_at   TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    details        JSONB
);

ALTER TABLE antifraud_evaluations OWNER TO postgres;

CREATE INDEX idx_txn_status_pending ON transactions (status_id);

CREATE INDEX idx_txn_created_at ON transactions (created_at);

CREATE INDEX idx_txn_external_id ON transactions (transaction_external_id);

CREATE TABLE transaction_status_history (
    id             BIGSERIAL
        CONSTRAINT "PK_a8a930459f2d5775c5cd9c27d0d"
            PRIMARY KEY,
    transaction_id BIGINT NOT NULL,
    old_status_id  SMALLINT,
    new_status_id  SMALLINT NOT NULL,
    reason         TEXT,
    metadata       JSONB,
    changed_at     TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE transaction_status_history OWNER TO postgres;

CREATE INDEX idx_txn_hist_txn_id_time ON transaction_status_history (transaction_id, changed_at);

CREATE TABLE outbox (
    id             BIGSERIAL
        CONSTRAINT "PK_340ab539f309f03bdaa14aa7649"
            PRIMARY KEY,
    aggregate_type TEXT NOT NULL,
    aggregate_id   UUID NOT NULL,
    event_type     TEXT NOT NULL,
    payload        JSONB NOT NULL,
    headers        JSONB,
    occurred_at    TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    published_at   TIMESTAMP WITH TIME ZONE,
    UNIQUE (aggregate_type, id)
);

ALTER TABLE outbox OWNER TO postgres;

CREATE INDEX idx_outbox_unpublished ON outbox (published_at)
    WHERE (published_at IS NULL);

CREATE TABLE event_consumption (
    id            BIGSERIAL
        CONSTRAINT "PK_f07ca31be5e3742fb0b03f46ca6"
            PRIMARY KEY,
    consumer_name TEXT NOT NULL,
    message_key   TEXT NOT NULL,
    message_id    TEXT NOT NULL,
    processed_at  TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE (consumer_name, message_id)
);

ALTER TABLE event_consumption OWNER TO postgres;
