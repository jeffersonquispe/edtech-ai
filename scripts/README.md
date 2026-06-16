# Scripts

## seed-courses.js

Inserta 7 cursos de ejemplo en la plataforma para pruebas y demostración.

### Uso

```bash
npm run seed:courses
```

### Qué hace

1. **Crea un instructor de prueba** (si no existe):
   - Email: `instructor@example.com`
   - Contraseña: `InstructorPassword123!`
   - Rol: instructor

2. **Inserta 7 cursos publicados** con datos realistas:
   - Introducción a React 19 (Programación, S/ 49.99)
   - Diseño UI/UX para principiantes (Diseño, S/ 39.99)
   - Estrategia de Marketing Digital (Marketing, S/ 59.99)
   - Python para Ciencia de Datos (Ciencia de Datos, S/ 69.99)
   - Emprenderismo 101 (Negocios, S/ 44.99)
   - Advanced TypeScript Patterns (Programación, S/ 79.99)
   - Branding & Identidad Visual (Diseño, S/ 54.99)

3. **Todos los cursos están publicados** — visibles inmediatamente en la página de inicio

### Requisitos

- Variables de entorno configuradas (.env)
- Supabase proyecto con migraciones aplicadas
- Servidor Next.js no necesita estar corriendo

### Después de ejecutar

- Abre [http://localhost:3000](http://localhost:3000) para ver los cursos
- Puedes iniciar sesión con el instructor demo: `instructor@example.com` / `InstructorPassword123!`
- Los estudiantes pueden inscribirse en cualquiera de los cursos
