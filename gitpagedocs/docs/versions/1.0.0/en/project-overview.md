---
title: "Project overview"
description: "Context, identified problems, and goals covered by the Casecell Checkout Service."
---

# Project overview

## Context

CaseCellShop is a fictional retailer of phone cases. Hyper growth pushed daily traffic from thousands to millions, revealing multiple bottlenecks in the current landscape:

| Component | Current state |
| --- | --- |
| ERP Core | Monolith responsible for inventory, billing, finance, and accounting. Single source of truth, yet slow and rigid. |
| Web store | Reads catalog and stock directly from the ERP via synchronous REST, inheriting its latency and outages. |
| Database | MySQL owned by the ERP; external systems can only read. |
| Infrastructure | Private datacenter with limited elasticity. |
| Monitoring | Basic performance alerts, little per-order observability. |

## Pain points

1. **Storefront performance** – Product listing takes several seconds, losing customers at the very beginning of the journey.
2. **Inventory consistency** – Multiple customers can purchase the same item after stock hits zero, producing overselling.
3. **Checkout resilience** – Order creation depends on the ERP, which often times out, leading to failed purchases and lost revenue.

## Goal of this mini-project

Deliver a fullstack checkout flow that decouples critical journeys from the ERP, reduces latency, prevents overselling, and provides controlled user feedback even when external systems misbehave.

## Strategy

- **Dedicated APIs** in a NestJS backend for catalog and checkout.
- **Asynchronous ERP sync** via BullMQ queues and a configurable failure/latency simulator.
- **Transactional stock reservations** plus Redis distributed locks to block overselling.
- **Simple idempotency** backed by `Idempotency-Key` and Redis cache reuse.
- **Resilient frontend** built with Next.js 15, React Query, and clear status messaging for every scenario.
- **Observability first** using structured logs, Prometheus metrics, and OpenTelemetry spans.

## Outcome

- Storefront responses in milliseconds thanks to caching and pagination detached from the ERP.
- Checkout confirms orders even under instability, reusing responses for duplicate attempts.
- Users receive straightforward feedback for success, validation issues, low stock, or temporary failures, with safe retries.
- Documentation, tests, and automation (Docker) ready for incremental evolution.
