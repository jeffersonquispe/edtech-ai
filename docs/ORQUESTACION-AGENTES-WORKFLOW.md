# Orquestación del SDLC con Vercel Workflow DevKit — ¿mejor que el flujo actual?

Complementa [ORQUESTACION-AGENTES.md](ORQUESTACION-AGENTES.md). Ahí se propuso qué agentes/skills mapear a cada fase del SDLC dentro del flujo *actual* (Claude Code + hooks). Aquí se plantea la misma orquestación pero modelada como un **workflow durable** (`workflow` / Workflow DevKit de Vercel), y se cierra con una opinión: no lo recomiendo como reemplazo, salvo para una pieza puntual.

> Nota: el paquete `workflow` **no está instalado** en este repo (`node_modules/workflow` no existe, no hay dependencia en `package.json`). Todo lo de abajo es diseño, no algo ya disponible.

## 1. Cómo se vería el SDLC como workflow

La idea: en vez de que un agente de Claude Code ejecute `propose → apply → verify → commit → archive` turno a turno dentro de una sesión interactiva, el pipeline se modela como una función `"use workflow"` con pasos (`"use step"`) durables, retomable si el proceso muere, y con puntos de pausa (`createHook`) para eventos externos (aprobación humana, resultado de CI).

```typescript
// sdlc-workflow.ts
import { createHook } from "workflow";
import { FatalError, RetryableError } from "workflow";

async function proposeStep(request: string) {
  "use step";
  // Llama a un agente (Claude API / DurableAgent) que genera
  // proposal.md + design.md + specs delta + tasks.md
  return await runProposeAgent(request);
}

async function implementStep(tasks: Task[]) {
  "use step";
  // Agente que implementa tasks.md contra el repo (via Vercel Sandbox
  // o un runner con acceso a git), tarea por tarea
  return await runApplyAgent(tasks);
}

async function codeReviewStep(diff: string) {
  "use step";
  const findings = await runCodeReviewAgent(diff); // equivalente a /code-review
  if (findings.some(f => f.severity === "high")) {
    throw new FatalError("code-review encontró hallazgos bloqueantes");
  }
  return findings;
}

async function waitForCI(commitSha: string) {
  "use step";
  // dispara o consulta el workflow de GitHub Actions
  return await triggerCI(commitSha);
}

export async function sdlcWorkflow(request: string) {
  "use workflow";

  const proposal = await proposeStep(request);

  // Pausa: espera aprobación humana del proposal (opcional/configurable)
  const approvalHook = createHook<{ approved: boolean }>({ token: `approval-${proposal.id}` });
  const { approved } = await approvalHook;
  if (!approved) return { status: "rejected" };

  const impl = await implementStep(proposal.tasks);
  await codeReviewStep(impl.diff);

  // Pausa: espera que CI termine (webhook desde GitHub Actions, no polling)
  const ciHook = createHook<{ passed: boolean }>({ token: `ci-${impl.commitSha}` });
  const { passed } = await ciHook;
  if (!passed) throw new RetryableError("CI falló", { retryAfter: "10m" });

  return { status: "shipped", commit: impl.commitSha };
}
```

Puntos clave de este modelo:

- **Cada fase (`propose`, `apply`, `code-review`, `doc-maintainer`) deja de ser un slash-command interactivo de Claude Code y pasa a ser un *step* que llama a un agente vía API** (Claude API / `DurableAgent` de `@workflow/ai`), corriendo server-side en una función de Vercel — no dentro de la sesión CLI del developer.
- **Las pausas de aprobación humana** (revisar `proposal.md` antes de implementar, o el "para" que hoy solo funciona si el usuario interrumpe el chat en vivo) se vuelven un `createHook()` explícito: el workflow literalmente se suspende hasta que alguien llame `resumeHook()` (por ejemplo, desde un botón "Aprobar" en un dashboard o un comando de Slack).
- **Esperar a CI** deja de ser el polling que hace hoy el hook `SessionStart` (que solo se dispara si el usuario abre una sesión nueva) y pasa a ser un webhook: GitHub Actions llama `resumeHook()` al terminar, y el workflow sigue al instante, incluso si no hay ningún developer con Claude Code abierto.
- **Retries** (`RetryableError` vs `FatalError`) reemplazan el contador manual de 3 intentos en `verify-flow.ps1` (`.claude/verify-state.json`) por semántica nativa del framework, con backoff.
- **Observabilidad**: `npx workflow inspect runs` / dashboard de Vercel, en vez de leer el output del hook en la terminal.

