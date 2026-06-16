-- =====================================================================
-- 0001_schema.sql — Modelo de datos (§2 del spec técnico)
-- =====================================================================

-- Enums ---------------------------------------------------------------
create type user_role   as enum ('student', 'instructor');
create type course_state as enum ('draft', 'published', 'archived');

-- profiles: perfil extendido 1:1 con auth.users -----------------------
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  rol        user_role not null default 'student',
  nombre     text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- categories: 1:N con courses ----------------------------------------
create table public.categories (
  id     uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug   text not null unique
);

-- courses -------------------------------------------------------------
create table public.courses (
  id            uuid primary key default gen_random_uuid(),
  instructor_id uuid not null references public.profiles (id) on delete cascade,
  category_id   uuid not null references public.categories (id),
  titulo        text not null,
  descripcion   text,
  precio        numeric(10,2) not null default 0,   -- metadato; sin pasarela de pago
  estado        course_state not null default 'draft',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index courses_instructor_idx on public.courses (instructor_id);
create index courses_category_idx   on public.courses (category_id);
create index courses_estado_idx     on public.courses (estado);

-- lessons -------------------------------------------------------------
create table public.lessons (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references public.courses (id) on delete cascade,
  titulo     text not null,
  contenido  text,
  position   int  not null default 0,
  created_at timestamptz not null default now()
);
create index lessons_course_idx on public.lessons (course_id, position);

-- enrollments: N:N estudiante-curso ----------------------------------
create table public.enrollments (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  course_id  uuid not null references public.courses (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (student_id, course_id)
);
create index enrollments_course_idx  on public.enrollments (course_id);
create index enrollments_student_idx on public.enrollments (student_id);

-- reviews -------------------------------------------------------------
create table public.reviews (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  course_id  uuid not null references public.courses (id) on delete cascade,
  rating     int  not null check (rating between 1 and 5),
  texto      text,
  created_at timestamptz not null default now(),
  unique (student_id, course_id)
);
create index reviews_course_idx on public.reviews (course_id);

-- updated_at trigger para courses ------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger courses_set_updated_at
  before update on public.courses
  for each row execute function public.set_updated_at();
