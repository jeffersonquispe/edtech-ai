# Feature: Gestión de Cursos (Instructor)

## Historia 1 — Crear curso

Como instructor,
quiero crear un nuevo curso con título, descripción y precio,
para ofrecer mi contenido a los estudiantes de la plataforma.

### Criterios de aceptación

Escenario: Creación exitosa
  Dado que soy un instructor autenticado en el dashboard
  Cuando completo el formulario de creación con título, descripción y precio válidos
  Entonces el curso se crea en estado "draft"
  Y aparece en mi lista de cursos del dashboard

Escenario: Campos requeridos vacíos
  Dado que dejo el título en blanco
  Cuando intento guardar el curso
  Entonces veo un mensaje de validación
  Y el curso no se crea

Escenario: Intento de creación sin ser instructor
  Dado que soy un estudiante autenticado
  Cuando intento hacer POST a /api/courses directamente
  Entonces recibo 403 Forbidden (RLS lo bloquea)

---

## Historia 2 — Editar curso

Como instructor propietario de un curso,
quiero editar el título, descripción o precio de mi curso,
para mantener la información actualizada antes o después de publicarlo.

### Criterios de aceptación

Escenario: Edición exitosa
  Dado que soy el propietario del curso
  Cuando modifico los campos y guardo
  Entonces los cambios se reflejan inmediatamente en la vista del curso

Escenario: Otro instructor intenta editar
  Dado que no soy el propietario del curso
  Cuando intento hacer PATCH a /api/courses/:id
  Entonces recibo 403 Forbidden

---

## Historia 3 — Eliminar curso

Como instructor propietario de un curso,
quiero eliminar un curso que ya no quiero ofrecer,
para mantener limpio mi catálogo y evitar inscripciones indeseadas.

### Criterios de aceptación

Escenario: Eliminación exitosa
  Dado que soy el propietario y el curso está en draft
  Cuando confirmo la eliminación
  Entonces el curso desaparece de mi dashboard y del catálogo público

Escenario: No propietario intenta eliminar
  Dado que no soy el dueño del curso
  Cuando intento DELETE a /api/courses/:id
  Entonces recibo 403 Forbidden

---

## Historia 4 — Publicar / despublicar curso

Como instructor,
quiero cambiar el estado de mi curso entre "draft" y "published",
para controlar cuándo está visible para que los estudiantes puedan inscribirse.

### Criterios de aceptación

Escenario: Publicar curso draft
  Dado que mi curso está en draft con al menos una lección
  Cuando hago clic en "Publicar"
  Entonces el estado cambia a "published"
  Y el curso aparece en el catálogo público

Escenario: Cursos no publicados no visibles al público
  Dado que mi curso está en draft
  Entonces no aparece en el listado de la página principal
  Y los estudiantes no pueden inscribirse
