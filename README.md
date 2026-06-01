# CaseCellShop Checkout Service

Plataforma fullstack para checkout resiliente da CaseCellShop, desacoplando o ERP legado com APIs próprias, caching inteligente e UX responsiva.

## 📋 Desafio / Challenge Brief

### 🇧🇷 Descrição em Português

<details>
<summary><strong>Ver Detalhes</strong></summary>

**Contexto**
- A CaseCellShop enfrenta hiper crescimento e depende de um ERP monolítico para vitrine e checkout.
- Problemas principais: vitrine lenta, overselling e timeouts no checkout.

**Objetivo do Case**
- Reduzir a dependência direta do ERP, melhorar a experiência do cliente e evitar vendas sem estoque com uma solução incremental.

**Escopo do Desafio**
- Implementar fluxo completo de checkout para capinhas: listar produtos, escolher quantidade e tentar finalizar a compra.
- Tratar sucesso, validação, estoque insuficiente, tentativa duplicada e falha temporária do ERP.
- Exigir idempotência simples, simulação de ERP instável e UI com feedbacks claros.

**Critérios de Avaliação**
- APIs claras para catálogo e checkout, validações sólidas e prevenção de overselling.
- Testes automatizados ou estratégia de QA descrita.
- README detalhado; bônus com logs estruturados, endpoint de status e observabilidade.
- Ao entregar oficialmente, publique o repositório em uma conta GitHub pessoal e inclua o link na resposta final (Parte 1.B).

**Endereçando os 3 Problemas Identificados**
| Problema | Solução implementada |
| Performance da vitrine | API própria `GET /products` desacoplada do ERP, com paginação e cache Redis; frontend utiliza React Query, skeletons e invalidação inteligente para exibir resultados em milissegundos mesmo sob carga. |
| Consistência de estoque | Checkout executa reservas transacionais com Prisma, usa locks Redis para exclusão mútua e exige cabeçalho `Idempotency-Key`, garantindo que nenhum item seja vendido duas vezes e que respostas duplicadas sejam reaproveitadas. |
| Resiliência do checkout | Pedido é persistido e respondido imediatamente, enquanto a sincronização com o ERP ocorre via BullMQ com circuit breaker e retries controlados; o status pode ser acompanhado em `/orders/:id`, permitindo UX consistente mesmo quando o ERP falha. |

**Objetivo de Evolução**
- A solução reduz o acoplamento ao ERP central isolando vitrine e checkout, permitindo evolução incremental com filas, cache e observabilidade já prontas para escalar.

</details>

### 🇺🇸 English Description

<details>
<summary><strong>View Details</strong></summary>

**Context**
- CaseCellShop is scaling fast while relying on a monolithic ERP for catalog and checkout.
- Pain points: slow storefront, inventory overselling, and checkout timeouts.

**Goal**
- Gradually decouple the ERP, improve customer experience, and avoid stock issues through an incremental solution.

**Challenge Scope**
- Build an end-to-end checkout for phone cases: list products, select quantity, and submit the purchase.
- Handle success, validation errors, insufficient stock, duplicated attempts, and temporary ERP failures.
- Provide simple idempotency, ERP latency simulation, and user-facing feedback for each outcome.

**Evaluation Criteria**
- Clear APIs, strong validation, and overselling protection.
- Documented automated tests or QA strategy.
- Comprehensive README; bonus points for structured logs, status endpoints, and observability.
- When submitting officially, publish the repo under your GitHub account and include the public link in the final response (Part 1.B).

**Addressing the 3 Identified Problems**
| Problem | Implemented solution |
| Storefront performance | A dedicated `GET /products` API decouples the storefront from the ERP, serving paginated results cached in Redis; the frontend leverages React Query, skeleton states, and smart revalidation to keep responses fast under heavy load. |
| Inventory consistency | Checkout workflows run transactional reservations via Prisma, enforce Redis locks for mutual exclusion, and require an `Idempotency-Key` header so duplicate attempts reuse the same response—eliminating overselling scenarios. |
| Checkout resilience | Orders persist and return immediately while BullMQ handles ERP synchronization with circuit breaker plus controlled retries; clients can track the process through `/orders/:id`, ensuring consistent UX even when the ERP misbehaves. |

**Evolution Goal**
- The architecture decouples the ERP from critical journeys, enabling incremental improvements through queues, caching, and observability already built into the stack.

</details>

## 🇧🇷 Descrição em Português

<details>
<summary><strong>Ver Detalhes</strong></summary>

### Visão Geral
- Mini-projeto fullstack que protege o fluxo de compras contra lentidão do ERP original.
- Produtos, estoques e pedidos são expostos por APIs próprias enquanto a sincronização com o ERP ocorre de forma assíncrona.
- Frontend Next.js orientado a experiências (FSD) com feedbacks claros para cada resultado do checkout.

