## Context

`SearchCourses.tsx` (client component, en `src/app/page.tsx`) ya implementa debounce (500ms) y consumo de `POST /api/courses/search`, mostrando resultados completos inline en la home. La `Navbar` (`src/components/Navbar.tsx`) es un client component presente en todas las páginas salvo `/agente-edy`, y ya observa `auth.onAuthStateChange()`. No existe hoy ningún mecanismo para iniciar una búsqueda fuera de la home.

## Goals / Non-Goals

**Goals:**
- Exponer un campo de búsqueda en la Navbar, funcional en cualquier página.
- Mostrar autocompletado (hasta 5 sugerencias) tras 2+ caracteres, con debounce.
- Al enviar la búsqueda (Enter/clic lupa), navegar a la home con el término en la URL y mostrar resultados filtrados ahí.
- Clic en una sugerencia navega directo al curso.
- No duplicar la lógica de fetch/embedding: reusar `POST /api/courses/search` sin cambios de contrato.

**Non-Goals:**
- No se implementa un dropdown de resultados "en tiempo real" como página de resultados alterna (la historia permite elegir entre dropdown o redirección; se opta por redirección a home + dropdown de autocompletado combinados).
- No se rediseña `SearchCourses.tsx` de la home; solo se le añade soporte para precargar desde `?q=`.
- No se agregan nuevos índices ni cambios en RLS/DB — el RPC `search_courses_by_embedding` y el fallback de texto ya filtran por `estado = 'published'`.

## Decisions

1. **Nuevo componente `NavbarSearch.tsx`** en vez de reutilizar `SearchCourses.tsx` directamente.
   - Razón: `SearchCourses.tsx` renderiza resultados completos como tarjetas grandes, pensado para la home; la Navbar necesita un input compacto + dropdown ligero de sugerencias (solo título/precio). Compartir el fetch pattern (debounce, llamada a `/api/courses/search`) pero no el markup de resultados.
   - Alternativa descartada: parametrizar `SearchCourses` con un modo "compacto" — se descarta porque mezclaría dos responsabilidades de UI (página completa vs. dropdown flotante) en un solo componente, complicando el mantenimiento.

2. **Autocompletado reusa `POST /api/courses/search` con `limit=5`**, sin nuevo parámetro `suggest`.
   - Razón: el endpoint ya soporta `limit` y devuelve los campos necesarios (`id`, `titulo`, `precio`). No se requiere un modo servidor distinto; la sola limitación de `limit=5` en el cliente basta para HU2.
   - Alternativa descartada: crear `?suggest=true` como sugiere la nota técnica original — se descarta por ser innecesario dado que `limit` ya acota el resultado y no hay diferencia de comportamiento server-side requerida.

3. **Redirección vía query param `?q=`** en vez de dropdown de resultados completos en la propia Navbar.
   - Razón: la home ya tiene la superficie completa de resultados (`SearchCourses`), evita duplicar UI de tarjetas de resultados en la Navbar (que no tiene espacio para eso) y es coherente con "Buscador de la Navbar" + "resultados en la home" que sugiere el escenario 2 de HU1.
   - Home (`src/app/page.tsx`, server component) lee `searchParams.q` y, si existe, lo pasa como prop `initialQuery` a `SearchCourses`, que dispara la búsqueda automáticamente al montar.

4. **Debounce de 300ms para el autocompletado** (vs. 500ms de `SearchCourses`).
   - Razón: el autocompletado es una interacción más rápida/ligera (sugerencias de título) donde se prioriza la respuesta ágil frente a home, que ejecuta una búsqueda más "pesada" (resultados completos).

5. **Cierre del dropdown**: clic fuera del componente, tecla Escape, o navegación (clic en sugerencia / submit) lo cierran. Se implementa con un `ref` + listener de `mousedown` en `document`, patrón estándar ya usado implícitamente en otros componentes cliente del proyecto.

## Risks / Trade-offs

- [Riesgo] Dos componentes (`SearchCourses` y `NavbarSearch`) llaman al mismo endpoint con lógica de debounce/fetch similar, lo que introduce cierta duplicación → Mitigación: mantener el duplicado mínimo (solo el patrón fetch+debounce, ~15 líneas); no se justifica una abstracción compartida para dos usos con UI tan distinta, evitando una capa de indirección prematura.
- [Riesgo] Si el `NavbarSearch` dispara requests en cada tecla tras 2 caracteres en páginas de alto tráfico, aumenta la carga sobre `/api/courses/search` (que ya llama a una Edge Function de embeddings) → Mitigación: debounce de 300ms limita la frecuencia; el límite `limit=5` reduce el costo de cada request.
- [Riesgo] La navegación a `/?q=` desde una página profunda (ej. lección) implica una recarga completa fuera del contexto actual → Mitigación: es el comportamiento esperado por la historia (Escenario 2 de HU1 permite explícitamente la redirección a la home).

## Migration Plan

No aplica migración de datos. Cambio puramente de frontend (componentes + un `searchParams` nuevo en la home). Deploy estándar vía el flujo CI/CD existente (lint → test → e2e → Vercel prod).

## Open Questions

Ninguna pendiente: las decisiones de diseño (dropdown de sugerencias + redirección a home) cubren ambos escenarios opcionales planteados en la historia de usuario.
