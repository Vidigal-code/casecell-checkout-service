---
title: "Calidad y operaciones"
description: "Configuración, ejecución, pruebas y observabilidad del Casecell Checkout Service."
---

# Calidad y operaciones

## Requisitos previos

- Node.js 20+
- npm 9+
- Docker Desktop para levantar base, cache y servicios con un solo comando

## Configuración de entorno

1. Copiar la plantilla en la raíz del repo:
   ```bash
   cp envexample.txt .env
   ```
2. Revisar las variables esenciales antes de ejecutar:
   - `DATABASE_URL`, `TEST_DATABASE_URL` y los valores `POSTGRES_*`
   - `REDIS_HOST`, `REDIS_PORT`
   - Secretos JWT (`JWT_ACCESS_TOKEN_SECRET`, `JWT_REFRESH_TOKEN_SECRET`) y expiraciones
   - Parámetros del simulador (`ERP_SIMULATION_FAILURE_RATE`, `ERP_SIMULATION_MIN_DELAY_MS`, `ERP_SIMULATION_MAX_DELAY_MS`)
   - `IDEMPOTENCY_TTL_SECONDS`, `PRODUCTS_CACHE_TTL_SECONDS`, límites de rate limiting
   - `NEXT_PUBLIC_API_BASE_URL`, `INTERNAL_API_BASE_URL`, `NEXT_PUBLIC_DEFAULT_THEME`

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

Servicios disponibles:

- API REST + auth: <http://localhost:3001/api/v1>
- Swagger bilingüe: <http://localhost:3001/docs>
- Métricas Prometheus: <http://localhost:3001/metrics>
- Health check: <http://localhost:3001/api/v1/health>

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Vitrina y panel admin: <http://localhost:3000>

## Workflow con Docker

```bash
docker compose up --build
```

- Provisiona PostgreSQL, Redis, backend y frontend reutilizando el `.env` compartido.
- El contenedor del backend ejecuta `prisma migrate deploy`, `prisma db push` y `prisma db seed` antes de iniciar.
- Para ejecutar los perfiles de prueba dentro de los contenedores:
  ```bash
  docker compose --profile test up --build backend-tests frontend-tests
  ```

## Pruebas automatizadas

| Alcance | Comando |
| --- | --- |
| Backend completo | `npm test` |
| Backend unitario | `npm run test:unit` |
| Backend integración | `npm run test:integration` |
| Backend e2e | `npm run test:e2e` |
| Frontend completo | `npm test` |
| Frontend unitario | `npm run test:unit` |
| Frontend integración | `npm run test:integration` |
| Frontend e2e | `npm run test:e2e` |

> Antes de lanzar las pruebas del backend, asegúrate de que PostgreSQL esté arriba (`docker compose up -d postgres`) y que `TEST_DATABASE_URL` apunte a `casecell_test`.

## Observabilidad y operaciones

- **Logs**: Pino genera JSON con `requestId`, usuario autenticado, Idempotency-Key y duración (logging a archivo controlado por `LOG_FILE_*`).
- **Métricas**: `/api/v1/metrics` publica histograma de latencia, ratio de errores, profundidad de cola y estado del circuito.
- **Health**: `/api/v1/health` distingue `ok` vs `degraded`, exponiendo la salud de PostgreSQL y Redis para los health checks de Docker.
- **Tracing**: OpenTelemetry instrumenta handlers de checkout y workers de la cola, listo para exportar vía OTLP.
- **Swagger**: `/docs` refleja los contratos PT/EN; ejecuta `npm run build` tras modificar DTOs para mantenerlo alineado.

## Guion de validación manual

1. Abrir la vitrina, validar animaciones, skeletons y búsqueda responsiva.
2. Agregar productos al carrito, probar límites de stock y persistencia tras recargar.
3. Autenticarse con el usuario seed, ejecutar el checkout dos veces con la misma `Idempotency-Key` y comprobar la respuesta duplicada.
4. Ingresar a `/admin`, filtrar pedidos, desactivar/reactivar un producto y confirmar el cambio en el catálogo público.
5. Revisar `/api/v1/metrics` y los logs para confirmar visibilidad de la simulación ERP.

## Próximos pasos sugeridos

- Automatizar regresiones end-to-end con Playwright o Cypress.
- Configurar pipeline CI (GitHub Actions) con lint, pruebas y build Docker en cada PR.
- Publicar dashboards Grafana usando métricas Prometheus y alarmas para circuito/colas.
