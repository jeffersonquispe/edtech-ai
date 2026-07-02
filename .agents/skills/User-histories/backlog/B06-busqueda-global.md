# B06 — Búsqueda Global en la Navbar

**Prioridad:** Media
**Por qué ahora:** La búsqueda semántica (SearchCourses con embeddings) existe pero solo está en la home. Un estudiante dentro de un curso no puede buscar otro curso sin volver al inicio.

---

## Historia 1 — Buscar cursos desde cualquier página

Como visitante o estudiante navegando la plataforma,
quiero acceder al buscador de cursos desde la barra de navegación sin importar en qué página esté,
para encontrar contenido relevante sin tener que volver a la página principal.

### Criterios de aceptación

Escenario: Buscador visible en la Navbar
  Dado que estoy en cualquier página de la plataforma (dashboard, detalle de curso, lección)
  Entonces veo un campo de búsqueda o ícono de lupa en la Navbar

Escenario: Búsqueda con resultados
  Dado que escribo un término en la barra de búsqueda de la Navbar
  Cuando presiono Enter o el ícono de búsqueda
  Entonces soy redirigido a la página principal con los resultados filtrados por ese término
  O veo un dropdown de resultados en tiempo real bajo la barra

Escenario: Búsqueda vacía
  Dado que intento buscar con el campo vacío
  Cuando presiono Enter
  Entonces no se realiza ninguna búsqueda ni redireccionamiento

---

## Historia 2 — Ver sugerencias mientras escribo (autocompletado)

Como usuario buscando un curso,
quiero ver sugerencias de cursos mientras escribo en la barra de búsqueda,
para llegar más rápido al curso que busco sin tener que escribir el título completo.

### Criterios de aceptación

Escenario: Sugerencias aparecen tras 2+ caracteres
  Dado que escribo al menos 2 caracteres en la barra de búsqueda
  Entonces aparece un dropdown con hasta 5 cursos relevantes en tiempo real

Escenario: Clic en sugerencia
  Dado que veo sugerencias en el dropdown
  Cuando hago clic en una
  Entonces soy redirigido directamente a la página de ese curso

Escenario: Sin coincidencias
  Dado que el término no coincide con ningún curso
  Entonces el dropdown muestra "No se encontraron cursos" en lugar de quedarse vacío

---

## Notas técnicas

- El componente `SearchCourses.tsx` ya existe con lógica de debounce y búsqueda vectorial
- La Navbar (`src/components/Navbar.tsx`) necesita integrar este componente o una versión compacta de él
- El modo autocompletado puede reusar `/api/courses/search` con un parámetro `?limit=5&suggest=true`
