# Feature: Agente de Voz Edy (LiveKit)

## Historia 1 — Abrir el widget de voz Edy

Como estudiante o visitante de la plataforma,
quiero acceder a un asistente de voz flotante sin salir de la página actual,
para resolver dudas sobre los cursos sin interrumpir mi navegación.

### Criterios de aceptación

Escenario: Widget visible en toda la plataforma
  Dado que soy cualquier usuario en cualquier página
  Entonces veo el botón flotante de EdyWidget en la esquina de la pantalla

Escenario: Abrir el widget
  Dado que hago clic en el botón flotante
  Entonces se abre un iframe cargando /agente-edy de forma lazy (sin cargar hasta que lo uso)
  Y el agente Edy se conecta a la sala LiveKit correspondiente

Escenario: Widget cargado bajo demanda
  Dado que no he abierto el widget
  Entonces el iframe de /agente-edy no está cargado en el DOM
  Y no se consume ancho de banda ni créditos de LiveKit innecesariamente

---

## Historia 2 — Conversar con Edy por voz

Como usuario con el widget abierto,
quiero hablar con el agente Edy usando mi micrófono,
para obtener respuestas sobre el contenido de los cursos de forma natural.

### Criterios de aceptación

Escenario: Conexión exitosa con micrófono
  Dado que abro el widget y concedo acceso al micrófono
  Cuando hablo, el agente Edy recibe mi audio a través de la sala LiveKit
  Y responde con voz sintetizada

Escenario: Micrófono denegado
  Dado que el navegador no tiene permiso al micrófono
  Cuando intento usar el modo voz
  Entonces veo un mensaje claro de error indicando que se requiere acceso al micrófono

---

## Historia 3 — Chat de texto con Edy

Como usuario que prefiere texto o no puede usar el micrófono,
quiero escribir mis preguntas al agente Edy,
para obtener ayuda sin depender del audio.

### Criterios de aceptación

Escenario: Envío de mensaje de texto
  Dado que el widget está abierto y conectado
  Cuando escribo un mensaje y lo envío (topic lk.chat)
  Entonces el agente Edy recibe el texto y responde

Escenario: Transcripción visible
  Dado que estoy conversando por voz
  Cuando el agente o yo hablamos
  Entonces la transcripción del intercambio aparece en el área de chat de EdyRoom

---

## Historia 4 — Generación de token LiveKit según sesión

Como sistema (token endpoint),
quiero generar tokens LiveKit que incluyan el student_id cuando hay sesión activa,
para que el agente Edy pueda personalizar las respuestas según el usuario.

### Criterios de aceptación

La historia está completa cuando:
- [ ] POST /api/livekit/token genera un token válido para la sala edy-*
- [ ] Si el usuario tiene sesión, el token incluye student_id en los metadata
- [ ] Si no hay sesión (visitante anónimo), el token se genera igualmente sin student_id
- [ ] Las claves LIVEKIT_API_KEY y LIVEKIT_API_SECRET nunca se exponen al cliente
- [ ] NEXT_PUBLIC_LIVEKIT_URL es la única variable pública usada por el browser
