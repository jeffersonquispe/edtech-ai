# B03 — Estadísticas del Instructor

**Prioridad:** Alta
**Por qué ahora:** El instructor actualmente no tiene visibilidad del impacto de su contenido. Sin métricas, no hay incentivo para crear más cursos ni mejorar los existentes.

---

## Historia 1 — Ver total de estudiantes por curso

Como instructor,
quiero ver cuántos estudiantes están inscritos en cada uno de mis cursos,
para entender qué contenido tiene más demanda y priorizar dónde invertir mi tiempo.

### Criterios de aceptación

Escenario: Dashboard con conteo de inscritos
  Dado que soy un instructor con cursos publicados
  Cuando accedo al dashboard
  Entonces cada curso muestra el número total de estudiantes inscritos

Escenario: Curso sin inscritos
  Dado que un curso recién fue publicado y nadie se inscribió
  Cuando veo el dashboard
  Entonces el conteo muestra "0 estudiantes"

---

## Historia 2 — Ver resumen de calificaciones de mis cursos

Como instructor,
quiero ver el promedio de calificaciones de cada curso,
para identificar qué cursos reciben mejor feedback y cuáles necesitan mejoras.

### Criterios de aceptación

Escenario: Promedio de estrellas por curso
  Dado que mi curso tiene al menos una reseña
  Cuando veo el dashboard
  Entonces cada curso muestra su promedio de rating (ej. "4.3 ★") y el número de reseñas

Escenario: Curso sin reseñas
  Dado que el curso no tiene ninguna reseña
  Cuando veo el dashboard
  Entonces aparece "Sin reseñas aún" en lugar de un promedio vacío

---

## Historia 3 — Ver progreso promedio de estudiantes en un curso

Como instructor,
quiero ver qué porcentaje de lecciones han completado mis estudiantes en promedio,
para detectar en qué punto del curso se "pierden" o dejan de avanzar.

### Criterios de aceptación

La historia está completa cuando:
- [ ] La página de detalle del instructor para un curso muestra el progreso promedio de todos los inscritos
- [ ] Se muestra el porcentaje promedio de lecciones completadas (requiere B01)
- [ ] Se identifica visualmente cuál es la lección con mayor tasa de abandono (donde más estudiantes dejan de avanzar)
- [ ] Esta información solo es visible para el instructor propietario del curso

---

## Historia 4 — Ver lista detallada de estudiantes inscritos

Como instructor,
quiero ver la lista de estudiantes de un curso con su fecha de inscripción y progreso,
para hacer seguimiento individual si es un curso con mentoría.

### Criterios de aceptación

Escenario: Lista de inscritos con progreso
  Dado que soy el propietario del curso
  Cuando accedo a la sección de estudiantes del curso
  Entonces veo una tabla con: nombre/email del estudiante, fecha de inscripción y % de progreso

Escenario: Acceso no autorizado
  Dado que no soy el propietario del curso
  Cuando intento acceder a la lista de inscritos
  Entonces recibo 403 Forbidden (RLS lo filtra)
