# Feature: Gestión de Lecciones

## Historia 1 — Agregar lección a un curso

Como instructor propietario de un curso,
quiero agregar lecciones con título y contenido al curso,
para estructurar el contenido que los estudiantes van a consumir.

### Criterios de aceptación

Escenario: Lección creada exitosamente
  Dado que soy el instructor propietario y el curso existe
  Cuando agrego una lección con título y contenido
  Entonces la lección aparece en el detalle del curso con su posición asignada

Escenario: Orden de lecciones
  Dado que tengo varias lecciones en el curso
  Entonces se muestran ordenadas por el campo "position"

---

## Historia 2 — Editar lección

Como instructor propietario del curso,
quiero editar el contenido o título de una lección,
para corregir errores o mejorar el material sin tener que eliminar y recrear la lección.

### Criterios de aceptación

Escenario: Edición exitosa
  Dado que soy el propietario del curso al que pertenece la lección
  Cuando hago PATCH a /api/lessons/:id con los nuevos datos
  Entonces los cambios se guardan y se reflejan al visualizar la lección

Escenario: No propietario intenta editar
  Dado que no soy el dueño del curso padre
  Cuando intento PATCH /api/lessons/:id
  Entonces recibo 403 Forbidden

---

## Historia 3 — Eliminar lección

Como instructor propietario del curso,
quiero eliminar una lección que ya no es relevante,
para mantener el contenido actualizado sin información obsoleta.

### Criterios de aceptación

Escenario: Eliminación exitosa
  Dado que soy el propietario del curso y la lección existe
  Cuando confirmo la eliminación
  Entonces la lección desaparece del listado del curso

Escenario: No propietario intenta eliminar
  Dado que no soy el dueño del curso
  Cuando intento DELETE /api/lessons/:id
  Entonces recibo 403 Forbidden

---

## Historia 4 — Ver contenido de lección (estudiante)

Como estudiante inscrito en un curso,
quiero ver el contenido de cada lección,
para aprender el material a mi propio ritmo.

### Criterios de aceptación

Escenario: Acceso a lección de curso inscrito
  Dado que estoy inscrito en el curso
  Cuando navego a /lessons/:id
  Entonces veo el título y contenido completo de la lección

Escenario: Estudiante no inscrito intenta acceder
  Dado que no estoy inscrito en el curso
  Cuando intento acceder directamente a la URL de la lección
  Entonces veo el contenido restringido o soy redirigido (RLS filtra el acceso)
