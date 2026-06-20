
-- =====================================================================
-- Setup Embeddings System
-- =====================================================================

-- 1. Create embedding_jobs table
create table if not exists public.embedding_jobs (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  action text not null check (action in ('insert', 'update')),
  text_chunk text not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  error_message text,
  retry_count int not null default 0,
  max_retries int not null default 3,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists embedding_jobs_course_idx on public.embedding_jobs(course_id);
create index if not exists embedding_jobs_status_idx on public.embedding_jobs(status);
create index if not exists embedding_jobs_retry_idx on public.embedding_jobs(status, retry_count)
  where status = 'failed' and retry_count < max_retries;

-- 2. Create helper functions
create or replace function public.build_course_text(course_id uuid)
returns text
language plpgsql
security definer
as $$
declare
  titulo text;
  descripcion text;
  category_name text;
  full_text text;
begin
  select
    c.titulo,
    c.descripcion,
    cat.nombre
  into titulo, descripcion, category_name
  from public.courses c
  left join public.categories cat on c.category_id = cat.id
  where c.id = course_id;

  full_text := concat_ws(
    ' | ',
    'Curso: ' || coalesce(titulo, ''),
    'Descripción: ' || coalesce(descripcion, ''),
    'Categoría: ' || coalesce(category_name, 'General')
  );

  return full_text;
end;
$$;

create or replace function public.queue_embedding_job(course_id uuid, action text)
returns void
language plpgsql
security definer
as $$
declare
  text_chunk text;
begin
  text_chunk := public.build_course_text(course_id);

  insert into public.embedding_jobs (course_id, action, text_chunk)
  values (course_id, action, text_chunk)
  on conflict do nothing;
end;
$$;

-- 3. Create triggers
create or replace function public.handle_course_insert()
returns trigger
language plpgsql
security definer
as $$
begin
  perform public.queue_embedding_job(new.id, 'insert');
  return new;
end;
$$;

drop trigger if exists courses_insert_embedding on public.courses;
create trigger courses_insert_embedding
  after insert on public.courses
  for each row
  execute function public.handle_course_insert();

create or replace function public.handle_course_update()
returns trigger
language plpgsql
security definer
as $$
begin
  if (
    old.titulo is distinct from new.titulo or
    old.descripcion is distinct from new.descripcion or
    old.category_id is distinct from new.category_id
  ) then
    perform public.queue_embedding_job(new.id, 'update');
  end if;
  return new;
end;
$$;

drop trigger if exists courses_update_embedding on public.courses;
create trigger courses_update_embedding
  after update on public.courses
  for each row
  execute function public.handle_course_update();

-- 4. Create search function
create or replace function public.search_courses_by_embedding(
  query_embedding vector(384),
  limit_count int default 10
)
returns table (
  id uuid,
  titulo text,
  descripcion text,
  precio numeric,
  estado text,
  instructor_id uuid,
  similarity float8
)
language plpgsql
security definer
as $$
begin
  return query
  select
    c.id,
    c.titulo,
    c.descripcion,
    c.precio,
    c.estado,
    c.instructor_id,
    (1 - (c.embedding <=> query_embedding))::float8 as similarity
  from public.courses c
  where c.embedding is not null
    and c.estado = 'published'
  order by similarity desc
  limit limit_count;
end;
$$;