### Arquitetura
```mermaid
flowchart LR
  subgraph Web[Next.js 15 Frontend]
    UI[UI orientada a cenas]
    Store[Redux Toolkit]
    Query[React Query]
    AuthSeed[Auth Seed]
  end

  subgraph API[NestJS Backend]
    AuthModule[Auth & RBAC]
    ProductsModule[Products API]
    CheckoutModule[Checkout & Locks]
    OrdersModule[Orders API]
    AdminOrdersModule[Admin Orders API]
    HealthModule[Health]
    MetricsModule[Metrics]
    QueueModule[BullMQ Worker]
  end

  UI -->|HTTP| API
  Store --> UI
  Query --> API
  API -->|Prisma| Postgres[(PostgreSQL)]
  API -->|Idempotência & Locks| Redis[(Redis)]
  CheckoutModule -->|Simulação| ERP[ERP Simulator]
  QueueModule -->|BullMQ| Redis
```

### Destaques da Solução
- DDD + Clean Architecture (domain, application, infrastructure, presentation).
- Idempotência com Redis e locks distribuídos para evitar overselling.
- Queue BullMQ, circuit breaker distribuído e simulador de ERP com latência configurável.
- Observabilidade: Pino estruturado, métricas Prometheus, spans OpenTelemetry.
- Frontend FSD em modos claro/escuro com Tailwind e Framer Motion, páginas dedicadas de login/registro, carrinho persistido com fallback visual e checkout resiliente.
- Checkout executa em transação ACID com rollback automático de estoque e pedido ao detectar falhas.
- Painel `/admin` unifica acompanhamento de pedidos e CRUD completo de produtos com RBAC.

### Guia de Execução Rápida
- Pré-requisitos: Node.js 20+, npm 9+, Docker + Docker Compose.
- Um único arquivo `.env` na raiz governa backend e frontend; o compose injeta os mesmos valores dentro dos containers.
- Configuração de variáveis (arquivo único compartilhado):
  ```bash
  cp envexample.txt .env
  ```
   Ajuste `NEXT_PUBLIC_API_BASE_URL` para `/api/v1` (chamadas relativas ao host) e mantenha `INTERNAL_API_BASE_URL=http://localhost:3001` para o roteamento interno. Ao usar Docker, utilize `DOCKER_NEXT_PUBLIC_API_BASE_URL=/api/v1`, `DOCKER_INTERNAL_API_BASE_URL=http://backend:3001` e `DOCKER_NEXT_PUBLIC_DEFAULT_THEME=light` — o compose já fornece esses valores. Backend e frontend consomem automaticamente esse `.env` (Docker, Prisma e Next.js).
   Configure `CORS_ALLOWED_ORIGINS` com todos os domínios confiáveis que acessarão a API (ex.: `http://localhost:3000` em desenvolvimento, `https://checkout.casecell.shop` em produção) e ajuste cabeçalhos/ métodos conforme necessário.
   O arquivo `frontend/.env.docker` acompanha esses mesmos valores para o container de UI.
- Backend (modo dev):
  ```bash
  cd backend
  npm install
  npm run prisma:generate
  npm run prisma:migrate
  npm run prisma:seed
  npm run start:dev
  ```
  Serviços: API <http://localhost:3001/api/v1>, Swagger `/docs`, métricas `/metrics`.
- Frontend (modo dev):
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
  UI em <http://localhost:3000>.
- Docker Compose:
  ```bash
  docker compose up --build
  ```
  Provisiona Postgres, Redis, backend e frontend prontos para uso.
- Documentação Swagger: <http://localhost:3001/docs/pt> e <http://localhost:3001/docs/en>
- Banco de testes: o compose cria automaticamente `casecell_test` via `docker/postgres/init-test-db.sql`. Para rodar as suítes localmente, suba apenas o Postgres (`docker compose up -d postgres`), garanta que `TEST_DATABASE_URL` aponte para esse banco e execute `npm test` na pasta `backend`.

### Testes Automatizados
| Contexto | Comando |
|----------|---------|
| Backend (todos) | `npm test` |
| Backend unit | `npm run test:unit` |
| Backend integração | `npm run test:integration` |
| Backend e2e | `npm run test:e2e` |
| Frontend (todos) | `npm test` |
| Frontend unit | `npm run test:unit` |
| Frontend integração | `npm run test:integration` |
| Frontend e2e | `npm run test:e2e` |

> ℹ️ Antes de executar os testes do backend, inicie o serviço Postgres com `docker compose up -d postgres` para garantir que o banco `casecell_test` definido em `TEST_DATABASE_URL` esteja acessível.

