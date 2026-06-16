# AI Spec Builder

## Visión del Producto

# Visión del producto 
 La plataforma de cursos en línea tiene como objetivo brindar una experiencia de aprendizaje accesible y personalizada para estudiantes y instructores. Con una arquitectura escalable y segura, la plataforma busca ser la referencia en la educación en línea.

---

## Usuarios y Casos de Uso

# Usuarios 
 * Instructor: crea y edita cursos, tiene acceso a las lecciones y puede ver las inscripciones de los estudiantes. 
 * Estudiante: se inscribe en cursos, accede a las lecciones y puede dejar reseñas.

---

## Funcionalidades

# Funcionalidades 
 * Creación y edición de cursos por parte de los instructores. 
 * Inscripción de estudiantes en cursos. 
 * Acceso a lecciones para estudiantes inscritos. 
 * Sistema de reseñas para estudiantes.

---

## Flujos de Usuario

# Flujos 
 1. **Creación de curso**: el instructor crea un curso y lo publica. 
 2. **Inscripción en curso**: el estudiante se inscribe en un curso. 
 3. **Acceso a lecciones**: el estudiante accede a las lecciones del curso. 
 4. **Creación de reseña**: el estudiante crea una reseña del curso.

---

## Arquitectura

# Arquitectura 
 La plataforma se divide en dos carpetas: backend y frontend. 
 * **Backend**: se utiliza Next.js y Supabase para crear los endpoints y gestionar la base de datos. 
 * **Frontend**: se utiliza Next.js para crear la interfaz de usuario.

---

## Requisitos No Funcionales

# Requisitos no funcionales 
 * **Seguridad**: la plataforma debe cumplir con las reglas de autorización (RLS) definidas. 
 * **Escalabilidad**: la plataforma debe ser capaz de manejar un gran número de usuarios y cursos. 
 * **Disponibilidad**: la plataforma debe estar disponible las 24 horas del día, los 7 días de la semana.
