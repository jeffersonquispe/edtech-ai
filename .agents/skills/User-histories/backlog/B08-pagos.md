# B08 — Pagos y Monetización

**Prioridad:** Baja
**Por qué después:** Los cursos ya tienen campo `precio` en la BD pero no hay flujo de cobro. Requiere integrar un proveedor de pagos (Stripe es el más natural con Next.js). Implementar cuando la plataforma tenga usuarios activos.

---

## Historia 1 — Pagar para inscribirse en un curso de pago

Como estudiante,
quiero pagar el precio de un curso con mi tarjeta de crédito,
para inscribirme en contenido premium de forma segura sin que el instructor gestione los cobros manualmente.

### Criterios de aceptación

Escenario: Flujo de pago exitoso
  Dado que el curso tiene un precio mayor a $0
  Cuando hago clic en "Inscribirse" y completo el formulario de pago
  Entonces se procesa el cobro a través de Stripe
  Y al completarse, se crea mi inscripción automáticamente
  Y recibo un correo de confirmación de pago

Escenario: Pago rechazado
  Dado que mi tarjeta es rechazada
  Cuando intento pagar
  Entonces veo un mensaje de error específico del proveedor de pagos
  Y no se crea ninguna inscripción

Escenario: Curso gratuito (precio = 0)
  Dado que el curso es gratuito
  Cuando hago clic en "Inscribirse"
  Entonces me inscribo directamente sin pasar por el flujo de pago (comportamiento actual)

---

## Historia 2 — Ver mis ingresos como instructor

Como instructor,
quiero ver un resumen de los ingresos generados por mis cursos,
para saber cuánto he ganado y planificar mis retiros.

### Criterios de aceptación

Escenario: Resumen de ingresos en el dashboard
  Dado que tengo cursos de pago con inscripciones
  Cuando accedo a la sección de ingresos en el dashboard
  Entonces veo el total ganado por curso y el total acumulado del mes

Escenario: Sin ventas
  Dado que ningún estudiante ha pagado mis cursos aún
  Cuando veo la sección de ingresos
  Entonces aparece $0.00 y un mensaje motivacional

---

## Historia 3 — Solicitar retiro de ganancias

Como instructor,
quiero solicitar el retiro de mis ganancias acumuladas a mi cuenta bancaria o PayPal,
para monetizar efectivamente el contenido que creo.

### Criterios de aceptación

La historia está completa cuando:
- [ ] El instructor puede configurar su cuenta de pago (IBAN, PayPal, etc.)
- [ ] Existe un botón "Solicitar retiro" que genera una solicitud cuando hay saldo disponible
- [ ] La plataforma descuenta su comisión (ej. 20%) antes de calcular el monto a retirar
- [ ] El instructor recibe confirmación por correo al procesar el retiro

---

## Notas técnicas

- Integración recomendada: **Stripe Connect** para manejar pagos a instructores (split payments)
- Webhook de Stripe para confirmar pagos antes de crear inscripción (evitar inscripciones sin pago confirmado)
- Nueva tabla: `payments (id, student_id, course_id, amount, currency, stripe_payment_intent_id, status, created_at)`
- La inscripción se crea en el webhook `payment_intent.succeeded`, no en el cliente
