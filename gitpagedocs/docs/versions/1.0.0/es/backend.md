---
title: "Back-end"
description: "Autenticación, catálogo, checkout, administración y observabilidad del Casecell Checkout Service."
---

# Back-end

## Stack

- NestJS 10 (TypeScript) con capas DDD/Clean y pipes globales de validación.
- Prisma ORM sobre PostgreSQL para usuarios, productos, pedidos, idempotencia y auditoría.
- Redis 7 para cache, locks distribuidos, almacenamiento de idempotencia y estado de BullMQ.
- BullMQ para orquestar la sincronización con el ERP, reintentos y circuito de protección.
- Pino, OpenTelemetry y prom-client para logs estructurados, trazas y métricas.
- Swagger UI bilingüe (`/docs`) generada desde los DTOs y actualizada automáticamente.

## Módulos y responsabilidades

- `AuthModule`: registro, login, refresh y logout con política de contraseñas y rotación de refresh tokens.
- `ProductsModule`: catálogo público (`/products`) y mantenimiento administrativo en `/admin/products`.
- `CheckoutModule`: validación, reserva de stock, idempotencia y publicación en la cola.
- `OrdersModule`: seguimiento de pedidos para clientes (`/orders/:id`) y vista administrativa paginada (`/admin/orders`).
- `QueueModule`: configuración de la cola BullMQ, worker, simulador ERP y circuit breaker.
- `SharedModule`: locks Redis, rate limiting, telemetría, filtros y utilidades bilingües para Swagger.

## Endpoints HTTP

### Autenticación (`/api/v1/auth`)

- `POST /register` recibe `email` y contraseña fuerte, cifra credenciales y devuelve tokens de acceso/refresh junto al rol.
- `POST /login` autentica usuarios existentes y rota el refresh token persistido.
- `POST /refresh` emite un nuevo par de tokens invalidando el refresh anterior.
- `POST /logout` revoca el refresh activo y limpia fingerprints almacenados.
- Las respuestas incluyen metadatos de expiración para coordinar el refresh silencioso en el frontend.

### Catálogo (`/api/v1/products`)

- Admite `page`, `pageSize` y `search` con transformadores que validan y normalizan valores numéricos.
- Resultados se cachean en Redis (TTL definido por `PRODUCTS_CACHE_TTL_SECONDS`) y se invalidan tras cambios administrativos.
- Cada producto expone nombre, precio en centavos, SKU, stock, estado y URL de imagen opcional.

### Checkout (`/api/v1/checkout`)

- Requiere `Authorization: Bearer` con rol `CUSTOMER` y header `Idempotency-Key`.
- Payload: `productId` (UUID) y `quantity` (mínimo 1, máximo stock disponible).
- Flujo: busca respuesta idempotente → abre transacción en Postgres → adquiere lock `checkout:lock:${productId}` → reserva stock y crea pedido → encola trabajo en BullMQ → responde `201 Created`.
- Intentos duplicados responden `200 OK` con el payload almacenado. Errores mapeados: `400` (header faltante), `409` (stock), `422` (validación), `429` (throttling) y `503` (ERP indisponible).

### Seguimiento de pedidos (`/api/v1/orders/:id`)

- Disponible para el cliente dueño y para administradores mediante RBAC.
- Devuelve estado (`PENDING`, `PROCESSING`, `SUCCESS`, `FAILED`), historial de reintentos y último motivo de fallo.

### Catálogo administrativo (`/api/v1/admin/products`)

- Protegido por JWT + roles; sólo `ADMIN` puede operar.
- `GET` pagina productos con filtros de `search`, `page` y `pageSize` para el dashboard.
- `POST` crea productos con `name`, `description`, `sku`, `priceCents`, `stock`, `imageUrl` opcional y `isActive`.
- `GET /:id` devuelve el detalle completo; `PATCH /:id` actualiza campos; `DELETE /:id` desactiva el producto (soft delete).
- Cada mutación limpia la cache del catálogo público para mantener consistencia.

### Pedidos administrativos (`/api/v1/admin/orders`)

- Lista el backlog con paginación y filtros por `status`, `customerId`, `page` y `pageSize` (1–50).
- Entrega metadatos del pedido, estado en el ERP, timestamps y contadores de reintentos usados en el panel.

### Endpoints de plataforma

- `GET /api/v1/health` evalúa PostgreSQL y Redis en paralelo y responde `ok` o `degraded` según los componentes.
- `GET /api/v1/metrics` publica métricas Prometheus (latencia, ratio de errores, profundidad de cola, estado del circuito).
- `GET /docs` sirve Swagger con toggle PT/EN para revisión de contratos.

## Idempotencia y concurrencia

- Redis guarda respuestas en `checkout:idempotency:${key}` con TTL definido por `IDEMPOTENCY_TTL_SECONDS` (por defecto 600s).
- Locks `SET NX` por producto (`checkout:lock:${productId}`) serializan los decrementos de stock.
- Transacciones en Postgres garantizan atomicidad entre reserva de stock, creación del pedido y persistencia de idempotencia.

## Simulador ERP y colas

- Los pedidos se encolan en `erp-sync` inmediatamente tras reservar el stock.
- El simulador usa `ERP_SIMULATION_FAILURE_RATE`, `ERP_SIMULATION_MIN_DELAY_MS` y `MAX_DELAY_MS` para reproducir latencia y fallos.
- Cuando la tasa de error supera `CIRCUIT_BREAKER_FAILURE_THRESHOLD`, el circuito corta llamadas hasta que expira `CIRCUIT_BREAKER_RESET_TIMEOUT_MS`.
- Éxitos marcan `SUCCESS`; fallos definitivos registran `FAILED` con contexto para el dashboard.

## Seguridad y observabilidad

- Helmet, CORS y Nest Throttler refuerzan cabeceras seguras, control de orígenes y rate limiting.
- Secretos JWT, hosts de Redis/Postgres y límites viven en el `.env` compartido por los servicios.
- Pino adjunta `requestId`, usuario autenticado, Idempotency-Key y latency a cada log JSON.
- OpenTelemetry instrumenta el checkout y los workers de la cola, listo para exportar vía OTLP.
- Métricas Prometheus y el healthcheck respaldan los health checks de Docker y los smoke tests de CI.

## Persistencia y tooling

- Migraciones Prisma (`npm run prisma:migrate`) evolucionan el esquema; seeds cargan usuarios y productos de ejemplo.
- Scripts (`prisma:deploy`, `prisma:push`, `prisma:seed`) corren automáticamente en Docker y pueden ejecutarse manualmente durante el desarrollo.
