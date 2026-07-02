# B07 — Comentarios y Discusión por Lección

**Prioridad:** Baja
**Por qué después:** Agrega comunidad pero requiere moderación. El agente Edy cubre parte de esta necesidad hoy. Implementar cuando haya masa crítica de usuarios.

---

## Historia 1 — Dejar un comentario o pregunta en una lección

Como estudiante inscrito,
quiero dejar una pregunta o comentario en una lección específica,
para resolver dudas puntuales sobre el contenido sin depender exclusivamente del agente Edy.

### Criterios de aceptación

Escenario: Comentario enviado exitosamente
  Dado que estoy viendo una lección y estoy inscrito en el curso
  Cuando escribo un comentario y lo envío
  Entonces el comentario aparece en el hilo de discusión de esa lección con mi nombre y la fecha

Escenario: Estudiante no inscrito intenta comentar
  Dado que no estoy inscrito en el curso
  Cuando intento enviar un comentario
  Entonces recibo 403 Forbidden

Escenario: Comentario vacío
  Dado que intento enviar un comentario vacío
  Cuando hago clic en enviar
  Entonces no se envía y veo un mensaje de validación

---

## Historia 2 — Responder a un comentario (instructor o estudiante)

Como instructor o estudiante,
quiero responder a un comentario existente en el hilo de discusión,
para que la conversación sea contextual y las respuestas queden organizadas.

### Criterios de aceptación

Escenario: Respuesta anidada
  Dado que veo un comentario de otro estudiante
  Cuando hago clic en "Responder" y escribo mi respuesta
  Entonces la respuesta aparece anidada bajo el comentario original

Escenario: El instructor responde con distintivo
  Dado que el instructor del curso responde un comentario
  Entonces su nombre aparece con la etiqueta "Instructor" para distinguirlo

---

## Historia 3 — Eliminar un comentario propio

Como estudiante o instructor,
quiero eliminar mis propios comentarios,
para corregir errores o eliminar contenido que ya no es relevante.

### Criterios de aceptación

La historia está completa cuando:
- [ ] Cada comentario muestra un botón de eliminar solo al autor
- [ ] Al confirmar, el comentario desaparece del hilo
- [ ] El instructor puede eliminar cualquier comentario de su curso (moderación)
- [ ] Las respuestas a un comentario eliminado se mantienen o muestran "[comentario eliminado]"

---

## Notas técnicas

- Nueva tabla: `lesson_comments (id, lesson_id, author_id, parent_id NULLABLE, content, created_at)`
- RLS: leer solo si es inscrito o dueño del curso; insertar solo si es inscrito; eliminar solo si es autor o dueño del curso
