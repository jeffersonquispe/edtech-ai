-- =====================================================================
-- 0006_add_embeddings.sql — Triggers y tabla de jobs para embeddings
-- =====================================================================
-- Nota: El campo embedding y su índice ya existen en la tabla courses

-- Tabla para rastrear intentos de embedding (reintentos + auditoría)
create table public.embedding_jobs (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  action text not null check (action in ('insert', 'update')),
  text_chunk text not null, -- Texto autoexplicativo (titulo | descripcion | categoria)
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  error_message text,
  retry_count int not null default 0,
  max_retries int not null default 3,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Índices para eficiencia
create index embedding_jobs_course_idx on public.embedding_jobs(course_id);
create index embedding_jobs_status_idx on public.embedding_jobs(status);
create index embedding_jobs_retry_idx on public.embedding_jobs(status, retry_count)
  where status = 'failed' and retry_count < max_retries;

-- Función para armar texto autoexplicativo del curso
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

  -- Texto autoexplicativo: cada parte clara y separada
  full_text := concat_ws(
    ' | ',
    'Curso: ' || coalesce(titulo, ''),
    'Descripción: ' || coalesce(descripcion, ''),
    'Categoría: ' || coalesce(category_name, 'General')
  );

  return full_text;
end;
$$;

-- Función para encolar job de embedding
create or replace function public.queue_embedding_job(course_id uuid, action text)
returns void
language plpgsql
security definer
as $$
declare
  text_chunk text;
begin
  -- Construir texto autoexplicativo
  text_chunk := public.build_course_text(course_id);

  -- Insertar job en la tabla (con reintento automático vía trigger)
  insert into public.embedding_jobs (course_id, action, text_chunk)
  values (course_id, action, text_chunk)
  on conflict do nothing;

  -- Llamar a Edge Function (post-commit hook via trigger)
  perform net.http_post(
    url := (select current_setting('app.supabase_url') || '/functions/v1/generate-embedding'),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body := jsonb_build_object(
      'course_id', course_id,
      'text', text_chunk,
      'action', action
    ),
    timeout_milliseconds := 60000
  );
end;
$$;

-- Trigger para INSERT: encolar embedding
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

-- Trigger para UPDATE: re-encolar si cambió contenido relevante
create or replace function public.handle_course_update()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Solo re-embeber si cambió algo que afecta el contenido
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
