# Flujo de diseño y entrega del proyecto

Este documento describe el flujo end-to-end del proyecto, desde que surge una necesidad (historia de usuario) hasta que queda desplegada en producción.

```
Historia de usuario / idea
        │
        ▼
   OpenSpec: /opsx:propose
   (proposal.md + design.md + specs delta + tasks.md)
        │
        ▼
   Revisión humana del proposal
        │
        ▼
   OpenSpec: /opsx:apply
   (implementación tarea por tarea, checklist en tasks.md)
        │
        ▼
   Código + tests (Vitest) + tests e2e (Playwright)
        │
        ▼
   Hook local (Claude Code, evento Stop)
   scripts/verify-flow.ps1 → lint + test:run
     - si falla: bloquea y Claude corrige (máx. 3 intentos)
     - si tras 3 intentos sigue fallando: avisa en el chat
        │
        ▼
   git commit → push a rama / PR hacia main
        │
        ▼
   GitHub Actions (.github/workflows/ci.yml)
     1. checkout + setup-node 24
     2. verifica secrets de Supabase
     3. npm ci
     4. npm run lint            ← gate 1
     5. npm run test:run        ← gate 2 (Vitest)
     6. npm run test:e2e        ← gate 3 (Playwright)
     7. si todo pasa → deploy a Vercel (prod)
        │
        ▼
   Vercel (producción, dominio público)
        │
        ▼
   OpenSpec: /opsx:archive
   (mueve el change a openspec/changes/archive/,
    sincroniza specs delta → openspec/specs/)
```

## 1. Historias de usuario / necesidad de negocio

El punto de partida es una necesidad concreta (feature, fix, mejora). No hay un backlog formal separado: la necesidad se convierte directamente en un **change** de OpenSpec.

## 2. OpenSpec — diseño spec-driven

El repo usa [OpenSpec](openspec/config.yaml) (`schema: spec-driven`) como capa de diseño antes de tocar código. Vive en [openspec/](../openspec).

- **`/opsx:propose`** — a partir de una descripción de lo que se quiere construir, genera en un solo paso:
  - `proposal.md` — *Why*, *What Changes*, *Capabilities* (nuevas/modificadas), *Impact* (archivos, migraciones, endpoints afectados). Ver ejemplo real: [openspec/changes/lesson-progress-tracking/proposal.md](../openspec/changes/lesson-progress-tracking/proposal.md).
  - `design.md` — decisiones técnicas y trade-offs.
  - `specs/` (delta) — requisitos formales nuevos/modificados por capability.
  - `tasks.md` — checklist de implementación.
- **`/opsx:explore`** (opcional) — modo de pensamiento libre para investigar el problema antes de proponer, cuando el requisito no está claro.
- Revisión humana del proposal antes de escribir código: se valida el *qué* y el *por qué* antes del *cómo*.
- **`/opsx:apply`** — implementa las tareas de `tasks.md` una por una, marcando el checklist a medida que avanza.
- **`/opsx:sync`** — sincroniza las specs delta del change hacia `openspec/specs/` (specs "vivas" del proyecto) sin archivar, útil si se necesita reflejar avance parcial.
- **`/opsx:archive`** — al terminar la implementación, archiva el change en `openspec/changes/archive/` y confirma la sincronización final de specs.

Este flujo deja un rastro auditable: cada feature tiene su proposal, su diseño y sus specs versionados en el repo, independientemente del código.

## 3. Implementación

Con `tasks.md` como guía, se implementa siguiendo la arquitectura del proyecto (ver [CLAUDE.md](../CLAUDE.md)):

- Next.js 15 App Router (Server/Client Components)
- Supabase (Postgres + Auth), **RLS como única fuente de autorización**
- Migraciones en `supabase/migrations/`, en orden
- Rutas API delegan permisos a RLS, nunca los reimplementan

## 4. Calidad local — automatizada con un hook

Antes se corría a mano; ahora hay un **hook `Stop` de Claude Code** ([.claude/settings.json](../.claude/settings.json)) que se dispara automáticamente al terminar cada turno y ejecuta [scripts/verify-flow.ps1](../scripts/verify-flow.ps1):

1. Si no hay cambios sin commitear en `src/` o `supabase/migrations/`, no hace nada (evita gastar tiempo).
2. Si los hay, corre `npm run lint` y `npm run test:run` (los mismos gates 1 y 2 de CI; el e2e se deja solo para CI por ser lento).
3. **Si algo falla**: bloquea el turno (exit code 2) y devuelve el error a Claude, que debe corregirlo. El intento se cuenta en `.claude/verify-state.json` (efímero, en `.gitignore`).
4. **Reintentos**: hasta 3 intentos consecutivos. Si Claude corrige el problema, el contador se resetea a 0 en la siguiente ejecución exitosa.
5. **Si al tercer intento sigue fallando**: el hook deja de bloquear, resetea el contador y deja un mensaje explícito (`No se pudo resolver ... tras 3 intentos`) para que Claude lo comunique al usuario en el propio chat.

Para correr los gates manualmente (o el e2e, que el hook no cubre):

```bash
npm run lint
npm run test        # Vitest
npm run test:e2e    # Playwright (si aplica)
```

## 5. Integración continua — GitHub Actions

Workflow único: [.github/workflows/ci.yml](../.github/workflows/ci.yml), dispara en `push` y `pull_request` contra `main`.

| Paso | Acción |
|---|---|
| 1 | Checkout + Node 24 |
| 2 | Valida que existan los secrets de Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) |
| 3 | `npm ci` |
| 4 | **Gate 1**: `npm run lint` |
| 5 | **Gate 2**: `npm run test:run` (Vitest) |
| 6 | **Gate 3**: `npm run test:e2e` (Playwright, con `playwright install --with-deps`) |
| 7 | Si los 3 gates pasan → `npx vercel deploy --prod --yes` usando `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` |

No hay ambiente de *preview* separado en el workflow actual: el deploy que dispara CI va directo a producción (`--prod`), condicionado a que los tres gates pasen.

## 6. Despliegue — Vercel

- El proyecto está enlazado a Vercel (ver `.vercel/repo.json`).
- Las variables de entorno de producción (Supabase, LiveKit, etc.) se gestionan en Vercel y se inyectan en build/runtime — no en el repo.
- Vercel construye con `npm run build` (Next.js) y sirve la app en el dominio de producción.

## 7. Cierre del ciclo

Una vez el change está en producción y validado, se archiva con `/opsx:archive`, dejando:

- El proposal y diseño originales en `openspec/changes/archive/<nombre-del-change>/`.
- Las specs actualizadas en `openspec/specs/` reflejando el nuevo comportamiento del sistema.

Esto cierra el ciclo: **historia de usuario → proposal (OpenSpec) → diseño → implementación → tests → CI (lint/unit/e2e) → deploy a Vercel → archivo de spec**.
