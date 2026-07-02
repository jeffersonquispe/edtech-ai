# Historias de Usuario — EdTech LMS

Historias de usuario por feature de la plataforma. Cada archivo sigue el formato del skill `user-stories`: rol-objetivo-beneficio + criterios de aceptación en Gherkin o checklist.

## Features implementados

| # | Feature | Archivo |
|---|---------|---------|
| 01 | Autenticación (registro, login, logout) | [01-autenticacion.md](./01-autenticacion.md) |
| 02 | Gestión de cursos — instructor (crear, editar, eliminar, publicar) | [02-gestion-cursos.md](./02-gestion-cursos.md) |
| 03 | Gestión de lecciones (agregar, editar, eliminar, ver) | [03-lecciones.md](./03-lecciones.md) |
| 04 | Inscripciones a cursos | [04-inscripciones.md](./04-inscripciones.md) |
| 05 | Reseñas de cursos | [05-reseñas.md](./05-reseñas.md) |
| 06 | Búsqueda y descubrimiento de cursos | [06-busqueda-cursos.md](./06-busqueda-cursos.md) |
| 07 | Dashboard de usuario (instructor y estudiante) | [07-dashboard.md](./07-dashboard.md) |
| 08 | Agente de voz Edy (LiveKit) | [08-agente-edy.md](./08-agente-edy.md) |

## Roles del sistema

- **Visitante** — sin sesión; puede ver catálogo y reseñas públicas
- **Estudiante** — registrado con rol `student`; puede inscribirse, ver lecciones, dejar reseñas
- **Instructor** — registrado con rol `instructor`; puede crear y gestionar cursos y lecciones

## Notas de arquitectura

La autorización **no se verifica en el código de las rutas API** — se delega completamente a RLS de Supabase. Los criterios de aceptación que describen errores 403 están garantizados por políticas RLS, no por lógica de negocio en el endpoint.
