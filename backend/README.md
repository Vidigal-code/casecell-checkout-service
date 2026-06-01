# CaseCellShop Checkout API

API NestJS responsável por catálogo, checkout resiliente e sincronia assíncrona com o ERP fictício.

## 📋 Contexto do Desafio / Challenge Context

- **Objetivo | Goal:** atender ao Desafio Técnico CaseCellShop implementando API própria para vitrine e checkout, desacoplando o ERP.
- **Escopo | Scope:** expor produtos, registrar pedidos com idempotência, simular latência/falha do ERP e prover observabilidade.
- **Swagger:** <http://localhost:3001/docs/pt> | <http://localhost:3001/docs/en>

## 🇧🇷 Descrição em Português

<details>
<summary><strong>Ver Detalhes</strong></summary>

### Visão Geral
- NestJS 10 com arquitetura em camadas (`presentation`, `application`, `domain`, `infrastructure`).
- PostgreSQL via Prisma para dados transacionais e Redis para cache, locks e idempotência.
- Fila BullMQ com worker dedicado para sincronizar pedidos no ERP simulado.
- Observabilidade com Pino estruturado, métricas Prometheus e spans OpenTelemetry.

### Arquitetura Atual
- `ProductsModule`: leitura de catálogo com cache Redis e paginação.
- `CheckoutModule`: casos de uso com reservas, locks, idempotência e enfileiramento BullMQ.
  - Operações de checkout executam transação ACID: falhas realizam rollback automático de estoque e pedido.
- `OrdersModule`: consulta de status por clientes.
- `AdminOrdersModule`: listagem administrativa com filtros.
- `AdminProductsModule`: CRUD completo de produtos com RBAC e validação forte.
- `AuthModule`: registro/login/refresh com reforço de senha forte (admin e customer).
- `HealthModule` / `MetricsModule`: monitoramento (Prometheus, health check).
- `ErpSyncQueueModule`: worker BullMQ que processa o `ERP Simulator` com circuit breaker.

### Problemas Endereçados
| Desafio original | Como a API resolve |
|------------------|--------------------|
| Performance da vitrine | Endpoint `GET /products` desacoplado do ERP, com paginação e cache Redis; a API entrega resultados em milissegundos e reduz carga no legado. |
| Consistência de estoque | Checkout executa reservas transacionais via Prisma, utiliza locks Redis e idempotência para garantir que nenhum item seja vendido em duplicidade. |
| Resiliência do checkout | O pedido é confirmado imediatamente enquanto o ERP é sincronizado via BullMQ com circuit breaker; eventuais falhas ficam visíveis no status do pedido. |

### Objetivo de Evolução
- A camada de aplicação desacopla o ERP, permitindo evoluir para replicação de dados, filas adicionais e observabilidade distribuída sem reescrever o legado.

### Pré-requisitos
- Node.js 20+
- npm 9+
- PostgreSQL 16 (local ou via Docker Compose)
- Redis 7

### Configuração de Ambiente
1. Garanta o `.env` na raiz do monorepo (`cp ../envexample.txt ../.env` ou `cp ../.env.example ../.env`). Esse mesmo arquivo é compartilhado com o frontend e replicado para os containers via Docker Compose.
2. (Opcional) Use um `.env` local nesta pasta para sobrepor valores específicos.
3. Principais variáveis:
   - `DATABASE_URL`: string de conexão PostgreSQL.
   - `REDIS_HOST` / `REDIS_PORT`: instância Redis utilizada para cache, locks e idempotência.
   - `JWT_*`: segredos e expirações dos tokens.
   - `ERP_SIMULATION_*`: controla latência e taxa de falha do ERP fake.
   - `RATE_LIMIT_*`, `IDEMPOTENCY_TTL_SECONDS`, `PRODUCTS_CACHE_TTL_SECONDS`: políticas de proteção/retention.
   - `CORS_ALLOWED_ORIGINS`, `CORS_ALLOWED_HEADERS`, `CORS_EXPOSED_HEADERS`, `SECURITY_HSTS_*`, `SECURITY_REFERRER_POLICY`: endurecimento de CORS e cabeçalhos HTTP.
4. O serviço Postgres do `docker compose` cria os bancos `casecell` (produção/dev) e `casecell_test` (testes) via `docker/postgres/init-test-db.sql`. Antes de rodar a suíte automatizada, execute `docker compose up -d postgres` na raiz do repositório para garantir que `TEST_DATABASE_URL` esteja acessível.

### Execução (Desenvolvimento)
```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```
- API REST: <http://localhost:3001/api/v1>
- Swagger: <http://localhost:3001/docs>
- Healthcheck: <http://localhost:3001/health>
- Métricas Prometheus: <http://localhost:3001/metrics>

### Scripts Úteis
- `npm run build`: compila para produção (`dist`).
- `npm run start`: inicia build compilado.
- `npm run test`: executa toda a suíte (unit, integration, e2e).
- `npm run test:unit`, `npm run test:integration`, `npm run test:e2e`: escopos específicos.
- `npm run lint`: linting com ESLint.

### Estratégia de Testes
- Unit: entidades, casos de uso e portas com `ts-jest`.
- Integração: executadas contra PostgreSQL real apontado por `TEST_DATABASE_URL`, com limpeza transacional por teste.
- E2E: `Supertest` cobre rotas HTTP com seed controlado e dependência do banco real.

### Estrutura de Pastas
- `src/presentation`: controllers, guards, interceptors, modules.
- `src/application`: casos de uso, DTOs, contratos.
- `src/domain`: entidades e regras puras.
- `src/infrastructure`: Prisma, Redis, BullMQ, circuit breaker, ERP simulator, logger.
- `src/config`: carregamento/validação de env com Joi.
- `tests`: suites unitárias, integração, e utilidades (ex.: banco em memória).

