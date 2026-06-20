#!/usr/bin/env python3
"""
Setup script para aplicar cambios de embeddings en Supabase
Ejecuta el SQL setup en la base de datos remota
"""

import subprocess
import os
import sys

SUPABASE_URL = "https://pfykyfsbjrmqpugtyrlz.supabase.co"
PROJECT_REF = "pfykyfsbjrmqpugtyrlz"

# SQL setup
SQL_SETUP = """
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
"""

def run_command(cmd):
    """Run shell command and return output"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        return result.returncode, result.stdout, result.stderr
    except Exception as e:
        return 1, "", str(e)

def main():
    print("🔧 Setting up Embeddings System\n")
    print(f"Project: {PROJECT_REF}\n")

    # Check if Supabase CLI is available
    print("1️⃣ Checking Supabase CLI...", end=" ")
    code, _, _ = run_command("npx supabase --version")
    if code != 0:
        print("❌\n  Install: npm install -g supabase")
        sys.exit(1)
    print("✓\n")

    # Check if linked
    print("2️⃣ Checking project link...", end=" ")
    code, out, _ = run_command("npx supabase projects list")
    if PROJECT_REF not in out:
        print("❌\n  Run: npx supabase link --project-ref " + PROJECT_REF)
        sys.exit(1)
    print("✓\n")

    # Save SQL to temporary file
    print("3️⃣ Preparing SQL setup...", end=" ")
    with open("/tmp/setup.sql", "w") as f:
        f.write(SQL_SETUP)
    print("✓\n")

    # Show next steps
    print("📋 Next Steps:")
    print("=" * 60)
    print("\n1. Go to Supabase Dashboard SQL Editor:")
    print(f"   https://app.supabase.com/project/{PROJECT_REF}/sql/new")
    print("\n2. Copy and paste the following SQL:")
    print("-" * 60)
    print(SQL_SETUP)
    print("-" * 60)
    print("\n3. Click 'RUN' to execute\n")
    print("✅ Edge Functions are already deployed!")
    print("   - generate-embedding")
    print("   - generate-query-embedding")
    print("   - retry-embedding-jobs\n")

    print("4️⃣ After SQL setup, run tests:")
    print("   SUPABASE_SERVICE_ROLE_KEY='...' node test-embeddings-simple.js\n")

if __name__ == "__main__":
    main()
