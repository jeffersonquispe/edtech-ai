-- =====================================================================
-- 0008_lesson_completions.sql — Progreso de lecciones (B01)
-- RLS sigue siendo la autoridad única de autorización.
-- =====================================================================

create table public.lesson_completions (
  student_id   uuid not null references public.profiles (id) on delete cascade,
  lesson_id    uuid not null references public.lessons (id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (student_id, lesson_id)
);
create index lesson_completions_student_idx on public.lesson_completions (student_id);
create index lesson_completions_lesson_idx  on public.lesson_completions (lesson_id);

-- Helper: ¿el usuario está inscrito en el curso dueño de esta lección? ---
create or replace function public.is_enrolled_lesson(uid uuid, lid uuid)
returns boolean
language sql security definer set search_path = public stable
as $$
  select exists (
    select 1 from public.lessons l
    where l.id = lid and public.is_enrolled(uid, l.course_id)
  );
$$;

alter table public.lesson_completions enable row level security;

create policy lesson_completions_select on public.lesson_completions
  for select using (
    student_id = auth.uid()
  );
create policy lesson_completions_insert on public.lesson_completions
  for insert with check (
    student_id = auth.uid() and public.is_enrolled_lesson(auth.uid(), lesson_id)
  );
create policy lesson_completions_delete on public.lesson_completions
  for delete using (
    student_id = auth.uid()
  );