### Observabilidade & Resiliência
- Logs estruturados (`nestjs-pino` + `rotating-file-stream`).
- Métricas HTTP/worker em `/metrics`.
- Guard global (`RateLimitGuard`) diferencia usuário autenticado de IP.
- CORS restrito configurável via `CORS_ALLOWED_ORIGINS` com cabeçalhos de segurança (`helmet`, HSTS em produção, Referrer-Policy, exposição controlada de `X-RateLimit-*`).
- Circuit breaker distribuído protege chamadas ao ERP.
- Respostas de checkout categorizam validação, estoque insuficiente, duplicidade e falha técnica.

</details>

## 🇺🇸 English Description

<details>
<summary><strong>View Details</strong></summary>

### Overview
- NestJS 10 layered architecture (presentation, application, domain, infrastructure).
- Prisma + PostgreSQL for transactional data, Redis for cache/locks/idempotency.
- BullMQ queue with dedicated worker to sync orders into the simulated ERP.
- Observability through structured Pino logs, Prometheus metrics, and OpenTelemetry spans.

### Current Architecture
- `ProductsModule`: catalog reads with Redis cache and pagination.
- `CheckoutModule`: use cases handling reservations, locks, idempotency, and BullMQ scheduling.
  - Checkout runs inside an ACID transaction so stock and order data roll back automatically on failure.
- `OrdersModule`: status lookup for customers.
- `AdminOrdersModule`: administrative order listing with filter support.
- `AdminProductsModule`: full product CRUD with RBAC and strong validation.
- `AuthModule`: registration/login/refresh flows enforcing strong passwords for admin/customer roles.
- `HealthModule` / `MetricsModule`: monitoring endpoints (Prometheus, health check).
- `ErpSyncQueueModule`: BullMQ worker that coordinates the `ERP Simulator` behind a circuit breaker.

### Addressed Problems
| Original challenge | API approach |
|--------------------|--------------|
| Storefront performance | `GET /products` decouples the ERP, serving paginated, Redis-cached data for millisecond responses. |
| Inventory consistency | Checkout performs transactional reservations, applies Redis locks, and persists idempotent responses to stop overselling. |
| Checkout resilience | Orders are acknowledged instantly while BullMQ + circuit breaker handle ERP sync; the order status endpoint surfaces progress/failures to the client. |

### Evolution Goal
- The application layer isolates the ERP, paving the way for data replication, additional queues, and distributed observability without rewriting the monolith.

### Requirements
- Node.js 20+
- npm 9+
- PostgreSQL 16 (local or Docker Compose)
- Redis 7

### Environment Setup
1. Ensure the repository root `.env` exists (`cp ../envexample.txt ../.env` or `cp ../.env.example ../.env`). The same file is shared with the frontend and injected into containers by Docker Compose.
2. (Optional) Add a local `.env` here if you need service-specific overrides.
3. Key variables:
   - `DATABASE_URL`: PostgreSQL connection string.
   - `REDIS_HOST` / `REDIS_PORT`: Redis instance for caching, locks, idempotency.
   - `JWT_*`: token secrets and expirations.
   - `ERP_SIMULATION_*`: governs ERP delay and failure rate.
   - `RATE_LIMIT_*`, `IDEMPOTENCY_TTL_SECONDS`, `PRODUCTS_CACHE_TTL_SECONDS`: protection/retention knobs.
   - `CORS_ALLOWED_ORIGINS`, `CORS_ALLOWED_HEADERS`, `CORS_EXPOSED_HEADERS`, `SECURITY_HSTS_*`, `SECURITY_REFERRER_POLICY`: CORS tightening and HTTP header hardening.
4. The compose Postgres service provisions both `casecell` (dev/prod) and `casecell_test` (tests) via `docker/postgres/init-test-db.sql`. Before running the automated suite, execute `docker compose up -d postgres` from the repo root so the database defined in `TEST_DATABASE_URL` is reachable.

### Running Locally
```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```
- REST API: <http://localhost:3001/api/v1>
- Swagger: <http://localhost:3001/docs>
- Healthcheck: <http://localhost:3001/health>
- Prometheus metrics: <http://localhost:3001/metrics>

### Handy Scripts
- `npm run build`: production build (`dist`).
- `npm run start`: run compiled build.
- `npm run test`: full test suite.
- `npm run test:unit` / `test:integration` / `test:e2e`: focused scopes.
- `npm run lint`: ESLint static analysis.

### Testing Strategy
- Unit: entities, use cases, and ports (ts-jest).
- Integration: runs against the real PostgreSQL instance referenced by `TEST_DATABASE_URL`, with transactional cleanup per test.
- E2E: `Supertest` drives HTTP routes backed by the real database with deterministic seed data.

### Folder Structure
- `src/presentation`: controllers, guards, interceptors, modules.
- `src/application`: use cases, DTOs, contracts.
- `src/domain`: pure entities and business rules.
- `src/infrastructure`: Prisma repositories, Redis services, BullMQ, circuit breaker, ERP simulator, logger.
- `src/config`: config loading and Joi validation.
- `tests`: unit/integration suites plus helpers (e.g., in-memory DB).

### Observability & Resilience
- Structured logging (nestjs-pino + rotating-file-stream).
- Prometheus counters/histograms exposed at `/metrics`.
- `RateLimitGuard` differentiates authenticated users vs IP throttling.
- Locked-down CORS via `CORS_ALLOWED_ORIGINS` with security headers (helmet-managed, production HSTS, referrer policy, controlled `X-RateLimit-*` exposure).
- Distributed circuit breaker shields ERP calls.
- Checkout responses classify validation errors, stock shortages, duplicates, and technical failures.

</details>
