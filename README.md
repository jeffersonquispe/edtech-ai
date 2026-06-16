# EdTech Platform

Plataforma de cursos en línea completa con soporte para instructores y estudiantes. Construida con **Next.js 15**, **TypeScript**, **Supabase** y **Row Level Security (RLS)** como autoridad única de autorización.

---

## 🎯 Visión del Producto

Brindar una experiencia de aprendizaje accesible y personalizada para estudiantes e instructores, con una arquitectura escalable y segura, siendo la referencia en educación en línea.

---

## 👥 Tipos de Usuario

### Instructor
- Crear y editar cursos (título, descripción, categoría, precio)
- Agregar lecciones a sus cursos
- Publicar/archivar cursos para control de visibilidad
- Ver quiénes están inscritos en sus cursos
- Panel de gestión desde `/dashboard`

### Estudiante
- Explorar cursos publicados
- Inscribirse en cursos
- Acceder a lecciones de cursos inscritos
- Dejar reseñas y calificaciones (⭐ 1-5 estrellas)
- Gestionar sus inscripciones desde `/dashboard`

---

## ✨ Características Principales

- **Autenticación** con Supabase Auth (email/contraseña)
- **Cursos** con estados (draft, published, archived)
- **Lecciones** ordenadas con posición dentro de cada curso
- **Inscripciones** con restricción: solo en cursos publicados
- **Reseñas** — una por estudiante por curso, con rating 1-5
- **Seguridad** — RLS a nivel de base de datos, no solo en frontend
- **API REST** — 17 endpoints totalmente tipados
- **UI moderna** — sin dependencias externas, CSS limpio y responsivo

---

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+
- Cuenta Supabase (con proyecto configurado)
- Variables de entorno en `.env`

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repo>
   cd Proyecto1
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno** (`.env` ya configurado):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

4. **Aplicar migraciones a Supabase**
   ```bash
   # Desde el dashboard de Supabase o con Supabase CLI:
   supabase db push
   ```

5. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000)

---

## 📋 Comandos

```bash
npm run dev          # Servidor de desarrollo (hot reload)
npm run build        # Build para producción
npm start            # Inicia el servidor compilado
npm run lint         # ESLint
npm run test         # Ejecuta tests (Vitest)
npm run test:watch   # Tests en watch mode
```

---

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── api/                    # API REST endpoints
│   │   ├── courses/            # CRUD de cursos + inscripciones + lecciones
│   │   ├── lessons/            # Editar/eliminar lecciones
│   │   └── reviews/            # Reseñas
│   ├── courses/                # Página de detalles de curso
│   │   ├── [id]/
│   │   │   ├── page.tsx       # Server component
│   │   │   ├── EnrollButton.tsx # Client component
│   │   │   └── ReviewForm.tsx   # Client component
│   ├── dashboard/              # Panel del usuario (role-aware)
│   │   ├── page.tsx           # Instructor: crear/publicar cursos
│   │   ├── CreateCourseForm.tsx
│   │   └── PublishButton.tsx
│   ├── login/                  # Página de inicio de sesión
│   ├── register/               # Página de registro (rol selector)
│   ├── page.tsx               # Home — lista de cursos publicados
│   ├── layout.tsx             # Root layout + Navbar
│   └── globals.css            # Estilos base
├── lib/
│   ├── supabase/
│   │   ├── server.ts          # Cliente Supabase server-side (RLS-aware)
│   │   └── client.ts          # Cliente Supabase browser-side
│   └── api/
│       ├── auth.ts            # `requireUser()` helper
│       └── errors.ts          # Manejo centralizado de errores (pgErrorToResponse)
├── components/
│   └── Navbar.tsx             # Barra de navegación reactiva
└── middleware.ts              # (Futuro) Protección de rutas

supabase/
├── migrations/
│   ├── 0001_schema.sql        # Modelo de datos (tablas, enums, triggers)
│   ├── 0002_profiles_trigger.sql  # Crear perfil al registrarse
│   ├── 0003_rls_policies.sql  # Políticas RLS
│   └── 0004_seed_categories.sql   # Categorías iniciales

CLAUDE.md              # Documentación interna para Claude Code
CHANGELOG.md           # Historial de cambios (Keep a Changelog)
README.md              # Este archivo
```

---

## 🔌 API Endpoints

### Cursos

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/api/courses` | ❌ | Listar cursos publicados (paginado, filtro categoría) |
| `POST` | `/api/courses` | ✅ Instructor | Crear curso en draft |
| `GET` | `/api/courses/:id` | ❌ | Detalle de curso |
| `PATCH` | `/api/courses/:id` | ✅ Dueño | Editar curso |
| `DELETE` | `/api/courses/:id` | ✅ Dueño | Eliminar curso |
| `GET` | `/api/courses/mine` | ✅ | Mis cursos (instructor) |
| `GET` | `/api/courses/:id/enrollments` | ✅ Dueño | Ver inscripciones |
| `POST` | `/api/courses/:id/enroll` | ✅ | Inscribirse |

