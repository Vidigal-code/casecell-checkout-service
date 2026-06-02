---
title: "Quality & operations"
description: "Environment setup, run books, testing matrix, and observability hooks for the Casecell Checkout Service."
---

# Quality & operations

## Prerequisites

- Node.js 20+
- npm 9+
- Docker Desktop (for single-command orchestration of Postgres, Redis, backend, and frontend)

## Environment setup

1. Copy the root sample file and adjust credentials as needed:
   ```bash
   cp envexample.txt .env
   ```
2. Review the following keys before running locally or in Docker:
   - `DATABASE_URL`, `TEST_DATABASE_URL`, `POSTGRES_*`
   - `REDIS_HOST`, `REDIS_PORT`
   - `JWT_ACCESS_TOKEN_SECRET`, `JWT_REFRESH_TOKEN_SECRET`, expirations
   - `ERP_SIMULATION_FAILURE_RATE`, `ERP_SIMULATION_MIN_DELAY_MS`, `ERP_SIMULATION_MAX_DELAY_MS`
   - `IDEMPOTENCY_TTL_SECONDS`, `PRODUCTS_CACHE_TTL_SECONDS`, rate-limit thresholds
   - `NEXT_PUBLIC_API_BASE_URL`, `INTERNAL_API_BASE_URL`, `NEXT_PUBLIC_DEFAULT_THEME`

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

Services exposed during development:

- REST API & auth: <http://localhost:3001/api/v1>
- Swagger (PT/EN toggle): <http://localhost:3001/docs>
- Prometheus metrics: <http://localhost:3001/metrics>
- Health check: <http://localhost:3001/api/v1/health>

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Storefront & admin UI: <http://localhost:3000>

## Docker workflow

```bash
docker compose up --build
```

- Spins up Postgres, Redis, backend, and frontend with the shared `.env`.
- Backend container runs `prisma migrate deploy`, `prisma db push`, and `prisma db seed` automatically.
- To execute the test profiles inside containers:
  ```bash
  docker compose --profile test up --build backend-tests frontend-tests
  ```

## Automated tests

| Scope | Command |
| --- | --- |
| Backend full suite | `npm test` |
| Backend unit | `npm run test:unit` |
| Backend integration | `npm run test:integration` |
| Backend e2e | `npm run test:e2e` |
| Frontend full suite | `npm test` |
| Frontend unit | `npm run test:unit` |
| Frontend integration | `npm run test:integration` |
| Frontend e2e | `npm run test:e2e` |

> Before running backend tests locally, ensure Postgres is available (`docker compose up -d postgres`) and `TEST_DATABASE_URL` points to the `casecell_test` database.

## Observability & operations

- **Logs**: Pino outputs structured JSON enriched with `requestId`, user, idempotency key, and elapsed time; file logging is toggled via `LOG_FILE_*` envs.
- **Metrics**: `/api/v1/metrics` exports Prometheus counters/histograms for checkout latency, queue depth, circuit breaker, and error ratios.
- **Health**: `/api/v1/health` differentiates overall status (`ok`/`degraded`) while exposing Redis/Postgres checks used by Docker health probes.
- **Tracing**: OpenTelemetry instrumentation emits spans for checkout handlers and ERP workers, ready to plug into OTLP collectors.
- **Swagger**: `/docs` mirrors all DTOs and headers with bilingual descriptions; keep it updated by running `npm run build` after contract changes.

## Manual smoke checklist

1. Load the storefront, confirm hero animations, skeletons, and product search responsiveness.
2. Add items to the cart, tweak quantities beyond limits to validate error messaging, and observe persisted state on reload.
3. Authenticate with the seeded customer, trigger checkout twice with the same idempotency key, and verify duplicate handling.
4. Flip to the admin dashboard, filter orders by status, deactivate/reactivate a product, and confirm catalog reflects the change.
5. Inspect `/api/v1/metrics` and application logs to ensure the ERP simulator activity is observable.

## Suggested next steps

- Automate end-to-end regression flows with Playwright or Cypress.
- Wire a CI pipeline (GitHub Actions) running lint, tests, and Docker image build on pull requests.
- Add Grafana dashboards on top of Prometheus metrics and wire alerts for circuit-breaker and queue saturation.
