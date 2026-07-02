# B05 — Certificado de Completación

**Prioridad:** Media
**Dependencia:** Requiere B01 (progreso de lecciones) para saber cuándo el curso está 100% completado.

---

## Historia 1 — Recibir certificado al completar un curso

Como estudiante,
quiero recibir un certificado descargable cuando termino todas las lecciones de un curso,
para tener evidencia de mi aprendizaje y compartirlo en mi perfil o LinkedIn.

### Criterios de aceptación

Escenario: Certificado disponible al completar
  Dado que marqué todas las lecciones del curso como completadas
  Cuando visito la página del curso
  Entonces aparece el botón "Descargar certificado"
  Y al hacer clic descargo un PDF con mi nombre, el nombre del curso y la fecha de completación

Escenario: Curso no completado
  Dado que no he completado todas las lecciones
  Cuando visito la página del curso
  Entonces no aparece la opción de certificado
  Y veo el porcentaje de avance actual

Escenario: Certificado con datos correctos
  Dado que descargo mi certificado
  Entonces el PDF muestra:
  - Mi nombre (del perfil)
  - El título del curso
  - El nombre del instructor
  - La fecha en que completé el curso
  - Un código único de verificación

---

## Historia 2 — Verificar autenticidad de un certificado

Como tercero (empleador, institución),
quiero verificar si un certificado de la plataforma es auténtico ingresando su código,
para confirmar que el estudiante realmente completó el curso.

### Criterios de aceptación

La historia está completa cuando:
- [ ] Existe una URL pública `/verify/:code` que muestra los datos del certificado dado un código válido
- [ ] Si el código no existe, muestra un mensaje de "certificado no encontrado"
- [ ] La página de verificación es accesible sin sesión (visitante anónimo)
- [ ] Los datos mostrados son: nombre del estudiante, curso, instructor y fecha de completación

---

## Historia 3 — Ver mis certificados obtenidos

Como estudiante,
quiero ver todos los certificados que he ganado en un solo lugar,
para acceder a ellos fácilmente sin tener que recordar qué cursos completé.

### Criterios de aceptación

Escenario: Lista de certificados en el dashboard
  Dado que completé al menos un curso
  Cuando accedo a la sección "Mis certificados" en el dashboard
  Entonces veo una lista con: nombre del curso, fecha de completación y botón para descargar el PDF

Escenario: Sin certificados
  Dado que no he completado ningún curso
  Cuando visito la sección de certificados
  Entonces veo un estado vacío con enlace a los cursos disponibles

---

## Notas técnicas

- Nueva tabla: `certificates (id UUID, student_id, course_id, issued_at, verification_code UUID UNIQUE)`
- El PDF puede generarse con una librería como `@react-pdf/renderer` o en un endpoint serverless
- El verification_code es un UUID generado en el momento de emisión del certificado
