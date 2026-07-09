## Why

La búsqueda semántica de cursos (`SearchCourses.tsx` + `POST /api/courses/search`) solo está disponible en la home. Un estudiante que navega dentro de un curso, una lección o el dashboard no tiene forma de buscar otro curso sin volver primero a la página principal, lo que rompe el flujo de descubrimiento de contenido.

## What Changes

- Se agrega un campo de búsqueda compacto a la `Navbar` (`src/components/Navbar.tsx`), visible en todas las páginas donde la Navbar se renderiza.
- Al enviar una búsqueda (Enter o clic en el ícono), se redirige a `/?q=<término>` y la home aplica el filtro de búsqueda automáticamente.
- La home (`src/app/page.tsx`) lee el query param `q` y, si está presente, ejecuta la búsqueda al cargar (reusando la lógica de `SearchCourses`).
- Mientras el usuario escribe en la Navbar (2+ caracteres), aparece un dropdown de autocompletado con hasta 5 sugerencias de cursos, obtenidas de `POST /api/courses/search` con `limit=5`.
- Clic en una sugerencia navega directamente a `/courses/[id]`.
- Sin coincidencias, el dropdown muestra "No se encontraron cursos".
- Búsqueda vacía no dispara navegación ni request.
- No se modifica el contrato del endpoint `/api/courses/search` (ya soporta `limit`); se añade un modo compacto de reutilización desde la Navbar.

## Capabilities

### New Capabilities
- `navbar-search`: búsqueda de cursos accesible desde la Navbar en cualquier página, con autocompletado en tiempo real y redirección a resultados en la home.

### Modified Capabilities
(ninguna — no hay spec existente para `courses-search`; el endpoint no cambia su contrato)

## Impact

- **Componentes**: `src/components/Navbar.tsx` (nuevo campo de búsqueda + dropdown), nuevo componente `src/components/NavbarSearch.tsx` (lógica de debounce/autocompletado, similar a `SearchCourses.tsx`).
- **Páginas**: `src/app/page.tsx` (leer `?q=` de la URL y precargar resultados de búsqueda).
- **API**: reutiliza `POST /api/courses/search` existente, sin cambios de contrato.
- **Sin cambios de base de datos ni RLS.**
