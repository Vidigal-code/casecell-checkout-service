---
title: "Part 1.A — Conceptual answers"
description: "Written answers required by the theoretical section of the CaseCellShop challenge."
---

# Part 1.A — Conceptual answers

> These answers were delivered together with the code, as requested by the challenge.

1. **How to reduce direct ERP dependency for the storefront?**
   - Introduce an intermediate Checkout Service that reads ERP data asynchronously, exposes dedicated APIs, and keeps stock/orders in its own database.

2. **How to guarantee stock consistency under high concurrency?**
   - Use transactional reservations in the relational database combined with Redis distributed locks and domain safeguards, preventing parallel decrements.

3. **How to handle a slow or unstable ERP during checkout?**
   - Persist the order immediately and move the ERP synchronization to a BullMQ queue with retries, circuit breaker, and observability so the customer is not blocked.

4. **Which simple idempotency strategy was implemented?**
   - Require an `Idempotency-Key` header, store the response in Redis, and replay the same payload for future attempts with the same key.

5. **How is the code organized for safe evolution?**
   - By applying DDD/Clean Architecture, splitting domain, application, infrastructure, and presentation layers, and exposing clear ports for external integrations.

6. **What next steps are recommended for production?**
   - ERP CDC for stock/catalog, full distributed observability, compensation queues, per-account rate limiting, and conversion/SLA dashboards.
