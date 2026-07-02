# Feature: Búsqueda y Descubrimiento de Cursos

## Historia 1 — Buscar cursos por texto

Como visitante o estudiante,
quiero buscar cursos por nombre o descripción,
para encontrar contenido relevante sin revisar todo el catálogo.

### Criterios de aceptación

Escenario: Búsqueda con resultados
  Dado que existen cursos publicados
  Cuando ingreso un término en el buscador
  Entonces veo los cursos cuyo título o descripción coincide con la búsqueda
  Y los resultados se actualizan en tiempo real (o al enviar el formulario)

Escenario: Búsqueda sin resultados
  Dado que ningún curso coincide con el término
  Cuando busco ese término
  Entonces veo un estado vacío indicando que no hay resultados

Escenario: Cursos en draft no aparecen en búsqueda
  Dado que un curso está en estado "draft"
  Cuando busco por su título
  Entonces no aparece en los resultados (solo se indexan cursos publicados)

---

## Historia 2 — Explorar cursos destacados en la página principal

Como visitante,
quiero ver cursos destacados al entrar a la plataforma,
para descubrir contenido popular sin necesidad de buscar activamente.

### Criterios de aceptación

La historia está completa cuando:
- [ ] La página principal muestra cursos publicados renderizados del lado del servidor
- [ ] Cada curso muestra título, descripción breve y precio
- [ ] El componente CourseHighlights lista los cursos de forma visual
- [ ] Cursos en draft o archivados no aparecen en el listado
- [ ] La página carga sin sesión activa (acceso público)
