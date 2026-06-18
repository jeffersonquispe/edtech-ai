-- =====================================================================
-- 0005_add_indexes.sql — Índices de performance
-- =====================================================================

-- Índices para sorting de cursos por fecha
create index if not exists courses_created_at_idx
  on public.courses (created_at desc);

-- Índices composites para reviews y lessons (course_id + ordering)
create index if not exists reviews_course_created_at_idx
  on public.reviews (course_id, created_at desc);

create index if not exists lessons_course_position_idx
  on public.lessons (course_id, position);

-- Índices para búsquedas por estado
create index if not exists courses_estado_created_at_idx
  on public.courses (estado, created_at desc);

-- Índices para queries de instructor
create index if not exists courses_instructor_created_at_idx
  on public.courses (instructor_id, created_at desc);
