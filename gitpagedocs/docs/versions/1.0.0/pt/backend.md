---
title: "Back-end"
description: "Endpoints, validações, idempotência e simulação de ERP do Casecell Checkout Service."
---

# Back-end

## Stack

- **NestJS 10** com TypeScript, estrutura modular e pipes globais.
- **Prisma ORM** para comunicação com PostgreSQL.
- **Redis** para cache, locks e idempotência.
- **BullMQ** para filas de sincronização com o ERP.
- **Pino** para logs estruturados.
## Principais módulos

- `ProductsModule`: lista, busca e cache de produtos.
- `CheckoutModule`: orquestra validação, reserva de estoque e idempotência.
- `OrdersModule`: expõe status de pedidos (`GET /orders/:id`).
- `QueueModule`: configura BullMQ, workers e simulador ERP.
- `SharedModule`: providers reutilizáveis (locks, transformadores, interceptors).

## Endpoints HTTP

### `GET /api/v1/products`

- **Query params**: `page`, `pageSize`, `search`.
- **Transformers**: convertem strings em inteiros com fallback seguro.
- **Cache**: resultados paginados armazenados em Redis (TTL configurável).
- **Resposta**:
  ```json
  {
    "data": [{"id": "...", "name": "...", ...}],
    "page": 1,
    "pageSize": 10,
    "total": 42
  }
  ```

### `POST /api/v1/checkout`

- **Headers obrigatórios**: `Idempotency-Key` (string única por tentativa).
- **Payload**:
  ```json
  {
    "productId": "uuid",
    "quantity": 2,
    "customerEmail": "opcional"
  }
  ```
- **Validações**:
  - Produto existente e ativo.
  - Quantidade ≥ 1 e ≤ estoque disponível.
  - Chave de idempotência obrigatória.
- **Fluxo**:
  1. Verifica se já existe resposta para a chave → retorna imediatamente.
  2. Abre transação no Postgres.
  3. Aplica lock redis (`checkout:lock:${productId}`) para decremento seguro.
  4. Reserva estoque e cria pedido (`status = PENDING`).
  5. Publica job BullMQ para sincronizar com ERP.
  6. Resposta 202 com dados do pedido.
- **Erros**:
  - `400` – payload inválido (DTO + pipes).
  - `409` – estoque insuficiente.
  - `422` – idempotência ausente.
  - `500` – falha técnica inesperada (logada com stack e requestId).

### `GET /api/v1/orders/:id`

- Retorna o status atual do pedido (`PENDING`, `PROCESSING`, `SUCCESS`, `FAILED`).
- Inclui histórico básico de tentativas e falhas do ERP quando aplicável.

## Idempotência

- Implementada com Redis usando chave `checkout:idempotency:${key}`.
- Armazena payload, status HTTP e corpo da resposta.
- Expiração configurável (padrão 24h) para liberar memória.
- Evita processamento duplicado em duplicidade de cliques, refresh ou erros de rede.

## Simulador de ERP

- Configurável via variáveis (`ERP_SIMULATION_FAILURE_RATE`, delays mínimo e máximo).
- Cada job sorteia:
  - Sucesso imediato.
  - Falha temporária → reenqueue com backoff exponencial.
  - Falha definitiva → marca pedido como `FAILED`.
- Circuit breaker impede chamadas contínuas quando taxa de falha ultrapassa limiar.

## Logs e métricas

- Cada requisição recebe `Request-Id` repassado em headers e logs.
- Métricas expostas em `/metrics` (Prometheus): latência de checkout, taxa de erro, profundidade de fila.
- Logs estruturados agregam contexto (rota, usuário opcional, chave de idempotência).
