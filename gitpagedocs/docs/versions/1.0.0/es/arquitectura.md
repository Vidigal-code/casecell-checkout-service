---
title: "Arquitectura y diseño"
description: "Componentes, flujos y decisiones que estructuran el Casecell Checkout Service."
---

# Arquitectura y diseño

## Vista macro

```
Cliente web → Next.js 15 (React Query + Redux) → API NestJS → PostgreSQL / Redis → Simulador ERP (BullMQ)
```

### Capas principales

- **Frontend (Next.js 15 / Feature-Sliced Design)**
  - Páginas orientadas a escenas (`scenes/`), widgets reutilizables y features aisladas.
  - React Query para cache de datos, suspense manual y estados de carga.
  - Redux Toolkit para carrito persistido y preferencias del usuario.
  - Tailwind CSS + Framer Motion para UI responsiva con animaciones sutiles.

- **Backend (NestJS 10)**
  - Organización DDD / Clean Architecture (`domain`, `application`, `infrastructure`, `presentation`).
  - Controladores HTTP bajo `/api/v1`, validados con `class-validator` y `class-transformer`.
  - Autenticación JWT con tokens de acceso/refresh y rotación automática.
  - Guards de roles (`CUSTOMER`, `ADMIN`) aplicados mediante decoradores y guards de Nest.
  - Prisma (PostgreSQL) para productos, pedidos y registros de idempotencia.
  - Redis para locks, cache de vitrina, almacenamiento de idempotencia y colas BullMQ.
  - Swagger bilingüe (`/docs`) sincronizado con los DTOs y casos de uso.

- **Cola y simulador del ERP**
  - BullMQ procesa sincronizaciones asíncronas con el ERP.
  - Simulador configurable produce latencia y fallas intermitentes para probar resiliencia.
  - Circuit breaker protege de sobrecarga cuando el ERP se mantiene inestable.

## Flujos críticos

1. **Catálogo**
   - `GET /products` consulta PostgreSQL con paginación, búsqueda y cache Redis.
   - DTOs transforman parámetros (`page`, `pageSize`) en enteros seguros.

2. **Checkout**
   - `POST /checkout` valida payload (producto, cantidad, header de idempotencia, cliente opcional).
   - Transacción en Postgres reserva stock, crea el pedido y encola el job BullMQ.
   - Locks Redis (`SET NX`) protegen el decremento de stock bajo concurrencia.
   - Idempotencia devuelve la respuesta previa para la misma `Idempotency-Key`.

3. **Sincronización ERP**
   - Worker BullMQ consume pedidos pendientes.
   - El simulador devuelve éxito, fallo temporal o error final.
   - Retries con backoff actualizan estados (`PENDING`, `PROCESSING`, `SUCCESS`, `FAILED`).

## Seguridad y gobernanza

- `.env` único en la raíz compartido por backend y frontend.
- Helmet + rate limiting protegen la API.
- CORS configurable mediante variables (orígenes, headers, métodos permitidos).
- Logs estructurados (Pino) con correlación por `Request-Id`.
- Secretos JWT centralizados en `.env`, rotación de refresh tokens y rate limiting parametrizado.

## Observabilidad

- **/metrics** expone métricas Prometheus (latencia, tasa de error, salud de la cola).
- **OpenTelemetry** rastrea spans de checkout y del worker ERP.
- **Logs** en JSON enriquecido, listos para pipelines ELK/Loki.

## Evolución prevista

- CDC/streaming desde el ERP para mantener el stock replicado en near real time.
- Rate limiting por usuario o cuenta.
- Dashboard para operadores con KPIs de conversión y SLA en tiempo real.
