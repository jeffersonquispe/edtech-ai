# Changelog

Todos los cambios notables de este proyecto se documentan aquí.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).

---

## [Unreleased] — Cambios futuros planificados

### Por hacer
- [ ] Panel del instructor para agregar y editar lecciones dentro de un curso
- [ ] Edición de curso publicado (título, descripción, precio, categoría)
- [ ] Archivar curso (`estado: archived`) desde el dashboard
- [ ] Página de perfil de usuario (`/profile`) — editar nombre y avatar
- [ ] Filtro por categoría en la lista de cursos (`/`)
- [ ] Paginación en la lista de cursos
- [ ] Confirmación por correo al registrarse (flujo de Supabase Auth email confirm)

---

## [0.3.0] — 2026-06-17

### Añadido
- Página `/lessons/:id` — visualización de contenido de lección con control de acceso (solo dueño o inscrito)
- Navegación entre lecciones (anterior/siguiente) en la página de lección
- Validación de entrada centralizada (`src/lib/api/validation.ts`):
  - Validación de títulos, texto, precio, rating, posición, UUID
  - Límites de longitud: título (200 chars), texto (5000 chars)
  - Rangos: precio ≥ 0, rating 1-5, position ≥ 0
- Middleware de sesión (`src/middleware.ts`) para refresh automático de token
- Server Actions (`src/app/actions/courses.ts`) para todas las mutaciones:
  - `createCourse()`, `updateCourse()`, `enrollCourse()`
  - `addLesson()`, `submitReview()`, `publishCourse()`
- Índices de base de datos para performance:
  - `courses_created_at_idx` — para sorting por fecha
  - `reviews_course_created_at_idx` — composite para queries de reseñas
  - `lessons_course_position_idx` — composite para lecciones
  - `courses_estado_created_at_idx` — para filtros por estado
- Vista "Mis cursos inscritos" para estudiantes en `/dashboard`

### Mejorado
- Refactorización de formularios a React 19 Server Actions (CreateCourseForm, EnrollButton, ReviewForm, PublishButton)
- Reemplazo de `router.refresh()` por `revalidatePath()` para cache más granular
- Validación exhaustiva en todos los endpoints POST/PATCH
- Error handling mejorado en PublishButton
- Auth state en dashboard ahora queryea tabla `profiles` en lugar de metadata (más seguro)

### Corregido
- **Estudiantes no veían sus cursos inscritos en dashboard** — ahora se listan correctamente
- **Endpoint validación inconsistente** — normalizada en todos los routes
- **Race condition en EnrollButton** — Server Actions previenen clicks duplicados automáticamente

---

## [0.2.0] — 2026-06-12

### Añadido
- UI completa en Next.js 15 (App Router) sin dependencias de UI externas
- `globals.css` — sistema de estilos base (cards, botones, formularios, grid, badges, tabs)
- `Navbar` — barra de navegación reactiva con estado de sesión (login/logout)
- Página `/` — lista de cursos publicados consumiendo la API de Supabase directamente
- Página `/login` — formulario de inicio de sesión con Supabase Auth
- Página `/register` — registro con selección de rol (estudiante / instructor)
- Página `/courses/:id` — detalle de curso con lista de lecciones, reseñas y calificación promedio
- `EnrollButton` — botón de inscripción client-side; redirige a login si no hay sesión
- `ReviewForm` — formulario de reseña disponible solo para estudiantes inscritos
- Página `/dashboard` — panel diferenciado por rol:
  - Instructor: lista de sus cursos con badge de estado + formulario de creación
  - Estudiante: acceso a explorar cursos
- `CreateCourseForm` — formulario para que el instructor cree cursos en estado `draft`
- `PublishButton` — botón para publicar un curso `draft` desde el dashboard
- `src/lib/supabase/client.ts` — cliente Supabase para componentes del navegador

### Corregido
- **Instructor no podía publicar un curso**: se agregó `PublishButton` en el dashboard que llama a `PATCH /api/courses/:id` con `{ estado: 'published' }`
- **Instructor veía el botón "Inscribirse"**: ahora se consulta el perfil del usuario para detectar el rol; si es instructor, el botón de inscripción no se renderiza
- Instructor dueño del curso ve botón "Gestionar en dashboard" en lugar del botón de inscripción

---

## [0.1.0] — 2026-06-12

### Añadido
- Modelo de datos en Supabase: tablas `profiles`, `categories`, `courses`, `lessons`, `enrollments`, `reviews`
- Enums `user_role` (`student`, `instructor`) y `course_state` (`draft`, `published`, `archived`)
- Trigger `updated_at` automático en `courses`
- Trigger de creación de perfil al registrarse (`0002_profiles_trigger.sql`)
- Políticas RLS completas como autoridad única de autorización:
  - Cursos: solo instructor dueño puede insertar/actualizar/eliminar
  - Lecciones: solo dueño del curso puede modificar; inscrito o dueño puede leer
  - Inscripciones: solo en cursos publicados; estudiante ve las suyas, instructor las de su curso
  - Reseñas: solo estudiante inscrito puede insertar; lectura pública
- Funciones helper `is_instructor`, `owns_course`, `is_enrolled`, `course_published`
- Seed de categorías iniciales (`0004_seed_categories.sql`)
- API REST en Next.js 15 App Router:
  - `GET /api/courses` — lista paginada de cursos publicados, filtro por categoría
  - `POST /api/courses` — crear curso (requiere rol instructor)
  - `GET /api/courses/:id` — detalle de curso
  - `PATCH /api/courses/:id` — editar curso (solo dueño)
  - `DELETE /api/courses/:id` — eliminar curso (solo dueño)
  - `GET /api/courses/mine` — cursos del instructor autenticado
  - `GET /api/courses/:id/enrollments` — inscripciones de un curso (solo instructor dueño)
  - `POST /api/courses/:id/enroll` — inscribirse en un curso
  - `GET /api/courses/:id/lessons` — lecciones de un curso
  - `POST /api/courses/:id/lessons` — agregar lección (solo instructor dueño)
  - `PATCH /api/lessons/:id` — editar lección (solo instructor dueño)
  - `DELETE /api/lessons/:id` — eliminar lección (solo instructor dueño)
  - `GET /api/courses/:id/reviews` — reseñas de un curso (público)
  - `POST /api/courses/:id/reviews` — dejar reseña (solo estudiante inscrito)
  - `PATCH /api/reviews/:id` — editar reseña (solo autor)
  - `DELETE /api/reviews/:id` — eliminar reseña (solo autor)
- Manejo de errores centralizado (`pgErrorToResponse`, `HttpError`, `jsonError`)
- Cliente Supabase server-side con cookies SSR (`src/lib/supabase/server.ts`)
