# B02 — Contenido Multimedia en Lecciones

**Prioridad:** Alta
**Por qué ahora:** Las lecciones actuales solo muestran texto plano (whiteSpace: pre-wrap). Agregar video es el mayor salto en calidad percibida del contenido.

---

## Historia 1 — Agregar video a una lección

Como instructor,
quiero adjuntar un video a una lección ingresando su URL (YouTube, Vimeo o URL directa),
para enriquecer el contenido y ofrecer una experiencia de aprendizaje más completa.

### Criterios de aceptación

Escenario: Lección con video de YouTube
  Dado que soy el instructor y estoy editando una lección
  Cuando ingreso una URL de YouTube válida en el campo de video
  Entonces la URL se guarda y la lección muestra el video embebido al reproducirse

Escenario: URL inválida
  Dado que ingreso una URL que no es de video reconocido
  Cuando intento guardar
  Entonces veo un mensaje de validación
  Y la lección no se guarda con esa URL

Escenario: Lección sin video
  Dado que no agrego URL de video
  Cuando el estudiante ve la lección
  Entonces solo ve el contenido de texto, sin espacio vacío ni error

---

## Historia 2 — Ver video en una lección (estudiante)

Como estudiante inscrito,
quiero ver el video de una lección directamente en la plataforma,
para no tener que ir a plataformas externas y perder el contexto del curso.

### Criterios de aceptación

Escenario: Reproducción de video embebido
  Dado que la lección tiene una URL de video configurada
  Cuando abro la lección
  Entonces veo el reproductor de video antes del texto de la lección
  Y puedo pausar, avanzar y controlar el volumen

Escenario: Video no disponible
  Dado que la URL del video fue eliminada externamente
  Cuando intento reproducir
  Entonces veo un mensaje de "video no disponible" en lugar de un iframe roto

---

## Historia 3 — Adjuntar archivos descargables a una lección

Como instructor,
quiero adjuntar archivos (PDF, slides, código fuente) a una lección,
para dar material complementario que los estudiantes puedan descargar y repasar offline.

### Criterios de aceptación

La historia está completa cuando:
- [ ] El formulario de lección permite subir archivos o ingresar URLs de recursos externos
- [ ] El estudiante ve un listado de "Recursos descargables" al final de la lección
- [ ] Cada recurso muestra nombre y tipo de archivo
- [ ] El acceso a los recursos está restringido a estudiantes inscritos (o al instructor)
- [ ] Los archivos se almacenan en Supabase Storage o en una URL externa configurada por el instructor

---

## Notas técnicas

- Campo sugerido en tabla `lessons`: `video_url TEXT` (nullable)
- Para archivos: nueva tabla `lesson_resources (id, lesson_id, name, url, type)` o columna JSONB
- El componente de lección (`/lessons/[id]/page.tsx`) necesita renderizar un `<iframe>` o `<video>` según el tipo de URL
