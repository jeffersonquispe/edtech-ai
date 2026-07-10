# Orquestación de agentes para el SDLC

Este documento complementa [FLUJO-PROYECTO.md](FLUJO-PROYECTO.md): ese describe el flujo *actual* (propose → apply → sync → archive + hooks + CI). Este documento diagnostica dónde ese flujo corre hoy con **un solo agente secuencial** y propone dónde vale la pena introducir agentes especializados o paralelismo — sin tocar nada todavía.

## 1. Flujo actual: un solo hilo, sin orquestación

```
Historia de usuario
      │
      ▼
/opsx:propose ──► /opsx:apply ──► hook Stop (lint+test) ──► commit+push ──► CI ──► Vercel prod
      │                                                                              │
      └── (opcional) /opsx:explore                          hook SessionStart ◄──────┘
                                                                     │
                                                                     ▼
                                                              /opsx:archive
```

Todo el ciclo lo ejecuta **el agente principal de Claude Code**, de punta a punta, un paso a la vez. No hay:
- research delegado a un subagente antes de proponer (salvo que se invoque `/opsx:explore` manualmente),
- paralelismo entre tareas de `tasks.md` aunque sean independientes,
- ningún gate de *revisión de calidad/seguridad* antes del commit automático — el hook `Stop` solo corre `lint` + `test:run`, nunca `/code-review` ni `/security-review`,
- mantenimiento proactivo entre features (nadie audita dependencias, migraciones fallidas, o `embedding_jobs` atascados si no se le pide explícitamente).

## 2. Diagnóstico por fase

| Fase SDLC | Qué pasa hoy | Gap |
|---|---|---|
| Descubrimiento | `/opsx:explore` manual, si acaso | Sin research delegado; consume contexto del agente principal |
| Diseño | `/opsx:propose` autónomo | OK para features normales; sin agente arquitectónico para decisiones grandes |
| Implementación | `/opsx:apply` secuencial | Tareas independientes de `tasks.md` no se paralelizan |
| Calidad/seguridad | hook `Stop`: solo lint+test | **Nada revisa correctness o seguridad antes de push a `main` → prod** |
| Documentación | manual | Nadie actualiza docs/CLAUDE.md tras cambios de arquitectura |
| CI/CD | GitHub Actions + Vercel | Ya automatizado, sin agentes — correcto, no tocar |
| Mantenimiento continuo | nada | No hay agente periódico que audite el repo entre features |

El gap más importante es el de **calidad/seguridad**: dado que el push automático a `main` dispara deploy a prod sin revisión humana, hoy el único filtro real son `lint` + tests unitarios. Un bug de lógica o un hueco de seguridad que pase esos dos gates llega a producción sin que nada más lo mire.

## 3. Plan de mejora — mapeo de agentes a fases

| Fase | Agente/skill propuesto | Cuándo dispararlo | Beneficio | Trade-off |
|---|---|---|---|---|
| Research previo a propose | `Agent(subagent_type: Explore)` | Solo si el requisito es ambiguo o toca >2 módulos | Protege la ventana de contexto principal para investigación profunda | Overhead innecesario en features chicas y claras |
| Decisiones arquitectónicas grandes | `Agent(subagent_type: Plan)` | Cambios que afectan el modelo de datos o el modelo de autorización (RLS) | Explora trade-offs sin comprometer código | No vale la pena para features aisladas |
| Implementación paralela | `Agent(..., isolation: "worktree")` | Tareas de `tasks.md` genuinamente independientes (ej. feature backend + un componente UI desacoplado) | Más throughput | Riesgo de conflicto si dos agentes tocan la misma migración/archivo; solo si las tareas no comparten estado |
| **Gate de calidad antes del commit automático** | `/code-review` (medium) o `/security-review` | Condicional: si el diff toca `supabase/migrations/`, `src/app/api/`, o RLS | Cierra el gap real — hoy nada revisa lógica/seguridad antes de prod | Añade latencia por turno; por eso condicionarlo al path del diff, no correrlo siempre |
| Documentación | `doc-maintainer` | Al final de `/opsx:archive`, si el change tocó schema, endpoints o env vars | Docs no quedan desactualizadas | Ruido si se dispara en cambios triviales |
| Mantenimiento continuo | `/schedule` o `/loop` (agente periódico) | Semanal, fuera del ciclo feature-a-feature | Detecta drift (deps desactualizadas, jobs fallidos) sin que nadie lo pida | Consumo recurrente de tiempo/créditos aunque no encuentre nada |

## 4. Próximo paso sugerido (el cambio de menor riesgo primero)

De todo lo anterior, lo único que **cierra un gap real de hoy** (vs. añadir velocidad/nice-to-have) es el gate de calidad: insertar `/code-review` condicionalmente en el hook `Stop`, antes del commit automático, cuando el diff toque `supabase/migrations/` o `src/app/api/`. Es el único punto donde el flujo actual empuja código a producción sin que nada evalúe correctness o seguridad.

No he implementado nada de esto — es el plan. Dime si quieres que arranque por ahí (modificar `scripts/verify-flow.ps1`) o prefieres priorizar otra fila de la tabla.
