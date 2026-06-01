---
title: "Visão geral do case"
description: "Resumo do contexto, problemas e objetivos atendidos pelo Casecell Checkout Service."
---

# Visão geral do case

## Contexto

A CaseCellShop é uma varejista fictícia especializada em capinhas para celular. O crescimento acelerado elevou o volume de acessos diários de milhares para milhões, expondo limitações graves na arquitetura atual:

| Componente | Situação atual |
| --- | --- |
| ERP Central | Monolito que concentra estoque, faturamento, financeiro e contábil. Único ponto de verdade, mas rígido e lento. |
| Loja virtual | Consome estoque e preços diretamente do ERP via REST síncrono, herdando a latência e indisponibilidade. |
| Banco de dados | MySQL controlado pelo ERP; só leitura é permitida para sistemas externos. |
| Infraestrutura | Datacenter próprio com baixa elasticidade. |
| Monitoramento | Alertas básicos, pouca rastreabilidade por pedido ou requisição. |

## Problemas identificados

1. **Performance da vitrine** – A listagem de produtos demora vários segundos, frustrando clientes logo na entrada.
2. **Consistência de estoque** – O ERP permite que vários clientes finalizem a compra mesmo sem estoque real, causando overselling.
3. **Resiliência do checkout** – A geração de pedidos depende do ERP, que frequentemente demora ou falha, provocando timeouts e perda de vendas.

## Objetivo do mini‑projeto

Construir um fluxo fullstack de checkout que desacople as jornadas críticas do ERP, reduza latência, impeça vendas além do estoque e mantenha a experiência do cliente sob controle mesmo em cenários de falha.

## Estratégia adotada

- **APIs próprias** no backend (NestJS) para vitrine e checkout.
- **Sincronização assíncrona** com o ERP através de filas BullMQ e simulador de demora/falhas.
- **Reserva transacional de estoque** + locks distribuídos em Redis para impedir overselling.
- **Idempotência simples** baseada em `Idempotency-Key` e cache Redis.
- **Frontend resiliente** com Next.js 15, React Query e feedbacks claros para cada estado.
- **Observabilidade** com logs estruturados, métricas Prometheus e spans OpenTelemetry.

## Resultado

- Vitrine responde em milissegundos com cache e paginação independente do ERP.
- Checkout confirma pedidos mesmo sob instabilidade externa, reapresentando tentativas duplicadas.
- Usuários recebem mensagens claras para sucesso, validação, estoque insuficiente e falhas temporárias, com possibilidade de retry seguro.
- Documentação, testes e automação (Docker) prontos para evolução incremental.
