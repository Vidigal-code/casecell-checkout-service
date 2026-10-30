# Back-end

Product checkout with stock reservation, orders, idempotency and asynchronous synchronization with a simulated ERP. It includes catalog, authentication, order history/status and administration. The initial response confirms acceptance for processing; the ERP outcome is queried later.

## Workflow and failure cases

1. Authentication → catalog → one productId and quantity → POST /api/v1/checkout with Bearer JWT and Idempotency-Key. Only CUSTOMER can checkout; customerId comes from the token. Missing key returns 400. DTO/use case validate quantity/product; price comes from the database.

2. Redis idempotency lookup returns duplicate=true/HTTP 200 when cached. Otherwise it acquires lock:product:{id} for 5000 ms. A Prisma transaction verifies an active product, conditionally decrements stock where stock >= quantity and creates a PENDING order/items. Insufficient stock returns 409; missing/inactive products fail. It then marks PROCESSING, queues sync-order and caches the response with configurable TTL (default 600 s). Initial success is HTTP 201.

3. The worker reads the order and erp:global circuit breaker. Gateway success marks SUCCESS, updates idempotency, invalidates catalog and records metrics. Failure/open circuit marks FAILED and attempts stock release; gateway errors are rethrown. EnqueueErpSyncCommand uses attempts:1 and no backoff: this job has no automatic business retry. Failed jobs are retained for inspection.

4. The UI follows order status/history; administration changes products and queries orders according to roles. Technical failures after reservation attempt stock compensation and FAILED status. Compensation has its own logs and can fail; inspect database/queue before manually retrying an order.

| Method and path | Declaration |
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

## Request example

```http
POST /api/v1/checkout HTTP/1.1
Authorization: Bearer <customer-access-token>
Idempotency-Key: <unique-purchase-intent>
Content-Type: application/json

{"productId":"00000000-0000-4000-8000-000000000001","quantity":1}
```

## Related files

- [backend/src/main.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/main.ts)
- [backend/src/presentation/http/checkout/checkout.controller.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/presentation/http/checkout/checkout.controller.ts)
- [backend/src/application/checkout/create-checkout.command.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/application/checkout/create-checkout.command.ts)
- [backend/src/application/checkout/enqueue-erp-sync.command.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/application/checkout/enqueue-erp-sync.command.ts)
- [backend/src/infrastructure/queues/erp-sync.processor.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/infrastructure/queues/erp-sync.processor.ts)
- [backend/prisma/schema.prisma](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/prisma/schema.prisma)
- [docker-compose.yml](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/docker-compose.yml)

## Navigation

- [Project guide](?menu=en&lang=en&id=8)
- [Source reference](?menu=en&lang=en&id=9)
