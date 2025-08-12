<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# 🏦 Sistema de Evaluación Antifraud

Un sistema distribuido de procesamiento de transacciones con evaluación antifraud en tiempo real, construido con **NestJS**, **GraphQL**, **Kafka** y **PostgreSQL**.

## 📋 Descripción del Proyecto

Este proyecto implementa un sistema de transacciones financieras con las siguientes características principales:

- **API GraphQL** para gestión de transacciones
- **Evaluación antifraud** automática en tiempo real
- **Arquitectura basada en eventos** con Apache Kafka
- **Patrón Outbox** para garantizar consistencia de datos
- **Débezium CDC** para captura de cambios de datos
- **Auditoría completa** con historial de estados

## 🚀 Tecnologías Utilizadas

### **Backend**
- **NestJS** - Framework Node.js para APIs escalables
- **TypeScript** - Lenguaje de programación tipado
- **GraphQL** - API query language y runtime

### **Base de Datos**
- **PostgreSQL** - Base de datos relacional principal
- **TypeORM** - ORM para TypeScript y JavaScript

### **Arquitectura de Eventos**
- **Apache Kafka** - Plataforma de streaming de eventos
- **Débezium** - Plataforma de captura de cambios de datos (CDC)
- **Kafka Connect** - Framework para conectores

### **Monitoreo y Auditoría**
- **Winston** - Logger para Node.js
- **Event Sourcing** - Patrón para auditoría de eventos

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   GraphQL API   │    │  Transaction     │    │   PostgreSQL    │
│                 │────│  Service         │────│   Database      │
│ - Mutations     │    │                  │    │                 │
│ - Queries       │    │ - Create TX      │    │ - Transactions  │
└─────────────────┘    │ - Update Status  │    │ - Evaluations   │
                       └──────────────────┘    │ - Outbox        │
                                │              └─────────────────┘
                                │                        │
                       ┌──────────────────┐              │
                       │  Outbox Event    │              │
                       │  Publisher       │◄─────────────┘
                       └──────────────────┘
                                │
                                ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │  Apache Kafka    │    │  Antifraud      │
                       │                  │────│  Service        │
                       │ - tx.created     │    │                 │
                       │ - evaluation.*   │    │ - Rules Engine  │
                       └──────────────────┘    │ - Risk Scoring  │
                                │              └─────────────────┘
                                │
                       ┌──────────────────┐
                       │ Transaction      │
                       │ Events Consumer  │
                       │                  │
                       │ - Status Updates │
                       └──────────────────┘
```

## 🛠️ Configuración del Proyecto

### Prerrequisitos
- Node.js 20
- Docker 

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd app-nodejs-code-challenge

# Instalar dependencias
npm install
```

### Variables de Entorno

Crear archivo `.env`:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=transactions

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_GROUP_ID=transaction-service

# Application
PORT=3000
```

## ▶️ Ejecución del Proyecto

### Docker (Opcional)

```bash
# Levantar servicios con Docker Compose
docker-compose up -d
```

### Desarrollo

```bash
# Modo desarrollo con hot reload
npm run start:dev

# Modo desarrollo estándar
npm run start

# Modo producción
npm run start:prod
```

## 🧪 Pruebas con GraphQL

### Acceder al GraphQL Playground
Navega a: **http://localhost:3000/graphql**

### 1. Crear Transacción

```graphql
mutation CreateTransaction {
  createTransaction(input: {
    accountExternalIdDebit: "550e8400-e29b-41d4-a716-446655440001",
    accountExternalIdCredit: "550e8400-e29b-41d4-a716-446655440002",
    tranferTypeId: 1,
    value: 1200
  }) {
    id
    transactionExternalId
    accountExternalIdDebit
    accountExternalIdCredit
    value
    currency
    createdAt
    status {
      id
      name
    }
  }
}
```

### 2. Consultar Transacción Específica

```graphql
query GetTransaction {
  transaction(transactionExternalId: "b958b855-d3df-4d6e-8fa1-4883239ae86c") {
    id
    transactionExternalId
    accountExternalIdDebit
    accountExternalIdCredit
    value
    currency
    createdAt
    updatedAt
    status {
      id
      name
    }
    transferType {
      id
      name
    }
  }
}
```

### 3. Listar Todas las Transacciones

```graphql
query GetAllTransactions {
  transactions {
    id
    transactionExternalId
    accountExternalIdDebit
    accountExternalIdCredit
    value
    currency
    createdAt
    updatedAt
    status {
      id
      name
    }
    transferType {
      id
      name
    }
  }
}
```

### 4. Ejemplos de Transacciones para Pruebas

#### Transacción que será **RECHAZADA** (monto alto):
```graphql
mutation CreateHighValueTransaction {
  createTransaction(input: {
    accountExternalIdDebit: "11111111-1111-1111-1111-111111111111",
    accountExternalIdCredit: "22222222-2222-2222-2222-222222222222",
    tranferTypeId: 1,
    value: 5000  # > 1000, será rechazada
  }) {
    transactionExternalId
    value
    status { name }
  }
}
```

#### Transacción que será **APROBADA** (monto normal):
```graphql
mutation CreateNormalTransaction {
  createTransaction(input: {
    accountExternalIdDebit: "33333333-3333-3333-3333-333333333333",
    accountExternalIdCredit: "44444444-4444-4444-4444-444444444444",
    tranferTypeId: 2,
    value: 250   # < 1000, será aprobada
  }) {
    transactionExternalId
    value
    status { name }
  }
}
```

## 📊 Flujo de Procesamiento

1. **Creación**: Se crea una transacción vía GraphQL API
2. **Persistencia**: La transacción se guarda con estado "Pending"
3. **Evento Outbox**: Se genera un evento en la tabla `outbox`
4. **Débezium CDC**: Captura el cambio y publica a Kafka
5. **Evaluación Antifraud**: El servicio antifraud procesa la transacción
6. **Decisión**: Se aplican reglas y se toma una decisión
7. **Actualización**: El estado se actualiza a "Approved" o "Rejected"
8. **Auditoría**: Se mantiene historial completo de cambios

## 🔍 Reglas Antifraud Implementadas

- **Alto Valor**: Transacciones > $1000 son rechazadas
- **Validación de Cuentas**: Formato UUID válido requerido

---

*Construido con ❤️ usando NestJS y las mejores prácticas de arquitectura distribuida*
