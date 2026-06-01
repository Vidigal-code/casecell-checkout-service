---
title: "Parte 1.A — Preguntas conceptuales"
description: "Respuestas escritas exigidas en la sección teórica del desafío CaseCellShop."
---

# Parte 1.A — Preguntas conceptuales

> Estas respuestas se entregaron junto al código, tal como solicitó el desafío.

1. **¿Cómo reducir la dependencia directa del ERP en la tienda?**
   - Introduciendo un Checkout Service intermedio que consume datos del ERP de forma asíncrona, expone APIs propias y mantiene stock/pedidos en su propia base.

2. **¿Cómo garantizar consistencia de stock bajo alta concurrencia?**
   - Usando reservas transaccionales en la base relacional combinadas con locks distribuidos en Redis y reglas de dominio que evitan decrementos paralelos.

3. **¿Cómo manejar un ERP lento o inestable durante el checkout?**
   - Persistiendo el pedido inmediatamente y delegando la sincronización a una cola BullMQ con retries, circuit breaker y observabilidad, evitando que el cliente espere al ERP.

4. **¿Qué estrategia simple de idempotencia se implementó?**
   - Exigir el header `Idempotency-Key`, almacenar la respuesta en Redis y devolver el mismo payload para intentos futuros con la misma clave.

5. **¿Cómo se organiza el código para evolucionar con seguridad?**
   - Aplicando DDD / Clean Architecture, separando dominio, aplicación, infraestructura y presentación, y definiendo puertos claros para integraciones externas.

6. **¿Qué próximos pasos se recomiendan para producción?**
   - CDC del ERP para stock/catálogo, observabilidad distribuida completa, colas de compensación, rate limiting por cuenta y dashboards de conversión/SLA.
