---
title: "Visión general del case"
description: "Resumen del contexto, problemas y objetivos cubiertos por el Casecell Checkout Service."
---

# Visión general del case

## Contexto

CaseCellShop es una minorista ficticia de fundas para celulares. El hipercrecimiento multiplicó el tráfico diario de miles a millones y expuso limitaciones críticas en la arquitectura actual:

| Componente | Situación actual |
| --- | --- |
| ERP Central | Monolito que concentra inventario, facturación, finanzas y contabilidad. Única fuente de verdad, pero lenta y rígida. |
| Tienda virtual | Consulta inventario y precios directamente del ERP vía REST síncrono, heredando su latencia e indisponibilidad. |
| Base de datos | MySQL administrado por el ERP; solo se permite lectura para sistemas externos. |
| Infraestructura | Datacenter propio con baja elasticidad. |
| Monitoreo | Alertas básicas, poca trazabilidad por pedido o solicitud. |

## Problemas identificados

1. **Performance de la vitrina** – La lista de productos demora varios segundos y frustra a los clientes desde el inicio.
2. **Consistencia de inventario** – El ERP permite finalizar compras incluso cuando el stock ya está agotado, generando overselling.
3. **Resiliencia del checkout** – La creación del pedido depende del ERP, que suele tardar o fallar, provocando timeouts y pérdidas de venta.

## Objetivo del mini proyecto

Construir un flujo fullstack de checkout que desacople las jornadas críticas del ERP, reduzca la latencia, evite ventas superiores al stock y mantenga la experiencia del cliente bajo control incluso ante fallas externas.

## Estrategia adoptada

- **APIs propias** en el backend (NestJS) para vitrina y checkout.
- **Sincronización asíncrona** con el ERP mediante colas BullMQ y un simulador de demoras/fallas.
- **Reservas transaccionales de inventario** más locks distribuidos en Redis para impedir overselling.
- **Idempotencia simple** basada en el header `Idempotency-Key` y cacheo en Redis.
- **Frontend resiliente** con Next.js 15, React Query y mensajes claros para cada estado.
- **Observabilidad** con logs estructurados, métricas Prometheus y spans OpenTelemetry.

## Resultado

- La vitrina responde en milisegundos gracias al cache y paginación independientes del ERP.
- El checkout confirma pedidos incluso con inestabilidad externa y reutiliza respuestas ante intentos duplicados.
- Los usuarios reciben mensajes claros para éxito, validación, stock insuficiente y fallas temporales, con posibilidad de retry seguro.
- Documentación, pruebas y automatización (Docker) listas para una evolución incremental.
