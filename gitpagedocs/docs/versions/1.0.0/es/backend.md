# Back-end

Checkout de producto con reserva de inventario, pedido, idempotencia y sincronización asíncrona con ERP simulado. Incluye catálogo, autenticación, historial/estado y administración. La respuesta inicial confirma aceptación para procesamiento; el resultado ERP se consulta después.

## Flujo y casos de fallo

1. Autenticación → catálogo → un productId y quantity → POST /api/v1/checkout con Bearer JWT e Idempotency-Key. Solo CUSTOMER puede comprar; customerId viene del token. Clave ausente: 400. DTO/caso de uso validan cantidad/producto; precio viene del banco.

2. Idempotencia Redis devuelve duplicate=true/HTTP 200 si hay respuesta. Si no, adquiere lock:product:{id} durante 5000 ms. Transacción Prisma verifica producto activo, decrementa con stock >= quantity y crea pedido PENDING/items. Inventario insuficiente: 409; producto ausente/inactivo falla. Luego marca PROCESSING, encola sync-order y cachea respuesta con TTL configurable (600 s). Éxito inicial: HTTP 201.

3. Worker consulta pedido y circuit breaker erp:global. Éxito marca SUCCESS, actualiza idempotencia, invalida catálogo y registra métricas. Error/circuito abierto marca FAILED e intenta devolver inventario; errores del gateway se propagan. EnqueueErpSyncCommand usa attempts:1 sin backoff: no hay retry automático de negocio. Jobs fallidos se conservan.

4. La interfaz sigue estado/historial; administración modifica productos y consulta pedidos según roles. Fallos técnicos tras reservar intentan compensar inventario y marcar FAILED. Compensación tiene logs y puede fallar; inspeccione banco/cola antes de repetir manualmente.

| Método y ruta | Declaración |
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

## Ejemplo de petición

```http
POST /api/v1/checkout HTTP/1.1
Authorization: Bearer <customer-access-token>
Idempotency-Key: <unique-purchase-intent>
Content-Type: application/json

{"productId":"00000000-0000-4000-8000-000000000001","quantity":1}
```

## Archivos relacionados

- [backend/src/main.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/main.ts)
- [backend/src/presentation/http/checkout/checkout.controller.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/presentation/http/checkout/checkout.controller.ts)
- [backend/src/application/checkout/create-checkout.command.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/application/checkout/create-checkout.command.ts)
- [backend/src/application/checkout/enqueue-erp-sync.command.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/application/checkout/enqueue-erp-sync.command.ts)
- [backend/src/infrastructure/queues/erp-sync.processor.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/src/infrastructure/queues/erp-sync.processor.ts)
- [backend/prisma/schema.prisma](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/backend/prisma/schema.prisma)
- [docker-compose.yml](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/docker-compose.yml)

## Navegación

- [Project guide](?menu=es&lang=es&id=8)
- [Source reference](?menu=es&lang=es&id=9)