### Lecciones

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/api/courses/:id/lessons` | ❌ | Listar lecciones (RLS: inscrito o dueño) |
| `PATCH` | `/api/lessons/:id` | ✅ Dueño | Editar lección |
| `DELETE` | `/api/lessons/:id` | ✅ Dueño | Eliminar lección |

### Reseñas

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/api/courses/:id/reviews` | ❌ | Ver reseñas (público) |
| `POST` | `/api/courses/:id/reviews` | ✅ Inscrito | Dejar reseña |
| `PATCH` | `/api/reviews/:id` | ✅ Autor | Editar reseña |
| `DELETE` | `/api/reviews/:id` | ✅ Autor | Eliminar reseña |

---

## 🔐 Seguridad

### Row Level Security (RLS)

**La RLS es la autoridad única de autorización.** Las políticas en `supabase/migrations/0003_rls_policies.sql` garantizan:

- **Cursos**: solo el instructor dueño puede crear/editar/eliminar
- **Lecciones**: solo el dueño del curso puede modificar; inscrito o dueño puede leer
- **Inscripciones**: restricción de unicidad + solo en cursos publicados
- **Reseñas**: solo estudiante inscrito puede dejar; lectura pública

Los errores PostgreSQL se mapean a códigos HTTP:
- `23505` (unique violation) → 409 Conflict
- `42501` (insufficient privilege) → 403 Forbidden
- `23503` (foreign key violation) → 400 Bad Request

---

## 🗄️ Modelo de Datos

```sql
profiles (1:1 con auth.users)
├── id (UUID, PK)
├── rol (student | instructor)
├── nombre (TEXT)
└── avatar_url (TEXT)

categories
├── id (UUID, PK)
├── nombre (TEXT)
└── slug (TEXT, UNIQUE)

courses
├── id (UUID, PK)
├── instructor_id (FK → profiles)
├── category_id (FK → categories)
├── titulo (TEXT)
├── descripcion (TEXT)
├── precio (NUMERIC)
├── estado (draft | published | archived)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

lessons
├── id (UUID, PK)
├── course_id (FK → courses)
├── titulo (TEXT)
├── contenido (TEXT)
├── position (INT)
└── created_at (TIMESTAMPTZ)

enrollments (N:N)
├── id (UUID, PK)
├── student_id (FK → profiles)
├── course_id (FK → courses)
├── created_at (TIMESTAMPTZ)
└── UNIQUE (student_id, course_id)

reviews
├── id (UUID, PK)
├── student_id (FK → profiles)
├── course_id (FK → courses)
├── rating (INT, 1-5)
├── texto (TEXT)
├── created_at (TIMESTAMPTZ)
└── UNIQUE (student_id, course_id)
```

---

## 📖 Flujos de Usuario

### 1. Crear y Publicar un Curso (Instructor)

```
1. Registrarse en /register (rol: instructor)
2. Ir a /dashboard
3. Llenar el formulario "Crear nuevo curso"
4. El curso se crea en estado "draft"
5. Hacer clic en "Publicar" para que sea visible
6. (Futuro) Agregar lecciones desde el dashboard
```

### 2. Inscribirse en un Curso (Estudiante)

```
1. Registrarse en /register (rol: student)
2. Ir a / (explorar cursos)
3. Hacer clic en un curso publicado
4. Hacer clic en "Inscribirse"
5. Ahora puedes ver las lecciones y dejar reseñas
```

### 3. Dejar una Reseña (Estudiante)

```
1. Estar inscrito en el curso
2. En la página del curso, llenar el formulario de reseña
3. Seleccionar calificación (1-5 estrellas)
4. Opcionalmente escribir un comentario
5. Enviar
```

---

## 🌐 Deployment

### Vercel

```bash
# Push a un repositorio Git
git push

# Vercel se despliega automáticamente
# Las variables de entorno se configuran en Project Settings
```

**Verificar deploy:**
```bash
vercel --prod
```

---

## 📚 Próximas Características

- [ ] Vista completa de lecciones con contenido multimedia
- [ ] Panel de instructor para agregar/editar lecciones
- [ ] Vista "Mis cursos inscritos" para estudiantes
- [ ] Edición de curso publicado
- [ ] Archivar cursos
- [ ] Página de perfil de usuario
- [ ] Filtros y búsqueda avanzada
- [ ] Middleware de protección de rutas
- [ ] Confirmación por correo al registrarse

Ver [CHANGELOG.md](CHANGELOG.md) para detalles completos.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **Estilos** | CSS vanilla (globals.css) |
| **Backend** | Next.js API Routes, Supabase |
| **Base de Datos** | PostgreSQL (Supabase) + RLS |
| **Autenticación** | Supabase Auth |
| **Testing** | Vitest |
| **Linting** | ESLint |
| **Hosting** | Vercel (recomendado) |

---

## 📝 Contribuir

1. Lee [CLAUDE.md](CLAUDE.md) para entender la arquitectura
2. Revisa [CHANGELOG.md](CHANGELOG.md) para el estado actual
3. Sigue el patrón RLS: la autorización vive en la base de datos
4. Sin librerías UI externas (mantener el proyecto ligero)

---

## 📄 Licencia

MIT

---

## 📧 Soporte

Para preguntas o issues, contacta a: **jeffersonquispep@gmail.com**

---

**Última actualización:** 2026-06-15
