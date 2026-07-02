# B04 — Quizzes y Ejercicios por Lección

**Prioridad:** Media
**Por qué ahora:** Refuerza el aprendizaje activo. Depende de B01 (progreso) para saber si el quiz fue aprobado antes de avanzar.

---

## Historia 1 — Crear quiz para una lección (instructor)

Como instructor,
quiero agregar preguntas de opción múltiple al final de una lección,
para que los estudiantes validen su comprensión antes de continuar.

### Criterios de aceptación

Escenario: Creación de quiz con preguntas
  Dado que soy el instructor y estoy editando una lección
  Cuando agrego una o más preguntas con opciones y marco la respuesta correcta
  Entonces el quiz se guarda asociado a la lección

Escenario: Quiz sin preguntas
  Dado que no agrego ninguna pregunta
  Cuando guardo la lección
  Entonces la lección se guarda normalmente sin quiz (el quiz es opcional)

Escenario: Modificar quiz existente
  Dado que ya tengo un quiz creado
  Cuando edito las preguntas o cambio la respuesta correcta
  Entonces los cambios se aplican
  Y los intentos anteriores de estudiantes se conservan (no se invalidan retroactivamente)

---

## Historia 2 — Responder quiz de una lección (estudiante)

Como estudiante inscrito,
quiero responder el quiz al final de una lección,
para saber si entendí el contenido antes de pasar a la siguiente.

### Criterios de aceptación

Escenario: Quiz respondido correctamente
  Dado que completo todas las preguntas y selecciono las respuestas correctas
  Cuando envío el quiz
  Entonces veo un mensaje de "¡Correcto!" con mi puntaje
  Y la lección se marca automáticamente como completada (integra con B01)

Escenario: Quiz con respuestas incorrectas
  Dado que selecciono algunas respuestas incorrectas
  Cuando envío el quiz
  Entonces veo cuáles respuestas estuvieron mal y la respuesta correcta
  Y puedo intentarlo de nuevo

Escenario: Lección sin quiz
  Dado que la lección no tiene quiz configurado
  Cuando termino de leer la lección
  Entonces no veo sección de quiz y puedo marcarla como completada manualmente

---

## Notas técnicas

- Tablas sugeridas: `quizzes (id, lesson_id)`, `quiz_questions (id, quiz_id, text, options JSONB, correct_option INT)`, `quiz_attempts (id, student_id, quiz_id, score, answers JSONB, created_at)`
- RLS: solo el instructor dueño puede crear/editar quizzes; solo estudiantes inscritos pueden intentar