### Fluxos Principais
1. Listagem e busca de produtos com paginação, skeletons e fallback de imagem.
2. Registro com senha forte e login persistido (tokens + refresh) para clientes e administradores.
3. Carrinho persistido no Redux com ajuste de quantidades, validação de estoque e resumo financeiro.
4. Checkout idempotente com respostas distintas para sucesso, validação, estoque, falha técnica e duplicidade.
5. Consulta de pedidos com status dinâmico (`PENDING`, `PROCESSING`, `SUCCESS`, `FAILED`).
6. Painel administrativo `/admin` com filtros, visão detalhada dos itens e CRUD completo de produtos.

### Observabilidade & Resiliência
- Logs estruturados (Pino + rotating-file-stream) com contexto por requisição.
- Métricas Prometheus e spans OpenTelemetry para checkout e jobs do ERP.
- Rate limiting global com identificação por usuário/IP.
- CORS restrito configurável via `CORS_ALLOWED_ORIGINS` e cabeçalhos de segurança automatizados pelo `helmet` (HSTS em produção, Referrer-Policy, exposição controlada de `X-RateLimit-*`).
- Circuit breaker e retries controlados protegem integrações externas.

### Parte 1.A — Respostas Conceituais
1. **Reduzir dependência do ERP**: camada intermediária lê réplica de dados, publica APIs próprias e sincroniza o ERP de forma assíncrona.
2. **Consistência de estoque**: reservas atômicas em SQL + locks Redis evitam overselling mesmo sob concorrência.
3. **ERP instável**: fila BullMQ processa pedidos em background com retries e compensações.
4. **Idempotência simples**: cabeçalho `Idempotency-Key` persistido no Redis reaproveita respostas de tentativas anteriores.
5. **Organização para evoluir**: DDD e portas/adapters isolam regras e dependências.
6. **Próximos passos recomendados**: CDC para estoque, observabilidade distribuída, fila de compensação, rate limiting por conta e dashboards de conversão.

### Limitações Conhecidas
- Seeds usam dados fixos para usuários/produtos.
- Testes e2e dublam Redis/ERP; recomendável staging dedicado em produção.
- Simulador de ERP usa aleatoriedade — ajuste envs para cenários determinísticos.

### Próximos Passos Sugeridos
1. Sincronização assíncrona com ERP (implementado ✅).
2. Rate limiting e circuit breaker por usuário (implementado ✅).
3. Observabilidade distribuída (implementado ✅).
4. UI administrativa para operadores (implementado ✅).

</details>

## 🇺🇸 English Description

<details>
<summary><strong>View Details</strong></summary>

### Overview
- Fullstack mini-project that shields the checkout flow from the legacy ERP latency.
- Products, inventory and orders are exposed through our own APIs while ERP sync happens asynchronously.
- Next.js experience-first frontend with clear feedback for every checkout outcome.

### Architecture
```mermaid
flowchart LR
  subgraph Web[Next.js 15 Frontend]
    UI[Scene-driven UI]
    Store[Redux Toolkit]
    Query[React Query]
    AuthSeed[Seed Auth]
  end

  subgraph API[NestJS Backend]
    AuthModule[Auth & RBAC]
    ProductsModule[Products API]
    CheckoutModule[Checkout & Locks]
    OrdersModule[Orders API]
    AdminOrdersModule[Admin Orders API]
    HealthModule[Health]
    MetricsModule[Metrics]
    QueueModule[BullMQ Worker]
  end

  UI -->|HTTP| API
  Store --> UI
  Query --> API
  API -->|Prisma| Postgres[(PostgreSQL)]
  API -->|Idempotency & Locks| Redis[(Redis)]
  CheckoutModule -->|Simulation| ERP[ERP Simulator]
  QueueModule -->|BullMQ| Redis
```

### Solution Highlights
- DDD + Clean Architecture (domain, application, infrastructure, presentation).
- Redis-backed idempotency and distributed locks keep inventory consistent.
- BullMQ queue, distributed circuit breaker, and configurable ERP simulator.
- Observability: structured Pino logs, Prometheus metrics, OpenTelemetry spans.
- Dual-theme (light/dark) FSD frontend with Tailwind/Framer Motion, dedicated login/register pages, persistent cart with image fallbacks, and resilient checkout UX.
- Checkout runs inside an ACID transaction with automatic rollback of stock and order data on failure.
- `/admin` dashboard consolidates order tracking and full product CRUD under RBAC.

