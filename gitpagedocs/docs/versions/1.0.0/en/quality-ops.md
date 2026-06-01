---
title: "Quality & operations"
description: "Execution steps, environment configuration, testing strategy, and observability for the Casecell Checkout Service."
---

# Quality & operations

## Prerequisites

- Node.js 20+
- npm 9+
- Docker & Docker Compose (optional, yet recommended)
- Redis and PostgreSQL locally or through Docker

## Environment setup

1. Copy the sample file:
   ```bash
   cp envexample.txt .env
   ```
2. Configure the key variables:
   - `DATABASE_URL`, `TEST_DATABASE_URL`
   - `REDIS_HOST`, `REDIS_PORT`
   - `NEXT_PUBLIC_API_BASE_URL`, `INTERNAL_API_BASE_URL`
   - `ERP_SIMULATION_FAILURE_RATE`, `ERP_SIMULATION_MIN_DELAY_MS`, `ERP_SIMULATION_MAX_DELAY_MS`
   - JWT secrets and refresh/access tokens

## Local run

### Backend

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

Services:

- REST API: <http://localhost:3001/api/v1>
- Swagger PT/EN: <http://localhost:3001/docs>
- Prometheus metrics: <http://localhost:3001/metrics>

### Frontend

```bash
cd frontend
npm install
npm run dev
```

UI: <http://localhost:3000>

## Docker workflow

```bash
```

Bootstraps Postgres, Redis, backend, and frontend with a single command.

## Automated tests

| Scope | Command |
| --- | --- |
| Backend (all) | `npm test` |
| Backend unit | `npm run test:unit` |
| Backend integration | `npm run test:integration` |
| Backend e2e | `npm run test:e2e` |
| Frontend (all) | `npm test` |
| Frontend unit | `npm run test:unit` |
| Frontend integration | `npm run test:integration` |
| Frontend e2e | `npm run test:e2e` |

> Start the test PostgreSQL instance first (`docker compose up -d postgres`) and confirm `TEST_DATABASE_URL` targets `casecell_test` before running backend tests.

## Observability

- **Logs**: JSON with `requestId`, optional user, idempotency key, and duration.
- **Metrics**: checkout latency, error ratios, BullMQ queue depth.
- **Tracing**: OpenTelemetry spans cover every checkout and ERP worker step.

## Manual validation script

1. Open the storefront, review skeletons and image fallback.
2. Add products to the cart, adjust quantities up to the stock limit.
3. Run checkout multiple times to test idempotency (same key) and transient failures.
4. Track the order on `/admin` and `/orders/:id`.
5. Inspect metrics and logs to confirm traceability.

## Suggested next steps

- Automate end-to-end tests with Playwright.
- Set up a CI pipeline covering lint, tests, and Docker build.
- Add queue monitoring dashboards (Grafana/Tempo/Loki).
