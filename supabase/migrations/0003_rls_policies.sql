-- =====================================================================
-- 0003_rls_policies.sql — RLS como AUTORIDAD ÚNICA (§3 del spec técnico)
-- Toda decisión de permiso vive aquí. Los endpoints solo traducen errores.
-- =====================================================================

-- Helper SECURITY DEFINER para leer el rol sin recursión de RLS --------
create or replace function public.is_instructor(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = uid and p.rol = 'instructor'
  );
$$;

-- Helpers de pertenencia ----------------------------------------------
create or replace function public.owns_course(uid uuid, cid uuid)
returns boolean
language sql security definer set search_path = public stable
as $$
  select exists (
    select 1 from public.courses c
    where c.id = cid and c.instructor_id = uid
  );
$$;

create or replace function public.is_enrolled(uid uuid, cid uuid)
returns boolean
language sql security definer set search_path = public stable
as $$
  select exists (
    select 1 from public.enrollments e
    where e.course_id = cid and e.student_id = uid
  );
$$;

create or replace function public.course_published(cid uuid)
returns boolean
language sql security definer set search_path = public stable
as $$
  select exists (
    select 1 from public.courses c
    where c.id = cid and c.estado = 'published'
  );
$$;

-- Habilitar RLS en todas las tablas -----------------------------------
alter table public.profiles    enable row level security;
alter table public.categories  enable row level security;
alter table public.courses     enable row level security;
alter table public.lessons     enable row level security;
alter table public.enrollments enable row level security;
alter table public.reviews     enable row level security;

-- profiles ------------------------------------------------------------
create policy profiles_select_public on public.profiles
  for select using (true);
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- categories (catálogo público de solo lectura) -----------------------
create policy categories_select_public on public.categories
  for select using (true);

-- courses -------------------------------------------------------------
create policy courses_select on public.courses
  for select using (
    estado = 'published' or instructor_id = auth.uid()
  );
create policy courses_insert on public.courses
  for insert with check (
    instructor_id = auth.uid() and public.is_instructor(auth.uid())
  );
create policy courses_update on public.courses
  for update using (instructor_id = auth.uid())
            with check (instructor_id = auth.uid());
create policy courses_delete on public.courses
  for delete using (instructor_id = auth.uid());

-- lessons: SELECT = inscrito OR dueño ---------------------------------
create policy lessons_select on public.lessons
  for select using (
    public.owns_course(auth.uid(), course_id)
    or public.is_enrolled(auth.uid(), course_id)
  );
create policy lessons_insert on public.lessons
  for insert with check (public.owns_course(auth.uid(), course_id));
create policy lessons_update on public.lessons
  for update using (public.owns_course(auth.uid(), course_id))
            with check (public.owns_course(auth.uid(), course_id));
create policy lessons_delete on public.lessons
  for delete using (public.owns_course(auth.uid(), course_id));

-- enrollments ---------------------------------------------------------
create policy enrollments_insert on public.enrollments
  for insert with check (
    student_id = auth.uid() and public.course_published(course_id)
  );
create policy enrollments_select on public.enrollments
  for select using (
    student_id = auth.uid() or public.owns_course(auth.uid(), course_id)
  );

-- reviews: INSERT = inscrito; SELECT público; modificar = autor -------
create policy reviews_select_public on public.reviews
  for select using (true);
create policy reviews_insert on public.reviews
  for insert with check (
    student_id = auth.uid() and public.is_enrolled(auth.uid(), course_id)
  );
create policy reviews_update on public.reviews
  for update using (student_id = auth.uid())
            with check (student_id = auth.uid());
create policy reviews_delete on public.reviews
  for delete using (student_id = auth.uid());
