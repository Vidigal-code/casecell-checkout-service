---
title: "Casecell Checkout Service"
description: "Documentación oficial del mini proyecto fullstack entregado para el desafío técnico CaseCellShop."
---

# Casecell Checkout Service

Bienvenido a la documentación oficial de la solución presentada en el **Desafío Técnico CaseCellShop — Nivel Pleno (Fullstack)**. Este portal reúne todo el material del proyecto: contexto del case, decisiones de arquitectura, APIs, experiencia de usuario, calidad y respuestas conceptuales.

## Cómo usar esta guía

- **Visión general del case**: explica los dolores de la empresa y cómo la solución los aborda.
- **Arquitectura y diseño**: detalla la separación de responsabilidades entre frontend, backend, base de datos, caché y simulador del ERP.
- **Back-end**: describe endpoints, validaciones, idempotencia y simulación de fallos.
- **Front-end**: muestra cómo la vitrina, el carrito y el checkout mantienen una UX responsiva y resiliente.
- **Calidad y operaciones**: incluye comandos de ejecución, variables de entorno, Docker y observabilidad.
- **Respuestas conceptuales (Parte 1.A)**: registra las respuestas escritas obligatorias del desafío.

> ℹ️ Todo el contenido está disponible en **portugués**, **inglés** y **español**. Usa el selector de idioma para cambiar la vista.

## Repositorio público

Código fuente: <https://github.com/Vidigal-code/casecell-checkout-service>

## Datos rápidos

- **Stack**: NestJS, Prisma, PostgreSQL, Redis, BullMQ, Next.js 15, React Query, Tailwind CSS.
- **Objetivo**: entregar un flujo de checkout resiliente, desacoplado del ERP, evitando overselling y preservando la confianza del usuario.
- **Entrega**: APIs completas, frontend listo para producción, documentación multilingüe, tests automatizados y scripts Docker.

¿Listo para comenzar? Continúa con la sección “Visión general del case”.
