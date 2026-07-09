# Flujo de diseño y entrega del proyecto

Este documento describe el flujo end-to-end del proyecto, desde que surge una necesidad (historia de usuario) hasta que queda desplegada en producción.

```
Historia de usuario / idea
        │
        ▼
   OpenSpec: /opsx:propose  (autónomo, Claude lo dispara solo)
   (proposal.md + design.md + specs delta + tasks.md)
        │                     ← se muestra en el chat, sin pausa de aprobación
        ▼
   OpenSpec: /opsx:apply  (autónomo, encadenado)
   (implementación tarea por tarea, checklist en tasks.md)
        │
        ▼
   Código + tests (Vitest) + tests e2e (Playwright)
        │
        ▼
   Hook local (Claude Code, evento Stop)
   scripts/verify-flow.ps1 → lint + test:run
     - si falla: bloquea y Claude corrige (máx. 3 intentos)
     - si tras 3 intentos sigue fallando: avisa en el chat, no auto-commitea
     - si pasa (o si no había código que verificar): AUTO commit + push
        │
        ▼
   git commit (auto, allowlist de rutas) → push a origin/main (auto)
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
   Hook local (Claude Code, evento SessionStart)
   scripts/check-ci-status.ps1 → último run de CI en main +
   changes de OpenSpec activos sin archivar
        │
        ▼
   OpenSpec: /opsx:archive  (autónomo: Claude lo corre solo
   si SessionStart reporta CI verde + change activo)
   (mueve el change a openspec/changes/archive/,
    sincroniza specs delta → openspec/specs/)
```