## 2. Comparación directa

| | Hoy (Claude Code + hooks) | Con Vercel Workflow |
|---|---|---|
| Quién dispara el flujo | Una sesión interactiva de Claude Code (developer presente) | Cualquier evento (webhook, cron, API call) — no requiere sesión abierta |
| Sobrevive a un crash / cierre de sesión | No: si se cierra la sesión a medio `/opsx:apply`, se retoma manualmente | Sí: el *run* persiste, se retoma exactamente donde quedó |
| Pausa por aprobación humana | Implícita ("el usuario interrumpe si no está de acuerdo") | Explícita y bloqueante (`createHook`), con un evento externo que la libera |
| Espera de CI | Polling al reabrir sesión (`SessionStart` hook) | Webhook — reacciona al instante cuando CI termina |
| Reintentos | Contador manual en archivo `.json`, máx. 3, hardcodeado en PowerShell | `RetryableError`/`FatalError` nativos, con backoff configurable |
| Visibilidad del proceso | Todo se muestra en el chat de Claude Code, en tiempo real | Dashboard/CLI de Vercel (`workflow inspect`), fuera del chat |
| Costo/infra | Cero infra adicional (ya corre en tu máquina vía Claude Code) | Requiere añadir `workflow`, desplegar funciones en Vercel, y reimplementar cada fase como llamada a agente vía API |
| Quién "es" el agente | Claude Code mismo, con sus slash-commands (`/opsx:*`) ya integrados | Tendrías que reconstruir el equivalente de `/opsx:propose`/`/opsx:apply` como llamadas a la API de Claude (`DurableAgent`) — los slash-commands de Claude Code no son invocables como *step* de un workflow |

## 3. ¿Sería mejor? — mi opinión

**No, no como reemplazo del flujo completo.** Vercel Workflow resuelve problemas que este repo no tiene hoy: ejecución *server-side* sin que un humano tenga una sesión abierta, recuperación ante caídas de un proceso de larga duración, y pausas por eventos externos asíncronos. El flujo actual es, por diseño, un humano corriendo Claude Code de forma interactiva — el "workflow" ya vive en esa sesión, y el humano *es* el mecanismo de pausa/aprobación (interrumpe si no está de acuerdo). Meter Workflow DevKit encima significaría reconstruir `/opsx:propose`, `/opsx:apply` y `/code-review` como llamadas a agente vía API dentro de *steps* — en la práctica, duplicar la orquestación que Claude Code ya te da gratis, y renunciar a la visibilidad en vivo del chat a cambio de un dashboard.

**Dónde sí valdría la pena (una pieza puntual, no todo el pipeline):** el tramo *CI → archive* es hoy un polling feo (el hook `SessionStart` solo revisa el estado si abres una sesión nueva). Si en algún momento quieren que `/opsx:archive` se dispare **sin depender de que alguien abra Claude Code después de que CI termine**, ahí un workflow con un `createHook()` esperando el webhook de GitHub Actions sí sería estrictamente mejor que polling. Pero eso es un cambio pequeño y aislado, no una razón para migrar todo el SDLC a Workflow DevKit.

**Resumen:** mantener el flujo actual como está; considerar Workflow DevKit solo si en el futuro quieren que el pipeline corra de forma autónoma *sin* un developer con Claude Code abierto (ej. disparado por un issue de GitHub, o por un cron), que es un producto distinto al que tienen hoy.
