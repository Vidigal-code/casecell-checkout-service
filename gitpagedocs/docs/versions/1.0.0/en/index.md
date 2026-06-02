---
title: "Casecell Checkout Service"
description: "Official documentation for the fullstack mini-project delivered for the CaseCellShop technical challenge."
---

# Casecell Checkout Service

Welcome to the official documentation of the solution submitted for the **CaseCellShop Technical Challenge — Mid-level (Fullstack)**. This portal consolidates the entire solution: business context, architecture decisions, APIs, user experience, quality strategy, and conceptual answers.

## How to use this guide

- **Project overview**: explains the company’s pains and how the solution addresses them.
- **Architecture & design**: presents the responsibilities split across frontend, backend, database, cache, and ERP simulator.
- **Back-end**: details the endpoints, validations, idempotency layer, and failure simulation.
- **Front-end**: highlights how the storefront, cart, and checkout deliver a responsive and resilient UX.
- **Quality & operations**: covers run commands, environment variables, Docker setup, and observability.
- **Conceptual answers (Part 1.A)**: stores the mandatory written answers for the challenge.

> ℹ️ All sections are available both in **Portuguese** and **English**. Use the language switcher to change the locale.

## Public repository

Source code: <https://github.com/Vidigal-code/casecell-checkout-service>

## Quick facts

- **Stack**: NestJS, Prisma, PostgreSQL, Redis, BullMQ, Next.js 15, React Query, Tailwind CSS.
- **Goal**: deliver a resilient checkout flow, decoupled from the ERP, preventing overselling and preserving user trust.
- **Deliverable**: complete APIs, production-like frontend, bilingual docs, automated tests, and Docker scripts.

Ready to dive in? Head to the “Project overview” section.
