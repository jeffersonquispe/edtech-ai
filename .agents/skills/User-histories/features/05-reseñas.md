# Feature: Reseñas de Cursos

## Historia 1 — Dejar una reseña

Como estudiante inscrito en un curso,
quiero dejar una calificación y comentario sobre el curso,
para ayudar a otros estudiantes a tomar una decisión informada y dar feedback al instructor.

### Criterios de aceptación

Escenario: Reseña enviada exitosamente
  Dado que estoy inscrito en el curso y no tengo reseña previa
  Cuando envío una calificación (1-5) y un comentario
  Entonces la reseña aparece en la página del curso
  Y el formulario de reseña deja de mostrarse (ya la dejé)

Escenario: Reseña duplicada bloqueada
  Dado que ya dejé una reseña en este curso
  Cuando intento crear otra
  Entonces recibo 409 Conflict (violación de constraint único por estudiante+curso)

Escenario: Estudiante no inscrito intenta reseñar
  Dado que no estoy inscrito en el curso
  Cuando intento POST /api/courses/:id/reviews
  Entonces recibo 403 Forbidden (RLS exige inscripción)

Escenario: Usuario no autenticado
  Dado que no tengo sesión
  Cuando intento enviar una reseña
  Entonces recibo 401 Unauthorized

---

## Historia 2 — Ver reseñas de un curso

Como visitante o estudiante,
quiero ver las reseñas de un curso,
para evaluar la calidad del contenido antes de inscribirme.

### Criterios de aceptación

Escenario: Reseñas visibles públicamente
  Dado que el curso está publicado y tiene reseñas
  Cuando visito la página del curso sin sesión activa
  Entonces veo el listado de reseñas con calificación y comentario

Escenario: Eliminar reseña propia
  Dado que soy el autor de una reseña
  Cuando solicito eliminarla vía DELETE /api/reviews/:id
  Entonces la reseña desaparece del curso

Escenario: Eliminar reseña ajena bloqueado
  Dado que no soy el autor de la reseña
  Cuando intento DELETE /api/reviews/:id
  Entonces recibo 403 Forbidden
