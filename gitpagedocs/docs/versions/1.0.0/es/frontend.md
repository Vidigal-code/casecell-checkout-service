---
title: "Front-end"
description: "Experiencia de usuario, flujo de compra y estrategias de UX aplicadas en el Casecell Checkout Service."
---

# Front-end

## Stack

- **Next.js 15** (App Router) con TypeScript.
- **Feature-Sliced Design (FSD)** para organizar escenas, widgets, features y entidades.
- **React Query** para cachear peticiones y gestionar loading states.
- **Redux Toolkit + redux-persist** para el carrito y preferencias.
- **Tailwind CSS** + **Framer Motion** para layouts responsivos y animaciones sutiles.

## Pantallas principales

1. **Inicio / Vitrina** (`HomeExperience`)
   - Listado paginado con búsqueda instantánea.
   - Skeletons y placeholders durante la carga.
   - Fallback visual y remoto para imágenes de productos.
   - Resumen lateral del producto seleccionado.

2. **Carrito y checkout**
   - Ajuste de cantidades validado contra inventario.
   - Resumen financiero en tiempo real.
   - Botón de compra con bloqueo anti doble clic (loading + disabled).

3. **Feedback de pedido**
   - Mensajes claros tras `POST /checkout` (éxito, validación, stock insuficiente, fallo temporal).
   - Opción de reintento cuando el fallo es transitorio.
   - Acceso directo al panel `/admin` para operadores.

4. **Panel administrativo** (`/admin`)
   - Filtros por estado con paginación server-side.
   - Badges localizadas (PT-BR) con colores significativos.
   - Página 404 personalizada con CTA dinámico.

## Estados de UX cubiertos

| Escenario | Comportamiento |
| --- | --- |
| Cargando | Skeletons, botones deshabilitados, texto de progreso. |
| Éxito | Mensaje verde, carrito limpio, link para seguir el pedido. |
| Error de validación | Indicaciones claras sobre campos requeridos o formatos inválidos. |
| Stock insuficiente | Alerta destacada con stock actual. |
| Fallo técnico | Mensaje amigable + opción de reintento. |
| Intento duplicado | Reutiliza la respuesta previa (misma idempotencia). |

## Accesibilidad y responsividad

- Breakpoints probados en móvil, tablet y desktop.
- `aria-labels` coherentes en formularios y botones icónicos.
- Alto contraste tipográfico para modo claro y oscuro.

## Internacionalización

- Copia principal en portugués brasileño.
- Secciones críticas duplicadas en inglés y español para evaluación.

## Pruebas y verificación

- Unit tests con Jest + React Testing Library en componentes clave.
- Guion manual e2e cubriendo vitrina, carrito y checkout.
- Linter (`npm run lint`) asegura estándares de código y accesibilidad básica.
