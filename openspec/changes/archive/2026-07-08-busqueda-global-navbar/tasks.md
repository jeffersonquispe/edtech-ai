## 1. Componente `NavbarSearch`

- [x] 1.1 Crear `src/components/NavbarSearch.tsx` (client component) con input compacto, estado `query`/`suggestions`/`loading`/`open`
- [x] 1.2 Implementar debounce (300ms) que llama a `POST /api/courses/search` con `{ query, limit: 5 }` cuando `query.trim().length >= 2`
- [x] 1.3 Renderizar dropdown de sugerencias (título + precio) bajo el input, incluyendo estado "No se encontraron cursos" cuando `results.length === 0`
- [x] 1.4 Cerrar el dropdown al hacer clic fuera (listener `mousedown` en `document` + `ref`) o al presionar Escape
- [x] 1.5 Al hacer clic en una sugerencia: navegar a `/courses/[id]`, limpiar el input y cerrar el dropdown
- [x] 1.6 Implementar `onSubmit` (Enter / clic en ícono de lupa): si `query.trim()` está vacío no hacer nada; si no, navegar a `/?q=<query>` vía `router.push` y cerrar el dropdown

## 2. Integración en la Navbar

- [x] 2.1 Importar y montar `<NavbarSearch />` en `src/components/Navbar.tsx`, visible en todas las páginas donde la Navbar se renderiza (respetando el `return null` existente para `/agente-edy`)
- [x] 2.2 Ajustar estilos/layout de la Navbar para acomodar el campo de búsqueda sin romper el layout responsive existente (logo, links, botón salir)

## 3. Home: precarga de búsqueda vía query param

- [x] 3.1 En `src/app/page.tsx`, leer `searchParams.q` (server component) y pasarlo como prop `initialQuery` a `SearchCourses`
- [x] 3.2 En `src/components/SearchCourses.tsx`, aceptar prop opcional `initialQuery`; si está presente, setear `query` y disparar `performSearch(initialQuery)` en un `useEffect` al montar

## 4. Verificación

- [x] 4.1 Probar manualmente: buscar desde dashboard/detalle de curso/lección redirige a `/?q=...` con resultados filtrados
- [x] 4.2 Probar autocompletado: 2+ caracteres muestra hasta 5 sugerencias; clic navega al curso; término sin coincidencias muestra "No se encontraron cursos"
- [x] 4.3 Probar búsqueda vacía: Enter/clic en lupa con campo vacío no navega ni hace request
- [x] 4.4 Correr `npm run lint` y `npm run test` (gates locales del flujo del proyecto)
