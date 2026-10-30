# Front-end

Checkout de producto con reserva de inventario, pedido, idempotencia y sincronización asíncrona con ERP simulado. Incluye catálogo, autenticación, historial/estado y administración. La respuesta inicial confirma aceptación para procesamiento; el resultado ERP se consulta después.

## Interfaz y estado

NestJS 10.3, Prisma 5.11/PostgreSQL, Redis, BullMQ 4, JWT/Passport y Argon2. Domain contiene entidades/contratos; application comandos/queries/puertos; infrastructure adaptadores Prisma/Redis/colas/ERP; presentation controllers. Frontend declara Next.js ^15.0.0-canary.120, React ^18.3.1, Redux Persist y TanStack Query 5. Consulte lockfile; el manifest usa rango prerelease.

Modelo: User, Product, Order y OrderItem; precios/totales en centavos. Hay revocación de tokens, hash y guards. Idempotencia usa la clave recibida sin comparar payload en este comando: use clave nueva por intención y repítala solo para esa intención. Enqueue ocurre tras commit SQL sin outbox transaccional; fallos entre etapas requieren inspección. Locks TTL/claves únicas no garantizan exactly-once completo.

Autenticación → catálogo → un productId y quantity → POST /api/v1/checkout con Bearer JWT e Idempotency-Key. Solo CUSTOMER puede comprar; customerId viene del token. Clave ausente: 400. DTO/caso de uso validan cantidad/producto; precio viene del banco.

## Fuentes verificadas

- [frontend/src/app/admin/page.tsx](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/app/admin/page.tsx)
- [frontend/src/app/cart/page.tsx](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/app/cart/page.tsx)
- [frontend/src/app/login/page.tsx](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/app/login/page.tsx)
- [frontend/src/app/page.tsx](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/app/page.tsx)
- [frontend/src/app/register/page.tsx](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/app/register/page.tsx)
- [frontend/src/features/auth/api/login.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/features/auth/api/login.ts)
- [frontend/src/features/auth/api/logout.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/features/auth/api/logout.ts)
- [frontend/src/features/auth/api/register.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/features/auth/api/register.ts)
- [frontend/src/features/auth/model/auth-slice.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/features/auth/model/auth-slice.ts)
- [frontend/src/features/cart/model/cart-slice.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/features/cart/model/cart-slice.ts)
- [frontend/src/scenes/admin/ui/admin-orders-page.tsx](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/scenes/admin/ui/admin-orders-page.tsx)
- [frontend/src/shared/api/admin-products.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/shared/api/admin-products.ts)
- [frontend/src/shared/api/checkout.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/shared/api/checkout.ts)
- [frontend/src/shared/api/client.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/shared/api/client.ts)
- [frontend/src/shared/api/orders.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/shared/api/orders.ts)
- [frontend/src/shared/api/products.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/shared/api/products.ts)
- [frontend/src/shared/config/routes.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/shared/config/routes.ts)
- [frontend/src/shared/store/hooks.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/shared/store/hooks.ts)
- [frontend/src/shared/store/index.ts](https://github.com/Vidigal-code/casecell-checkout-service/blob/0710aade2a2137cc98f52f138f8c883e7fdd4a4b/frontend/src/shared/store/index.ts)

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
