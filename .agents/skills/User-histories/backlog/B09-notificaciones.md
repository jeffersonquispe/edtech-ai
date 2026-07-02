# B09 — Notificaciones al Estudiante e Instructor

**Prioridad:** Baja
**Por qué después:** Mejora retención y engagement pero no bloquea el flujo principal de aprendizaje. Implementar cuando haya un volumen de usuarios que justifique el canal.

---

## Historia 1 — Recibir notificación cuando un instructor publica nuevo contenido

Como estudiante inscrito en un curso,
quiero recibir una notificación cuando el instructor agrega una nueva lección,
para enterarme del nuevo contenido sin tener que revisar la plataforma constantemente.

### Criterios de aceptación

Escenario: Nueva lección publicada
  Dado que estoy inscrito en un curso
  Cuando el instructor agrega y publica una nueva lección
  Entonces recibo una notificación en la plataforma (campana) y/o un correo electrónico

Escenario: Notificación en plataforma
  Dado que tengo notificaciones pendientes
  Cuando entro a la plataforma
  Entonces el ícono de campana en la Navbar muestra el número de notificaciones no leídas
  Y al hacer clic veo el detalle de cada notificación con enlace a la lección

Escenario: Desactivar notificaciones por curso
  Dado que no quiero recibir notificaciones de un curso específico
  Cuando desactivo las notificaciones en la configuración de ese curso
  Entonces dejo de recibir notificaciones de ese curso (pero no de los demás)

---

## Historia 2 — Notificar al instructor cuando alguien se inscribe

Como instructor,
quiero recibir una notificación cada vez que un estudiante se inscribe en uno de mis cursos,
para hacer seguimiento de mi crecimiento sin tener que revisar las estadísticas manualmente.

### Criterios de aceptación

Escenario: Notificación de inscripción nueva
  Dado que un estudiante se inscribió en mi curso
  Cuando entro al dashboard
  Entonces veo una notificación indicando el nombre del estudiante y el curso en que se inscribió

Escenario: Resumen diario en lugar de notificación por evento
  Dado que tengo muchas inscripciones en un día
  Entonces puedo optar por recibir un resumen diario por correo en lugar de una notificación por cada inscripción

---

## Historia 3 — Marcar notificaciones como leídas

Como usuario con notificaciones,
quiero marcar mis notificaciones como leídas,
para limpiar mi bandeja y saber cuáles ya revisé.

### Criterios de aceptación

La historia está completa cuando:
- [ ] Cada notificación tiene un estado leído/no leído
- [ ] Al hacer clic en una notificación se marca como leída automáticamente
- [ ] Existe la opción "Marcar todas como leídas"
- [ ] El contador de la campana solo muestra notificaciones no leídas

---

## Notas técnicas

- Nueva tabla: `notifications (id, user_id, type, payload JSONB, read_at NULLABLE, created_at)`
- Para notificaciones en tiempo real: Supabase Realtime (broadcast o postgres changes) sobre la tabla `notifications`
- Para correos: integrar con Resend o Supabase Edge Functions + SMTP
- Trigger en BD: al insertar en `lessons` → notificar a todos los `enrollments` del curso
