---
title: "Back-end"
description: "Autenticação, catálogo, checkout, operações administrativas e observabilidade do Casecell Checkout Service."
---

# Back-end

## Stack

- NestJS 10 (TypeScript) com camadas DDD/Clean e pipes de validação globais.
- Prisma ORM + PostgreSQL para usuários, produtos, pedidos, idempotência e trilhas de auditoria.
- Redis 7 para cache, locks distribuídos, armazenamento de idempotência e estado das filas BullMQ.
- BullMQ para orquestrar sincronização com o ERP, retries e circuito de proteção.
- Pino, OpenTelemetry e prom-client para logs estruturados, rastros e métricas.
- Swagger UI bilíngue (`/docs`) gerada a partir das anotações dos DTOs.

## Módulos e responsabilidades

- `AuthModule`: cadastro, login, refresh e logout com política de senha e rotação de refresh tokens.
- `ProductsModule`: catálogo público (`/products`) e manutenção administrativa em `/admin/products`.
- `CheckoutModule`: validação de payload, reserva de estoque, idempotência e publicação de jobs.
- `OrdersModule`: consulta de pedidos por cliente (`/orders/:id`) e visão administrativa paginada (`/admin/orders`).
- `QueueModule`: configuração da fila BullMQ, worker, simulador de ERP e circuit breaker.
- `SharedModule`: locks Redis, rate limiting, telemetria, filtros de exceção e helpers bilíngues do Swagger.

## Endpoints HTTP

### Autenticação (`/api/v1/auth`)

- `POST /register` recebe `email` e senha forte, aplica hash e devolve tokens de acesso/refresh com o perfil do usuário.
- `POST /login` autentica usuários existentes e rotaciona o refresh token persistido no PostgreSQL.
- `POST /refresh` gera novo par de tokens, invalidando o refresh anterior.
- `POST /logout` revoga o refresh token ativo e limpa fingerprints salvos.
- Respostas incluem metadados de expiração para facilitar o refresh automático no frontend.

### Catálogo (`/api/v1/products`)

- Aceita `page`, `pageSize` e `search`, com transformadores que convertem e validam números com defaults seguros.
- Resultados são cacheados em Redis (TTL configurável via `PRODUCTS_CACHE_TTL_SECONDS`) e invalidados a cada alteração administrativa.
- Cada item retorna nome, preço em centavos, SKU, disponibilidade, flag de atividade e imagem opcional.

### Checkout (`/api/v1/checkout`)

- Requer `Authorization: Bearer` com papel `CUSTOMER` e header `Idempotency-Key`.
- Payload: `productId` (UUID) e `quantity` (mínimo 1, máximo estoque disponível).
- Fluxo: consulta resposta idempotente → abre transação no Postgres → adquire lock `checkout:lock:${productId}` → reserva estoque e cria pedido → enfileira job na BullMQ → retorna `201 Created` com resumo.
- Tentativas duplicadas retornam `200 OK` com o payload armazenado. Erros mapeiam para `400` (header ausente), `409` (estoque), `422` (validação), `429` (throttling) e `503` (ERP indisponível).

### Acompanhamento de pedidos (`/api/v1/orders/:id`)

- Disponível para o cliente dono do pedido e para administradores via RBAC.
- Retorna status (`PENDING`, `PROCESSING`, `SUCCESS`, `FAILED`), histórico de retries e último motivo de falha.

### Catálogo administrativo (`/api/v1/admin/products`)

- Protegido por JWT + roles; apenas `ADMIN` acessa.
- `GET` pagina produtos com filtros de `search`, `page` e `pageSize` para o dashboard.
- `POST` cria itens com `name`, `description`, `sku`, `priceCents`, `stock`, `imageUrl` opcional e `isActive`.
- `GET /:id` retorna detalhes completos; `PATCH /:id` atualiza campos parciais; `DELETE /:id` desativa o produto (soft delete).
- Toda alteração limpa o cache Redis do catálogo público.

### Pedidos administrativos (`/api/v1/admin/orders`)

- Exibe o backlog de pedidos com paginação e filtros por `status`, `customerId`, `page` e `pageSize` (1–50).
- Resposta inclui dados do pedido, estado no ERP, timestamps e contadores de retry usados pelo painel.

### Endpoints de plataforma

- `GET /api/v1/health` verifica PostgreSQL e Redis em paralelo e responde `ok` ou `degraded` com o status de cada componente.
- `GET /api/v1/metrics` expõe métricas Prometheus (latência do checkout, taxa de erro, profundidade de fila, estado do circuito).
- `GET /docs` disponibiliza Swagger com alternância PT/EN para revisar contratos.

## Idempotência e concorrência

- Respostas ficam em `checkout:idempotency:${key}` no Redis, com TTL configurado por `IDEMPOTENCY_TTL_SECONDS` (default 600s).
- Locks com `SET NX` por produto (`checkout:lock:${productId}`) serializam decrementos de estoque.
- Transações no Postgres garantem atomicidade entre reserva de estoque, criação do pedido e persistência da idempotência.

## Simulador de ERP e filas

- Pedidos são enfileirados na BullMQ (`erp-sync`) imediatamente após a reserva.
- O simulador respeita `ERP_SIMULATION_FAILURE_RATE`, `ERP_SIMULATION_MIN_DELAY_MS` e `MAX_DELAY_MS` para gerar latência e falhas reais.
- Falhas consecutivas ativam o circuito (`CIRCUIT_BREAKER_FAILURE_THRESHOLD`, `CIRCUIT_BREAKER_RESET_TIMEOUT_MS`), pausando chamadas até o cooldown expirar.
- Sucesso marca pedidos como `SUCCESS`; falhas definitivas resultam em `FAILED` com detalhes para o painel administrativo.

## Segurança e observabilidade

- Helmet, CORS e Nest Throttler reforçam cabeçalhos seguros, controle de origem e rate limiting.
- Segredos JWT, hosts de Redis/Postgres e limites de requisição vivem no `.env` compartilhado.
- Logger Pino inclui `requestId`, usuário autenticado, chave de idempotência e duração em cada entrada JSON.
- Instrumentação OpenTelemetry cobre handlers do checkout e workers da fila, pronta para exportar via OTLP.
- Métricas Prometheus e o healthcheck são usados pelos health checks do Docker e pelos smoke tests da pipeline.

## Persistência e tooling

- Mutações de schema acontecem via Prisma (`npm run prisma:migrate`); seeds populam usuários e produtos padrão.
- Scripts auxiliares (`prisma:deploy`, `prisma:push`, `prisma:seed`) são executados automaticamente no Docker e podem ser rodados manualmente.