### Quick Start
- Requirements: Node.js 20+, npm 9+, Docker + Docker Compose.
- A single root `.env` drives both backend and frontend; Docker compose reuses the same values inside the containers.
- Environment setup (single shared file):
  ```bash
  cp envexample.txt .env
  ```
   Set `NEXT_PUBLIC_API_BASE_URL` to `/api/v1` (host-relative) and keep `INTERNAL_API_BASE_URL=http://localhost:3001` for server-side routing. When running Docker, rely on `DOCKER_NEXT_PUBLIC_API_BASE_URL=/api/v1`, `DOCKER_INTERNAL_API_BASE_URL=http://backend:3001`, and `DOCKER_NEXT_PUBLIC_DEFAULT_THEME=light`—the compose file already provides those defaults. Backend and frontend automatically load this `.env` (Docker, Prisma and Next.js).
   Configure `CORS_ALLOWED_ORIGINS` to list every trusted domain consuming the API (e.g., `http://localhost:3000` for development, `https://checkout.casecell.shop` in production) and adjust headers/methods as needed.
   The repository ships with `frontend/.env.docker`, mirroring these values so browsers always call `http://localhost:3001` while the container reaches the backend via `backend:3001`.
- Backend (dev mode):
  ```bash
  cd backend
  npm install
  npm run prisma:generate
  npm run prisma:migrate
  npm run prisma:seed
  npm run start:dev
  ```
  Services: API <http://localhost:3001/api/v1>, Swagger `/docs`, metrics `/metrics`.
- Frontend (dev mode):
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
  UI served at <http://localhost:3000>.
- Docker Compose:
  ```bash
  docker compose up --build
  ```
  Provisions Postgres, Redis, backend and frontend ready to run.
- Swagger docs: <http://localhost:3001/docs/pt> and <http://localhost:3001/docs/en>
- Test database: the compose file seeds `casecell_test` via `docker/postgres/init-test-db.sql`. When running suites locally, start only Postgres (`docker compose up -d postgres`), ensure `TEST_DATABASE_URL` points to that database, and run `npm test` inside `backend`.

### Automated Tests
| Scope | Command |
|-------|---------|
| Backend – all | `npm test`
| Backend – unit | `npm run test:unit`
| Backend – integration | `npm run test:integration`
| Backend – e2e | `npm run test:e2e`
| Frontend – all | `npm test`
| Frontend – unit | `npm run test:unit`
| Frontend - integration | `npm run test:integration`
| Frontend - e2e | `npm run test:e2e`

> ℹ️ Start the Postgres service first (`docker compose up -d postgres`) so the `casecell_test` database configured in `TEST_DATABASE_URL` is reachable before launching backend tests.

### Core Flows
1. Product catalog with pagination, search, skeleton states, and graceful image fallbacks.
2. Strong-password registration and persisted login (admin/customer) with refresh tokens.
3. Persistent cart with quantity controls, stock validation, and financial summary.
4. Checkout with transactional reservations, idempotent responses, and detailed messaging for each outcome.
5. Order tracking with live statuses (`PENDING`, `PROCESSING`, `SUCCESS`, `FAILED`).
6. Operator dashboard `/admin` featuring status filters, detailed item breakdowns, and full product CRUD.

### Observability & Resilience
- Structured logging (Pino + rotating-file-stream) with per-request context.
- Prometheus metrics and OpenTelemetry spans for checkout and ERP workers.
- Global rate limiting with user/IP tracking.
- Locked-down CORS via `CORS_ALLOWED_ORIGINS` plus security headers powered by `helmet` (production HSTS, referrer policy, and controlled `X-RateLimit-*` exposure).
- Circuit breaker plus controlled retries around external integrations.

### Conceptual Answers (Challenge 1.A)
1. **Reduce ERP coupling**: introduce a checkout service that reads replicated data and exposes its own APIs while syncing asynchronously.
2. **Inventory consistency**: atomic SQL reservations plus Redis locks prevent overselling under heavy load.
3. **Slow ERP handling**: queue work via BullMQ, respond immediately, and retry/compensate in the background.
4. **Simple idempotency**: accept `Idempotency-Key`, persist results in Redis, replay payloads on retries.
5. **Scalable organization**: DDD with ports/adapters isolates business rules from infrastructure.
6. **Next production steps**: CDC for products, distributed telemetry, compensation queue, per-account rate limiting, conversion dashboards.

### Known Limitations
- Seed data contains fixed users and products.
- E2E tests mock Redis/ERP; prefer dedicated staging services in production.
- ERP simulator relies on randomness—tune env vars for deterministic runs when needed.

### Suggested Next Steps
1. Async ERP synchronization (shipped ✅).
2. Per-user rate limiting and circuit breaker (shipped ✅).
3. Distributed observability (shipped ✅).
4. Operator-facing admin UI (shipped ✅).

</details>

---

- Documentação detalhada por camada: `backend/README.md` e `frontend/README.md`.
- Históricos de prompts registrados em `PROMPTS.md`.
