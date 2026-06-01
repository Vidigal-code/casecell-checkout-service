---
title: "Architecture & design"
description: "Components, flows, and decisions behind the Casecell Checkout Service."
---

# Architecture & design

## High-level view

```
Web client → Next.js 15 (React Query + Redux) → NestJS API → PostgreSQL / Redis → ERP simulator (BullMQ)
```

### Main layers

- **Frontend (Next.js 15 / Feature-Sliced Design)**
  - Scene-driven pages (`scenes/`), reusable widgets/features.
  - React Query for caching, manual suspense, and loading indicators.
  - Redux Toolkit to persist the cart and user preferences.
  - Tailwind CSS + Framer Motion for responsive UI with subtle motion.

- **Backend (NestJS 10)**
  - DDD / Clean Architecture folders (`domain`, `application`, `infrastructure`, `presentation`).
  - HTTP controllers under `/api/v1`, validated with `class-validator` and `class-transformer`.
  - Prisma ORM (PostgreSQL) for products, orders, and idempotency records.
  - Redis handles locks, catalog cache, idempotency storage, and BullMQ queues.

- **Queue & ERP simulator**
  - BullMQ processes asynchronous ERP sync jobs.
  - A configurable simulator produces latency and transient failures to exercise resilience.
  - A circuit breaker protects the system when the ERP remains unstable.

## Critical flows

1. **Catalog**
   - `GET /products` reads from Postgres with pagination, search, and Redis caching.
   - Query DTOs convert parameters (`page`, `pageSize`) safely to numeric types.

2. **Checkout**
   - `POST /checkout` validates payload (product, quantity, idempotency header, optional customer).
   - A Postgres transaction reserves stock, creates the order, and enqueues a job.
   - Redis locks (`SET NX`) shield stock decrement under concurrency.
   - Idempotency replays the previous response for the same `Idempotency-Key`.

3. **ERP sync**
   - BullMQ worker consumes pending orders.
  - The simulator returns success, transient failure, or fatal error.
  - Retries with backoff update order status (`PENDING`, `PROCESSING`, `SUCCESS`, `FAILED`).

## Security & governance

- Single root `.env` shared by backend and frontend.
- Helmet + throttling guard the API.
- CORS configurable via environment variables (allowed origins, headers, methods).
- Structured logs (Pino) with per-request correlation IDs.

## Observability

- **/metrics** exposes Prometheus metrics (latency, success/error ratios, queue health).
- **OpenTelemetry** spans wrap checkout and ERP worker operations.
- **Logs** output enriched JSON, ready for ELK/Loki pipelines.

## Planned evolution

- CDC/streaming from the ERP to keep stock mirrored in near real time.
- Rate limiting per user/customer account.
- Dedicated operator dashboard to monitor conversion and SLA KPIs.
