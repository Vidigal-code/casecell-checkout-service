---
title: "Back-end"
description: "Authentication, catalog, checkout, admin, and operational internals of the Casecell Checkout Service."
---

# Back-end

## Stack

- NestJS 10 (TypeScript) with modular DDD/Clean layering and global validation pipes.
- Prisma ORM backed by PostgreSQL for users, products, orders, idempotency, and audit trails.
- Redis 7 for caching, distributed locks, idempotency payloads, and BullMQ state.
- BullMQ workers to orchestrate ERP synchronisation and retries.
- Pino + OpenTelemetry + prom-client for structured logs, traces, and metrics.
- Swagger UI with bilingual copy (`/docs`) generated directly from DTO metadata.

## Modules & responsibilities

- `AuthModule`: registration, login, refresh, logout, password policy, and refresh-token rotation.
- `ProductsModule`: public catalog (`/products`) and administrative catalog management under `/admin/products`.
- `CheckoutModule`: payload validation, stock reservation, idempotency enforcement, and job dispatching.
- `OrdersModule`: customer order tracking (`/orders/:id`) and administrative pagination (`/admin/orders`).
- `QueueModule`: BullMQ queue/worker, ERP simulator configuration, and circuit breaker management.
- `SharedModule`: Redis locks, rate limiting, telemetry, exception filters, and internationalised Swagger helpers.

## HTTP endpoints

### Authentication (`/api/v1/auth`)

- `POST /register` accepts `email` and strong `password`, hashing credentials and returning access/refresh tokens plus the assigned role.
- `POST /login` authenticates existing users and rotates refresh tokens stored in PostgreSQL.
- `POST /refresh` issues a new access token and refresh token family, invalidating the previous refresh token.
- `POST /logout` revokes the active refresh token and clears persisted fingerprints.
- Responses include expiration metadata so the frontend can schedule silent refreshes.

### Catalog (`/api/v1/products`)

- Query parameters: `page`, `pageSize`, `search`. Custom transformers coerce values to safe integers with defaults.
- Results are cached in Redis with TTL configured by `PRODUCTS_CACHE_TTL_SECONDS`, invalidated on catalog mutations.
- Each entry surfaces stock, price (in cents), SKU, activity flag, and optional image URL used by the storefront.

### Checkout (`/api/v1/checkout`)

- Requires `Authorization: Bearer <token>` with the `CUSTOMER` role and an `Idempotency-Key` header.
- Body fields: `productId` (UUID) and `quantity` (min 1, capped by current stock).
- Execution flow: resolve cached idempotent responses → open Postgres transaction → acquire `checkout:lock:${productId}` in Redis → reserve stock and persist order → enqueue BullMQ job → return `201 Created` with order summary.
- Duplicate keys respond with `200 OK` and the previously stored payload. Errors map to `400` (missing header), `409` (stock), `422` (validation), `429` (rate limited), or `503` (ERP unavailable).

### Order tracking (`/api/v1/orders/:id`)

- Accessible to the owning `CUSTOMER` or any `ADMIN` through RBAC guards.
- Returns the order status (`PENDING`, `PROCESSING`, `SUCCESS`, `FAILED`), ERP retry attempts, and last failure reason when available.

### Admin catalog (`/api/v1/admin/products`)

- Guarded by JWT + roles; only `ADMIN` users can reach these routes.
- `GET` paginates products with optional `search`, `page`, and `pageSize` filters for the dashboard.
- `POST` creates products with `name`, `description`, `sku`, `priceCents`, `stock`, optional `imageUrl`, and `isActive` flag.
- `GET /:id` retrieves complete product details, `PATCH /:id` updates partial fields, and `DELETE /:id` soft-deactivates the product (sets `isActive=false`).
- Every mutation clears the Redis catalog cache to keep `/products` consistent.

### Admin orders (`/api/v1/admin/orders`)

- Provides paginated visibility over the checkout backlog for operators.
- Supports filtering by `status`, `customerId`, `page`, and `pageSize` (1–50) using DTO transformers.
- Outputs order metadata, ERP state, timestamps, and retry counters used by the admin dashboard.

### Platform endpoints

- `GET /api/v1/health` probes PostgreSQL and Redis in parallel, returning `status: "ok"` or `"degraded"` with per-component checks.
- `GET /api/v1/metrics` exposes Prometheus metrics (checkout latency distribution, success/error ratios, queue depth, circuit breaker state).
- `GET /docs` serves PT/EN Swagger with language toggle, synchronized with decorators and shared i18n helpers.

## Idempotency & concurrency

- Redis stores responses under `checkout:idempotency:${key}` with TTL controlled by `IDEMPOTENCY_TTL_SECONDS` (default 600 seconds).
- Product-scoped locks (`checkout:lock:${productId}`) rely on `SET NX` to serialize competing decrements.
- Postgres transactions guarantee that stock reservations, order creation, and idempotency persistence either complete together or roll back.

## ERP simulator & queues

- Orders are pushed to the `erp-sync` BullMQ queue immediately after reservation.
- The simulator uses env-driven probabilities (`ERP_SIMULATION_FAILURE_RATE`) and delays (`ERP_SIMULATION_MIN_DELAY_MS`/`MAX_DELAY_MS`) to mimic instability.
- Consecutive failures trigger a circuit breaker (`CIRCUIT_BREAKER_FAILURE_THRESHOLD`, `CIRCUIT_BREAKER_RESET_TIMEOUT_MS`) pausing downstream calls until the cooldown expires.
- Successful jobs mark orders as `SUCCESS`; permanent failures mark them as `FAILED` with detailed context for dashboards.

## Security & observability

- Helmet, CORS, and Nest Throttler provide secure headers, origin controls, and request rate limiting.
- JWT secrets, Redis/Postgres hosts, rate-limit thresholds, and CORS policies are centralised in the root `.env` shared across services.
- Pino logger enriches every request with `requestId`, authenticated user, idempotency key, and latency before shipping JSON logs.
- OpenTelemetry instrumentation wraps checkout handlers and queue workers, exporting spans for distributed tracing.
- Prometheus metrics and the health endpoint back Docker health checks and CI smoke tests.

## Persistence & tooling

- Prisma migrations (`npm run prisma:migrate`) evolve the schema; seeds populate sample products and users for local runs.
- Helper scripts (`prisma:deploy`, `prisma:push`, `prisma:seed`) execute automatically inside `docker compose` flows and can be run manually during development.
