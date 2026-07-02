# Feature: Inscripciones a Cursos

## Historia 1 — Inscribirse a un curso

Como estudiante,
quiero inscribirme a un curso publicado,
para acceder a sus lecciones y comenzar a aprender.

### Criterios de aceptación

Escenario: Inscripción exitosa
  Dado que soy un estudiante autenticado y el curso está publicado
  Cuando hago clic en "Inscribirse" en la página del curso
  Entonces se registra mi inscripción
  Y el botón cambia a "Ya inscrito" o similar
  Y puedo acceder a las lecciones del curso

Escenario: Intento de doble inscripción
  Dado que ya estoy inscrito en el curso
  Cuando intento inscribirme nuevamente
  Entonces recibo un error 409 (violación de constraint único)
  Y no se crea una inscripción duplicada

Escenario: Curso no publicado
  Dado que el curso está en estado "draft"
  Cuando intento inscribirme
  Entonces recibo 403 Forbidden (RLS bloquea inscripción en cursos no publicados)

Escenario: Usuario no autenticado
  Dado que no tengo sesión activa
  Cuando intento hacer POST a /api/courses/:id/enroll
  Entonces recibo 401 Unauthorized

---

## Historia 2 — Ver estudiantes inscritos (instructor)

Como instructor propietario de un curso,
quiero ver la lista de estudiantes inscritos en mi curso,
para conocer el alcance de mi contenido y gestionar mi audiencia.

### Criterios de aceptación

La historia está completa cuando:
- [ ] GET /api/courses/:id/enrollments retorna la lista de inscripciones del curso
- [ ] Solo el instructor propietario puede ver esta lista (RLS la filtra)
- [ ] Un instructor no puede ver inscripciones de cursos ajenos
- [ ] La respuesta incluye datos básicos del estudiante (id, fecha de inscripción)
