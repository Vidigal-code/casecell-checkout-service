---
title: "Back-end"
description: "Endpoints, validaciones, idempotencia y simulación de ERP del Casecell Checkout Service."
---

# Back-end

## Stack

- **NestJS 10** con TypeScript y módulos independientes.
- **Prisma ORM** para interactuar con PostgreSQL.
- **Redis** para cache, locks distribuidos e idempotencia.
- **BullMQ** para orquestar sincronizaciones con el ERP.
- **Pino** para logs estructurados en JSON.

## Módulos clave

- `ProductsModule`: catálogo, búsqueda y cache Redis.
- `CheckoutModule`: validación, reserva de stock e idempotencia.
- `OrdersModule`: endpoint de estado (`GET /orders/:id`).
- `QueueModule`: configuración BullMQ + simulador ERP.
- `SharedModule`: providers reutilizables (locks, transformadores, interceptores).

## Endpoints HTTP

### `GET /api/v1/products`

- **Parámetros**: `page`, `pageSize`, `search`.
- **Transformers**: convierten strings a enteros con fallback seguro.
- **Cache**: resultados paginados guardados en Redis con TTL configurable.
- **Respuesta**:
  ```json
  {
    "data": [{"id": "...", "name": "...", ...}],
    "page": 1,
    "pageSize": 10,
    "total": 42
  }
  ```

### `POST /api/v1/checkout`

- **Header obligatorio**: `Idempotency-Key`.
- **Payload**:
  ```json
  {
    "productId": "uuid",
    "quantity": 2,
    "customerEmail": "opcional"
  }
  ```
- **Validaciones**: producto activo, cantidad ≥ 1 y ≤ stock, idempotencia presente.
- **Flujo**:
  1. Revisa si la clave ya tiene respuesta almacenada.
  2. Abre transacción en Postgres.
  3. Aplica lock Redis (`checkout:lock:${productId}`) para el decremento.
  4. Reserva stock y crea pedido (`status = PENDING`).
  5. Encola job BullMQ para sincronizar con el ERP.
  6. Retorna HTTP 202 con resumen del pedido.
- **Errores**: `400` validación, `409` stock insuficiente, `422` idempotencia ausente, `500` fallo técnico.

### `GET /api/v1/orders/:id`

- Devuelve estado del pedido (`PENDING`, `PROCESSING`, `SUCCESS`, `FAILED`) y notas de reintentos.

## Idempotencia

- Clave `checkout:idempotency:${key}` en Redis.
- Guarda payload, status HTTP y cuerpo.
- TTL por defecto: 24h.
- Previene doble envío ante reintentos, recargas o glitches de red.

## Simulador ERP

- Variables (`ERP_SIMULATION_FAILURE_RATE`, delays min/máx) controlan comportamiento.
- Cada job puede resultar en éxito inmediato, fallo temporal (retry con backoff) o fallo definitivo.
- Circuit breaker corta peticiones cuando la tasa de error supera el umbral.

## Logs y métricas

- `Request-Id` en cada solicitud y respuesta.
- **/metrics** expone contadores Prometheus (latencia, tasas de error, profundidad de cola).
- Logs JSON incluyen ruta, usuario opcional e Idempotency-Key.
