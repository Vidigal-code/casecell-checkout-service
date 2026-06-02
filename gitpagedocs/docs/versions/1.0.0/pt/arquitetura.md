---
title: "Arquitetura e design"
description: "Componentes, fluxos e decisões técnicas que estruturam o Casecell Checkout Service."
---

# Arquitetura e design

## Visão macro

```
Cliente Web → Next.js 15 (React Query + Redux) → API NestJS → PostgreSQL / Redis → Simulador ERP (BullMQ)
```

### Camadas principais

- **Frontend (Next.js 15 / FSD)**
  - Páginas orientadas a cenas (`scenes/`), componentes reutilizáveis (`widgets/`, `features/`).
  - React Query para cache de dados, suspense manual e estados de carregamento.
  - Redux Toolkit para carrinho persistido e preferências do usuário.
  - Tailwind CSS + Framer Motion para UI responsiva com animações leves.

- **Backend (NestJS 10)**
  - Estrutura DDD/Clean com módulos de domínio (`domain`, `application`, `infrastructure`, `presentation`).
  - Controladores HTTP expostos em `/api/v1`, validados com `class-validator` e `class-transformer`.
  - Prisma como ORM (PostgreSQL) para produtos, pedidos e registros de idempotência.
  - Redis para locks, cache de vitrine, armazenamento de idempotência e filas BullMQ.

- **Fila & simulador ERP**
  - BullMQ processa sincronizações assíncronas com o ERP.
  - Job simula latência configurável (ambiente) e falhas intermitentes para testar resiliência.
  - Circuit breaker automático evita sobrecarga quando o ERP está instável.

## Fluxos críticos

1. **Catalogação**
   - `GET /products` lê produtos do Postgres, com suporte a paginação, busca e cache Redis.
   - Transformadores convertem query params (ex.: `page`, `pageSize`) para números com segurança.

2. **Checkout**
   - `POST /checkout` valida payload (produto, quantidade, idempotência, cliente opcional).
   - Transação Postgres reserva estoque, cria pedido e gera entrada em fila.
   - Locks Redis (`SET NX`) protegem decrementos de estoque em paralelo.
   - Idempotência reutiliza resposta se a mesma `Idempotency-Key` for recebida.

3. **Sincronização ERP**
   - Worker BullMQ consome pedidos pendentes.
   - Simulador de ERP pode responder sucesso, falha temporária ou definitiva.
   - Retries com backoff atualizam o status do pedido (`PENDING`, `PROCESSING`, `SUCCESS`, `FAILED`).

## Segurança e governança

- Env único na raiz (`.env`) compartilhado por backend e frontend.
- Helmet + rate limiting (NestJS Throttler) protegem a API.
- CORS configurável via variáveis (`CORS_ALLOWED_ORIGINS`, cabeçalhos, métodos).
- Logs estruturados (Pino) com correlação por request ID.

## Observabilidade

- **/metrics**: expose métricas Prometheus (latência, sucesso/erro, fila).
- **OpenTelemetry**: spans para checkout e jobs do ERP.
- **Logs**: JSON enriquecido, prontos para ELK ou Loki.

## Evolução planejada

- CDC ou streaming do ERP para atualização de estoque em near real-time.
- Segmentação de rate-limit por usuário/cliente.
- Dashboard React para operadores monitorarem KPIs em tempo real.
