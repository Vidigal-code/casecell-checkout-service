---
title: "Calidad y operaciones"
description: "Ejecución, variables de entorno, pruebas y observabilidad del Casecell Checkout Service."
---

# Calidad y operaciones

## Requisitos previos

- Node.js 20+
- npm 9+
- Docker y Docker Compose (opcional pero recomendado)
- Redis y PostgreSQL locales o via Docker

## Configuración de entorno

1. Copiar plantilla:
   ```bash
   cp envexample.txt .env
   ```
2. Ajustar variables clave:
   - `DATABASE_URL`, `TEST_DATABASE_URL`
   - `REDIS_HOST`, `REDIS_PORT`
   - `NEXT_PUBLIC_API_BASE_URL`, `INTERNAL_API_BASE_URL`
   - Parámetros del simulador ERP (`ERP_SIMULATION_*`)
   - Secretos JWT y expiraciones de tokens

## Ejecución local

### Backend

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

Servicios:

- API REST: <http://localhost:3001/api/v1>
- Swagger PT/EN: <http://localhost:3001/docs>
- Métricas Prometheus: <http://localhost:3001/metrics>

### Frontend

```bash
cd frontend
npm install
npm run dev
```

UI: <http://localhost:3000>

## Workflow con Docker

```bash
docker compose up --build
```

Levanta PostgreSQL, Redis, backend y frontend en un único comando.

## Pruebas automatizadas

| Alcance | Comando |
| --- | --- |
| Backend (todos) | `npm test` |
| Backend unitario | `npm run test:unit` |
| Backend integración | `npm run test:integration` |
| Backend e2e | `npm run test:e2e` |
| Frontend (todos) | `npm test` |
| Frontend unitario | `npm run test:unit` |
| Frontend integración | `npm run test:integration` |
| Frontend e2e | `npm run test:e2e` |

> Antes de ejecutar pruebas del backend, inicia PostgreSQL de test (`docker compose up -d postgres`) y verifica que `TEST_DATABASE_URL` apunte a `casecell_test`.

## Observabilidad

- **Logs**: JSON con `requestId`, usuario (opcional) e Idempotency-Key.
- **Métricas**: latencia del checkout, ratios de error, profundidad de colas BullMQ.
- **Tracing**: spans OpenTelemetry para cada paso del checkout y del worker ERP.

## Guion de validación manual

1. Abrir la vitrina, revisar skeletons y fallback de imágenes.
2. Agregar productos al carrito, variar cantidades hasta el límite de stock.
3. Ejecutar checkout varias veces para probar idempotencia (misma clave) y fallas temporales.
4. Seguir el pedido en `/admin` y en `/orders/:id`.
5. Revisar métricas y logs para asegurar trazabilidad.

## Próximos pasos sugeridos

- Automatizar e2e con Playwright.
- Configurar pipeline CI con lint, tests y build Docker.
- Añadir dashboards para colas y métricas (Grafana/Tempo/Loki).
