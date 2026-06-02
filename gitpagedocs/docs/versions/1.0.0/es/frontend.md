---
title: "Front-end"
description: "Experiencia, flujo de datos y panel administrativo del Casecell Checkout Service."
---

# Front-end

## Stack

- Next.js 15 (App Router) con TypeScript y soporte híbrido SSR/CSR.
- Feature-Sliced Design para mantener escenas, widgets, features y entidades desacopladas.
- React Query gestiona cache, sincronización y reintentos frente al backend.
- Redux Toolkit + redux-persist almacenan sesión de auth, carrito y preferencias.
- Cliente Axios con adjunción automática de JWT y rotación de refresh tokens vía interceptor.
- Tailwind CSS con tokens `brand`, tipografías Space Grotesk/Work Sans y animaciones Framer Motion.

## Destacados de arquitectura

- `src/app` contiene las rutas (home, login, register, cart, admin) enlazadas a escenas específicas.
- `scenes/` orquestan cada experiencia; `features/` encapsulan lógica de carrito, checkout, auth y tema.
- `shared/` unifica cliente HTTP, normalización de entorno, store, componentes UI y utilidades.
- `app/providers.tsx` inicializa Redux, persistencia, React Query y control de tema en un único punto.

## Pantallas principales

1. **Inicio / Vitrina** (`scenes/home/ui/home-experience.tsx`)
   - Hero comunica el valor del checkout resiliente con tarjetas animadas.
   - `ProductGrid` ofrece búsqueda, paginación, skeletons y fallback de imagen con resumen lateral.
   - Accesos rápidos para iniciar sesión o registrarse impulsan el flujo de compra.

2. **Carrito y checkout** (`scenes/cart/ui/cart-scene.tsx`)
   - Ítems persisten en localStorage, permiten ajustar cantidades limitadas por stock y muestran subtotales inmediatos.
   - La mutación de checkout recorre cada producto, envía la cabecera de idempotencia y muestra mensajes individuales.
   - Si no hay sesión, aparece una alerta y el botón de compra permanece deshabilitado.

3. **Flujos de autenticación** (`scenes/auth/ui`)
   - Login y registro aplican la política de contraseñas del backend y redirigen usuarios ya autenticados.
   - Inputs reutilizan componentes accesibles con etiquetas, helper text y errores inline.
   - Al autenticarse, los tokens/expiraciones se guardan en Redux y el interceptor gestiona el refresh silencioso.

4. **Panel administrativo** (`scenes/admin/ui/admin-dashboard.tsx`)
   - Guards de rol bloquean usuarios no administradores con feedback contextual.
   - Conmutador entre pedidos y catálogo usa paginación servidor + cache de React Query.
   - Modal de producto cubre alta/edición con vista previa de imagen y validaciones; desactivar realiza soft delete.

## Estado y flujo de datos

- Un único `QueryClient` (stale time 30s, retry 1) evita tormentas de peticiones en escenarios inestables.
- Slices de Redux (`auth`, `cart`) exponen selectores tipados; la persistencia asegura continuidad tras recargar.
- El interceptor Axios refresca tokens una sola vez por ráfaga 401, encolando peticiones hasta obtener un nuevo token.
- El helper de entorno normaliza URLs públicas/internas para SSR y CSR.

## Estados de UX cubiertos

| Escenario | Comportamiento |
| --- | --- |
| Cargando | Skeletons, placeholders con shimmer y botones deshabilitados. |
| Éxito | Mensajes positivos, carrito vaciado y links rápidos para rastrear pedidos. |
| Error de validación | Mensajes inline claros en formularios de checkout/auth. |
| Stock insuficiente | Alertas destacadas y límites estrictos por producto. |
| Fallo técnico | Mensajes amigables con opción de reintento incluso ante fallos del ERP. |
| Intento duplicado | Reutiliza la respuesta almacenada cuando se repite la `Idempotency-Key`. |
| Autenticación requerida | Banner de advertencia y CTA bloqueado hasta iniciar sesión. |
| Acceso restringido | El panel avisa y bloquea cuentas sin rol `ADMIN`. |

## Accesibilidad y responsividad

- Grillas responsivas cubren móvil, tablet y desktop; tablas administrativas permanecen desplazables con indicaciones claras.
- Componentes incluyen etiquetas aria, foco visible y alto contraste en ambos temas.
- Animaciones son sutiles (fade/translate) respetando preferencias de movimiento reducido.

## Internacionalización

- El contenido principal se mantiene en portugués brasileño para alinearse con el desafío.
- Swagger, documentación y mensajes críticos disponen de equivalentes en inglés/español para revisión.

## Pruebas y calidad

- Jest + React Testing Library cubren escenas y widgets clave con mocks de MSW.
- El lint (`npm run lint`) y TypeScript estricto mantienen el contrato con los tipos compartidos del backend.
- Guion manual valida extremo a extremo checkout, idempotencia y operaciones en el panel administrativo.
