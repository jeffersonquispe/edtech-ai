# B01 — Progreso de Lecciones

**Prioridad:** Alta
**Por qué ahora:** Es el gap más visible para el estudiante. Sin progreso, la plataforma no sabe qué consumió el usuario ni puede emitir certificados (B05).

---

## Historia 1 — Marcar lección como completada

Como estudiante inscrito en un curso,
quiero marcar cada lección como completada cuando termino de leerla,
para llevar un registro de mi avance y saber qué me falta por revisar.

### Criterios de aceptación

Escenario: Marcar lección completada
  Dado que estoy viendo una lección de un curso en el que estoy inscrito
  Cuando hago clic en "Marcar como completada"
  Entonces la lección queda marcada visualmente (ícono de check)
  Y el porcentaje de progreso del curso se actualiza

Escenario: Lección ya completada
  Dado que ya marqué la lección como completada
  Cuando vuelvo a verla
  Entonces veo el estado completado sin necesidad de volver a marcarlo
  Y puedo desmarcarlo si lo deseo

Escenario: Instructor no puede marcar progreso
  Dado que soy el instructor del curso
  Cuando visito una lección
  Entonces no veo la opción de marcar como completada (no aplica a mi rol)

---

## Historia 2 — Ver porcentaje de avance del curso

Como estudiante,
quiero ver qué porcentaje de un curso he completado,
para motivarme a terminar y saber cuánto me falta.

### Criterios de aceptación

Escenario: Barra de progreso en detalle del curso
  Dado que estoy inscrito y he completado algunas lecciones
  Cuando visito la página del curso
  Entonces veo una barra de progreso con el porcentaje completado (ej. "3 de 8 lecciones — 37%")

Escenario: Curso sin lecciones completadas
  Dado que acabo de inscribirme y no he visto ninguna lección
  Cuando veo el progreso
  Entonces dice "0% completado" o "0 de N lecciones"

Escenario: Curso 100% completado
  Dado que marqué todas las lecciones como completadas
  Cuando veo el progreso
  Entonces dice "100% completado"
  Y si está habilitado el certificado (B05), aparece el botón para descargarlo

---

## Historia 3 — Ver progreso desde el dashboard

Como estudiante,
quiero ver el avance de cada curso inscrito desde mi dashboard,
para priorizar qué curso continuar sin tener que entrar a cada uno.

### Criterios de aceptación

La historia está completa cuando:
- [ ] El dashboard del estudiante muestra una barra o porcentaje de progreso por cada curso inscrito
- [ ] El porcentaje refleja lecciones_completadas / total_lecciones del curso
- [ ] Cursos con 100% aparecen diferenciados visualmente (etiqueta "Completado")
- [ ] El progreso es por usuario — no afecta a otros estudiantes del mismo curso

---

## Notas técnicas

- Nueva tabla sugerida: `lesson_completions (student_id, lesson_id, completed_at)` con UNIQUE(student_id, lesson_id)
- El progreso se calcula como: `COUNT(completions) / COUNT(lessons)` por curso
- RLS debe garantizar que un estudiante solo pueda insertar/leer sus propias completions
