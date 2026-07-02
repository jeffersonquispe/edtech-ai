# Feature: Dashboard de Usuario

## Historia 1 — Dashboard del instructor

Como instructor autenticado,
quiero ver mis cursos creados y su estado en un panel centralizado,
para gestionar mi contenido sin tener que navegar curso por curso.

### Criterios de aceptación

Escenario: Vista del instructor
  Dado que soy un instructor autenticado
  Cuando accedo a /dashboard
  Entonces veo la lista de mis cursos con título, estado (draft/published/archived) y opciones de edición
  Y veo un botón para crear un nuevo curso

Escenario: Sin cursos creados
  Dado que soy un instructor nuevo sin cursos
  Cuando accedo al dashboard
  Entonces veo un estado vacío con invitación a crear el primer curso

---

## Historia 2 — Dashboard del estudiante

Como estudiante autenticado,
quiero ver los cursos en los que estoy inscrito,
para acceder rápidamente a mi contenido en progreso.

### Criterios de aceptación

Escenario: Vista del estudiante
  Dado que soy un estudiante autenticado con inscripciones
  Cuando accedo a /dashboard
  Entonces veo solo mis cursos inscritos (vista diferente a la del instructor)
  Y puedo hacer clic en cada curso para ir a sus lecciones

Escenario: Sin inscripciones
  Dado que soy un estudiante sin cursos inscritos
  Cuando accedo al dashboard
  Entonces veo un estado vacío con enlace al catálogo de cursos

---

## Historia 3 — Navbar reactiva según sesión

Como cualquier usuario de la plataforma,
quiero que la barra de navegación muestre opciones relevantes según mi estado de sesión y rol,
para no ver opciones que no me corresponden o que no puedo usar.

### Criterios de aceptación

La historia está completa cuando:
- [ ] La Navbar muestra "Iniciar sesión / Registrarse" cuando no hay sesión
- [ ] Con sesión activa, muestra acceso al dashboard y cierre de sesión
- [ ] El estado se actualiza reactivamente al hacer login o logout sin recargar la página (via onAuthStateChange)
- [ ] El rol del usuario no se filtra en la Navbar; es el dashboard quien adapta su vista
