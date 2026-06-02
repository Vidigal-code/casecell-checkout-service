---
title: "Parte 1.A — Perguntas conceituais"
description: "Respostas escritas exigidas na parte teórica do desafio CaseCellShop."
---

# Parte 1.A — Perguntas conceituais

> Estas respostas foram entregues junto ao código conforme solicitado no desafio.

1. **Como reduzir a dependência direta do ERP na loja virtual?**
   - Introduzindo uma camada intermediária (Checkout Service) que consome dados do ERP de forma assíncrona, expõe APIs próprias e mantém estoque/ pedidos em um banco dedicado.

2. **Como garantir consistência de estoque sob alta concorrência?**
   - Usando reservas transacionais no banco relacional combinadas com locks distribuídos em Redis e validações no domínio, impedindo múltiplos abatimentos simultâneos.

3. **Como lidar com um ERP instável ou lento durante o checkout?**
   - Persistindo o pedido imediatamente e offloading da sincronização para uma fila BullMQ com retries, circuito de proteção e monitoramento, evitando que o cliente espere o ERP.

4. **Qual estratégia simples de idempotência foi adotada?**
   - Exigimos o header `Idempotency-Key`, salvamos a resposta em Redis e retornamos o mesmo payload para tentativas subsequentes com a mesma chave.

5. **Como organizar o código para evoluir com segurança?**
   - Aplicando DDD/Clean Architecture, separando camadas de domínio, aplicação, infraestrutura e apresentação, e expondo portas claras para integrações externas.

6. **Quais próximos passos recomendados para produção?**
   - CDC de estoque e catálogo, observabilidade distribuída completa, fila de compensação, rate limiting por conta e dashboards de conversão/ SLA.
