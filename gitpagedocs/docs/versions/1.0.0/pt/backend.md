# Back-end

Checkout de produto com reserva de estoque, pedido, idempotência e sincronização assíncrona com ERP simulado. Há catálogo, autenticação, histórico/status de pedidos e administração. A resposta inicial confirma que o pedido foi aceito para processamento; o resultado do ERP é consultado posteriormente.

## Fluxo e casos de falha

1. Autenticação → catálogo → seleção de um productId e quantity → POST /api/v1/checkout com Bearer JWT e Idempotency-Key. Apenas CUSTOMER pode criar checkout; customerId vem do token. Chave ausente retorna 400. A quantidade e o produto passam pelo DTO e caso de uso; o preço vem do registro no banco.

2. Consulta resposta idempotente no Redis; se existente, devolve duplicate=true com HTTP 200. Caso contrário adquire lock:product:{id} por 5000 ms. Na transação Prisma verifica produto ativo, decrementa estoque condicionalmente com stock >= quantity e cria pedido PENDING/itens. Estoque insuficiente retorna 409; produto inexistente/inativo falha. Depois marca PROCESSING, adiciona sync-order na fila e armazena resposta por TTL configurável (padrão 600 s). Sucesso inicial é HTTP 201.

3. O worker consulta pedido e circuit breaker erp:global. Gateway aprovado marca SUCCESS, atualiza resposta idempotente, invalida catálogo e registra métricas. Erro ou circuito aberto marca FAILED e tenta devolver estoque; erro do gateway é relançado. EnqueueErpSyncCommand configura attempts:1 e sem backoff: não há retry automático de negócio nesse job. Jobs falhos são preservados para inspeção.

4. A interface acompanha status/histórico; administração altera produtos e consulta pedidos conforme roles. Erros técnicos após reservar estoque tentam compensar reserva e marcar pedido FAILED. Essas compensações têm logs próprios e podem falhar; verifique banco e fila antes de repetir manualmente um pedido.

| Método e caminho | Declaração |
| --- | --- |
| `DELETE /api/v1/admin/products/:id` | [backend/src/presentation/http/products/admin-products.controller.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/presentation/http/products/admin-products.controller.ts) |
| `GET /api/v1/admin/orders` | [backend/src/presentation/http/orders/admin-orders.controller.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/presentation/http/orders/admin-orders.controller.ts) |
| `GET /api/v1/admin/products/:id` | [backend/src/presentation/http/products/admin-products.controller.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/presentation/http/products/admin-products.controller.ts) |
| `GET /api/v1/admin/products` | [backend/src/presentation/http/products/admin-products.controller.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/presentation/http/products/admin-products.controller.ts) |
| `GET /api/v1/health` | [backend/src/presentation/http/health/health.controller.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/presentation/http/health/health.controller.ts) |
| `GET /api/v1/metrics` | [backend/src/presentation/http/metrics/metrics.controller.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/presentation/http/metrics/metrics.controller.ts) |
| `GET /api/v1/orders/:id` | [backend/src/presentation/http/orders/orders.controller.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/presentation/http/orders/orders.controller.ts) |
| `GET /api/v1/products` | [backend/src/presentation/http/products/products.controller.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/presentation/http/products/products.controller.ts) |
| `PATCH /api/v1/admin/products/:id` | [backend/src/presentation/http/products/admin-products.controller.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/presentation/http/products/admin-products.controller.ts) |
| `POST /api/v1/admin/products` | [backend/src/presentation/http/products/admin-products.controller.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/presentation/http/products/admin-products.controller.ts) |
| `POST /api/v1/auth/login` | [backend/src/presentation/http/auth/auth.controller.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/presentation/http/auth/auth.controller.ts) |
| `POST /api/v1/auth/logout` | [backend/src/presentation/http/auth/auth.controller.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/presentation/http/auth/auth.controller.ts) |
| `POST /api/v1/auth/refresh` | [backend/src/presentation/http/auth/auth.controller.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/presentation/http/auth/auth.controller.ts) |
| `POST /api/v1/auth/register` | [backend/src/presentation/http/auth/auth.controller.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/presentation/http/auth/auth.controller.ts) |
| `POST /api/v1/checkout` | [backend/src/presentation/http/checkout/checkout.controller.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/presentation/http/checkout/checkout.controller.ts) |

## Exemplo de requisição

```http
POST /api/v1/checkout HTTP/1.1
Authorization: Bearer <customer-access-token>
Idempotency-Key: <unique-purchase-intent>
Content-Type: application/json

{"productId":"00000000-0000-4000-8000-000000000001","quantity":1}
```

## Arquivos relacionados

- [backend/src/main.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/main.ts)
- [backend/src/presentation/http/checkout/checkout.controller.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/presentation/http/checkout/checkout.controller.ts)
- [backend/src/application/checkout/create-checkout.command.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/application/checkout/create-checkout.command.ts)
- [backend/src/application/checkout/enqueue-erp-sync.command.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/application/checkout/enqueue-erp-sync.command.ts)
- [backend/src/infrastructure/queues/erp-sync.processor.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/infrastructure/queues/erp-sync.processor.ts)
- [backend/prisma/schema.prisma](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/prisma/schema.prisma)
- [docker-compose.yml](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/docker-compose.yml)

## Navegação

- [Project guide](?menu=pt&lang=pt&id=8)
- [Source reference](?menu=pt&lang=pt&id=9)