Toda la cadena — `propose → apply → sync → archive`, más lint/test/commit/push/CI/deploy — corre sin pausas de aprobación intermedias (ver [CLAUDE.md](../CLAUDE.md#flujo-de-entrega--autónomo-sin-pausas-de-aprobación)). El proposal y cada paso se muestran en el chat por transparencia, pero Claude no espera un "sí, procede" para continuar: el usuario frena la cadena interrumpiendo explícitamente, no aprobándola de antemano.

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
- **`/opsx:apply`** — implementa las tareas de `tasks.md` una por una, marcando el checklist a medida que avanza.
- **`/opsx:sync`** — sincroniza las specs delta del change hacia `openspec/specs/` (specs "vivas" del proyecto) sin archivar, útil si se necesita reflejar avance parcial.
- **`/opsx:archive`** — al terminar la implementación, archiva el change en `openspec/changes/archive/` y confirma la sincronización final de specs.

Claude encadena `propose → apply → sync → archive` de forma autónoma (ver [CLAUDE.md](../CLAUDE.md)): el `proposal.md` se muestra en el chat por trazabilidad, pero no hay una pausa que espere aprobación explícita antes de pasar a `apply`. El rastro auditable (proposal, diseño y specs versionados en el repo) sigue existiendo — lo que cambió es que ya no es un gate bloqueante, sino un registro que el usuario puede revisar e interrumpir en cualquier momento.

## 3. Implementación

Con `tasks.md` como guía, se implementa siguiendo la arquitectura del proyecto (ver [CLAUDE.md](../CLAUDE.md)):

- Next.js 15 App Router (Server/Client Components)
- Supabase (Postgres + Auth), **RLS como única fuente de autorización**
- Migraciones en `supabase/migrations/`, en orden
- Rutas API delegan permisos a RLS, nunca los reimplementan

## 4. Calidad local + entrega — automatizadas con hooks

El repo usa dos hooks de Claude Code, definidos en [.claude/settings.json](../.claude/settings.json) (versionado en el repo — antes vivía solo en la máquina local sin commitear, por lo que la automatización no se compartía con nadie más que clonara el proyecto).

### Hook `Stop` — [scripts/verify-flow.ps1](../scripts/verify-flow.ps1)

Se dispara automáticamente al terminar cada turno de Claude Code:

1. Si hay cambios sin commitear en `src/` o `supabase/migrations/`, corre `npm run lint` y `npm run test:run` (los mismos gates 1 y 2 de CI; el e2e se deja solo para CI por ser lento).
2. **Si algo falla**: bloquea el turno (exit code 2) y devuelve el error a Claude, que debe corregirlo. No se auto-commitea nada roto. El intento se cuenta en `.claude/verify-state.json` (efímero, en `.gitignore`).
3. **Reintentos**: hasta 3 intentos consecutivos. Si Claude corrige el problema, el contador se resetea a 0 en la siguiente ejecución exitosa.
4. **Si al tercer intento sigue fallando**: el hook deja de bloquear, resetea el contador y deja un mensaje explícito (`No se pudo resolver ... tras 3 intentos`) para que Claude lo comunique al usuario en el propio chat. Tampoco auto-commitea.
5. **Si lint+test pasan** (o si no había código que verificar, pero sí otros archivos dirty como `docs/` u `openspec/`): el hook hace **`git add` + `git commit` + `git push origin HEAD` automáticamente**, sin pedir confirmación.
   - Solo se stagean rutas conocidas del proyecto (allowlist en el propio script: `src`, `supabase`, `e2e`, `tests`, `docs`, `openspec`, `scripts`, `.github`, `public`, `.claude`, y los archivos de config de la raíz). Nunca `git add -A`: cualquier archivo suelto fuera de esa lista se deja para commit manual, para no arrastrar accidentalmente secretos o scratch files.
   - El mensaje de commit es generado (`chore(auto-flow): ...`, con el conteo y preview de archivos) — no sigue el estilo semántico (`feat`/`fix`) de los commits manuales.
   - Como el repo pushea directo a `main` (no hay rama de PR intermedia en este flujo), **cada push automático dispara CI y, si pasa, despliega a producción sin revisión humana previa**. Es una decisión explícita: prioriza velocidad de iteración sobre gate manual antes de prod.
   - Si el push falla (conflicto, red, rama protegida), el commit local queda hecho pero el hook avisa en el chat para resolverlo a mano — no reintenta solo.

### Hook `SessionStart` — [scripts/check-ci-status.ps1](../scripts/check-ci-status.ps1)

Se dispara al arrancar una sesión de Claude Code:

- Consulta `gh run list` (requiere [GitHub CLI autenticado](https://cli.github.com/)) y muestra el estado del último run de CI en `main`; avisa si el último run no pasó.
- Lista los *changes* de OpenSpec activos (`openspec/changes/*` sin archivar) y recuerda correr `/opsx:archive` si ya están en prod y validados.
- Es de solo lectura: no bloquea la sesión ni falla si `gh` no está disponible o no hay red.

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

`/opsx:archive` es autónomo: el hook `SessionStart` (`scripts/check-ci-status.ps1`, sección 4) reporta el estado del último run de CI en `main` y los changes activos sin archivar; si el run pasó y corresponde al change recién trabajado, Claude corre `/opsx:archive` sin preguntar. El hook en sí no ejecuta el archive (es una operación *agent-driven*, requiere criterio para decidir qué change corresponde y hacer el merge inteligente de specs) — solo le da a Claude la señal para hacerlo él mismo.

Esto cierra el ciclo: **historia de usuario → proposal (OpenSpec, autónomo) → implementación (autónoma) → tests → hook Stop (lint/unit + auto commit/push) → CI (lint/unit/e2e) → deploy a Vercel → hook SessionStart (señal) → archivo de spec (autónomo)**.

## 8. Cómo se frena esta cadena si hace falta

El flujo completo — propose, apply, sync, archive, commit, push, y el deploy que dispara CI — corre sin pausas de aprobación por defecto (ver [CLAUDE.md](../CLAUDE.md)). No hay gates bloqueantes deliberados: fue una decisión explícita de priorizar velocidad de iteración.

Eso significa que el único freno es que **el usuario lo pida en el chat** — interrumpir, decir "para", "no subas esto todavía", "revisa el proposal antes de aplicar", etc. Cosas a tener en cuenta:

- El `proposal.md`, los diffs de código, y los mensajes de cada hook se siguen mostrando en el chat, así que hay visibilidad de lo que está pasando aunque no se pida aprobación explícita.
- Si algo llega a producción y no debía, el rastro auditable de OpenSpec (proposal + specs versionados) y el historial de git permiten revertir con contexto claro de qué se intentó y por qué.
- Este nivel de automatización es específico de este repo (decisión tomada explícitamente para este proyecto) — no asumir que aplica a otros repos sin la misma configuración de hooks y de CLAUDE.md.
