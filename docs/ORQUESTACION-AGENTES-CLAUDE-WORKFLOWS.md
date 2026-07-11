# Orquestación del SDLC con los "Workflows" de Claude Code (dynamic workflows)

Corrige y reemplaza el enfoque de [ORQUESTACION-AGENTES-WORKFLOW.md](ORQUESTACION-AGENTES-WORKFLOW.md): ese documento asumía "workflows" = Vercel Workflow DevKit. El usuario se refería a otra cosa: los **dynamic workflows de Claude Code** ([code.claude.com/docs/es/workflows](https://code.claude.com/docs/es/workflows)), una feature nativa de Claude Code — no un paquete npm nuevo. Esto sí aplica directo a este repo, sin infraestructura adicional.

## 1. Qué son (resumen fiel a la doc oficial)

Un *dynamic workflow* es un script de JavaScript que **Claude escribe** (no el usuario) para orquestar muchos subagentes en segundo plano, mientras la sesión interactiva sigue libre. La diferencia clave frente a lo que ya usamos (subagentes vía `Agent`, skills como `/opsx:*`):

| | Subagentes / skills (lo que ya usamos) | Dynamic workflow |
|---|---|---|
| Quién decide el siguiente paso | Claude, turno a turno | El script ya escrito |
| Dónde vive el resultado intermedio | Ventana de contexto de Claude | Variables del script |
| Escala | Unas pocas delegaciones por turno | Decenas a cientos de agentes por ejecución |
| Reanudable | No (se reinicia el turno) | Sí, dentro de la misma sesión |
| Cómo se invoca | Slash command o `Agent()` normal | `/nombre-guardado`, o pidiendo "usa un workflow"/`ultracode` |

Primitivas del script: `agent(prompt, opts)` genera un subagente; `pipeline(lista, fn)` corre un agente por elemento. Se guardan en `.claude/workflows/` (versionado, compartido con el repo) o `~/.claude/workflows/` (personal), y quedan disponibles como `/<nombre>` igual que un slash command.

**Límites del runtime a tener en cuenta:** máx. 16 agentes concurrentes, 1000 por ejecución; sin input de usuario a mitad de ejecución (solo aprobar el plan antes de lanzar); el script mismo no toca filesystem/shell directamente, solo los agentes que genera. Cuesta notablemente más tokens que una sola pasada conversacional — la propia doc recomienda probar en un subconjunto antes de correrlo sobre todo el repo.

Requiere Claude Code v2.1.154+ y un plan de pago; se activa en `/config` (Pro) o está disponible por defecto en Max/Team/Enterprise.

## 2. Encaje real en el SDLC de este repo

Los workflows están pensados para **tareas "fan-out"** (un mismo tipo de chequeo repetido sobre muchos elementos), no para reemplazar un pipeline secuencial. Por eso **no** son un buen sustituto de `propose → apply → archive` (eso ya es secuencial, un agente a la vez, y OpenSpec lo cubre bien). Donde sí encajan, con ejemplos que además son casi calcados a los que trae la doc oficial:

### a) El gate de calidad que falta hoy (el gap identificado en [ORQUESTACION-AGENTES.md](ORQUESTACION-AGENTES.md))

Hoy el hook `Stop` solo corre `lint` + `test:run`. Un workflow guardado tipo *"revisar cada archivo modificado"* encaja exacto con el patrón documentado:

```text
usa un workflow para revisar cada archivo modificado en este diff buscando
problemas de correctness y seguridad (especial atención a RLS, migraciones
y rutas bajo src/app/api/), y junta los hallazgos por archivo en un resumen
único priorizado
```

Un agente por archivo cambiado, verificación cruzada, resumen final — sin bloquear la sesión. Se guardaría como `.claude/workflows/review-diff.js` y quedaría disponible como `/review-diff`, versionado en el repo para que cualquiera que clone el proyecto lo tenga.

### b) Reemplazar el contador manual de reintentos del hook `Stop`

`scripts/verify-flow.ps1` hoy hardcodea "hasta 3 intentos" en un archivo `.claude/verify-state.json`. La doc trae el patrón exacto — *"seguir arreglando hasta que pase una verificación"*:

```text
usa un workflow para correr npm run lint && npm run test:run y seguir
arreglando lo que falle hasta que pase, o hasta que dos rondas seguidas
no hagan progreso
```

Esto podría invocarse headless desde el propio hook (`claude -p "/fix-until-green"`), ya que los workflows funcionan en modo no interactivo. Cambiaría el mecanismo de "contador en JSON + PowerShell" por la lógica nativa del runtime — pero implica que cada turno con cambios en `src/` dispare un workflow con costo en tokens, no solo dos comandos npm baratos.

### c) Auditoría periódica de RLS / auth (la fila "mantenimiento continuo" del primer documento)

Coincide con el primer ejemplo de la doc oficial casi palabra por palabra:

```text
usa un workflow para auditar cada endpoint bajo src/app/api/ buscando
checks de autenticación faltantes o lógica que no delegue en RLS, y
verifica cada hallazgo de forma adversarial antes de reportarlo
```

Guardado como `/audit-rls`, se podría correr manualmente antes de un release grande, o programarlo con `/schedule` para que dispare este workflow una vez por semana.

### d) Migraciones grandes (si algún día se toca a escala)

Si en el futuro se migra un patrón en muchos archivos a la vez (ej. cambiar todos los route handlers a un nuevo helper de auth), el patrón *"migrar muchos archivos en paralelo, cada uno en su copia aislada"* de la doc aplica directo — hoy no hay un caso así en el repo, pero queda mapeado por si surge.

## 3. Lo que NO cambia

- `propose → apply → sync → archive` sigue siendo secuencial y vive mejor en OpenSpec tal cual está — un workflow no ayuda ahí, porque no hay "muchos agentes haciendo lo mismo", hay una sola cadena de pasos dependientes.
- El hook `SessionStart` (chequeo de CI) sigue siendo un script de una sola llamada — no hay nada que paralelizar.
- Nada de esto requiere instalar nada nuevo (a diferencia de la propuesta de Vercel Workflow DevKit, que sí implicaba una dependencia y reimplementar cada fase como llamada a API).

## 4. Mi opinión

**Sí, esto es mejor que las dos propuestas anteriores para cerrar el gap real** (el gate de calidad/seguridad antes del push automático a `main`). Es nativo de Claude Code — cero infraestructura nueva, se guarda en el propio repo (`.claude/workflows/`), y el patrón "un agente por archivo + merge de hallazgos" es literalmente uno de los ejemplos que trae la documentación oficial, no algo que haya que inventar.

La única cautela real es el costo: un workflow gasta notablemente más tokens que un `/code-review` de una sola pasada, así que conviene:
1. Empezar guardando `/review-diff` y probarlo manualmente unas cuantas veces antes de engancharlo al hook `Stop`.
2. Si se engancha al hook, condicionarlo (igual que se propuso en el primer documento) a que el diff toque `supabase/migrations/` o `src/app/api/` — no correrlo en cada turno que solo toca `docs/`.
3. Usar `/config` para poner una directriz de tamaño (`small`/`medium`) y no dejar que Claude lance workflows de decenas de agentes para revisar tres archivos.

Con esas dos salvaguardas, `/review-diff` como gate antes del commit automático es el cambio concreto que recomendaría hacer primero — más que cualquiera de las dos propuestas anteriores.
