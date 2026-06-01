---
title: "Back-end"
description: "Endpoints, validation rules, idempotency strategy, and ERP simulation for the Casecell Checkout Service."
---

# Back-end

## Stack

- **NestJS 10** with TypeScript, modular structure, and global validation pipes.
- **Prisma ORM** targeting PostgreSQL.
- **Redis** for caching, distributed locks, and idempotency storage.
- **BullMQ** to orchestrate ERP synchronization jobs.
- **Pino** for structured JSON logs.

## Core modules

- `ProductsModule`: catalog listing, search, and Redis caching.
- `CheckoutModule`: validation, stock reservation, and idempotency enforcement.
- `OrdersModule`: exposes `GET /orders/:id` to retrieve order status.
- `QueueModule`: configures BullMQ workers and the ERP simulator.
- `SharedModule`: cross-cutting providers (locks, transformers, interceptors).

## HTTP endpoints

### `GET /api/v1/products`

- **Query params**: `page`, `pageSize`, `search`.
- **Transformers** convert strings into safe integers with defaults.
- **Caching**: responses stored in Redis with configurable TTL.
- **Response**:
  ```json
  {
    "data": [{"id": "...", "name": "...", ...}],
    "page": 1,
    "pageSize": 10,
    "total": 42
  }
  ```

### `POST /api/v1/checkout`

- **Required headers**: `Idempotency-Key` (unique per attempt).
- **Payload**:
  ```json
  {
    "productId": "uuid",
    "quantity": 2,
    "customerEmail": "optional"
  }
  ```
- **Validation**:
  - Product must exist and be active.
  - Quantity ≥ 1 and ≤ available stock.
  - Idempotency key is mandatory.
- **Flow**:
  1. Checks if the key already has a stored response → returns immediately.
  2. Opens a Postgres transaction.
  3. Applies a Redis lock (`checkout:lock:${productId}`) for safe stock decrement.
  4. Reserves stock, creates the order (`status = PENDING`).
  5. Enqueues a BullMQ job to sync with the ERP.
  6. Returns HTTP 202 with order summary.
- **Error mapping**:
  - `400` – invalid payload (DTO + pipes).
  - `409` – insufficient stock.
  - `422` – missing idempotency key.
  - `500` – unexpected technical failure (logged with stack + requestId).

### `GET /api/v1/orders/:id`

- Returns the latest order status (`PENDING`, `PROCESSING`, `SUCCESS`, `FAILED`).
- Includes retry history and ERP error messages when available.

## Idempotency

- Stored in Redis under `checkout:idempotency:${key}`.
- Persists payload, HTTP status, and body.
- Default TTL: 24h to release memory over time.
- Shields the system from double clicks, retries, or network glitches.

## ERP simulator

- Configurable via environment variables (`ERP_SIMULATION_FAILURE_RATE`, min/max delays).
- Each job randomly produces:
  - Immediate success.
  - Transient failure → requeued with exponential backoff.
  - Definitive failure → order marked as `FAILED`.
- A circuit breaker stops consecutive calls once the failure threshold is exceeded.

## Logs & metrics

- Each request receives a `Request-Id`, propagated to logs and responses.
- `/metrics` exposes Prometheus counters (checkout latency, error ratios, queue depth).
- Logs provide enriched JSON context (route, optional user, idempotency key).
