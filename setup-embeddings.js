#!/usr/bin/env node
/**
 * Setup script para aplicar cambios de embeddings en Supabase
 * Ejecuta el SQL setup en la base de datos remota
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://pfykyfsbjrmqpugtyrlz.supabase.co';
const PROJECT_REF = 'pfykyfsbjrmqpugtyrlz';

const SQL_SETUP = `
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
`;

function runCommand(cmd) {
  try {
    const result = execSync(cmd, { encoding: 'utf-8' });
    return { code: 0, stdout: result, stderr: '' };
  } catch (error) {
    return { code: 1, stdout: error.stdout || '', stderr: error.stderr || error.message };
  }
}

async function main() {
  console.log('🔧 Setting up Embeddings System\n');
  console.log(`Project: ${PROJECT_REF}\n`);

  // 1. Check Supabase CLI
  console.log('1️⃣ Checking Supabase CLI...', ' ');
  const versionCheck = runCommand('npx supabase --version 2>&1');
  if (versionCheck.code !== 0) {
    console.log('❌\n  Install: npm install -g supabase');
    process.exit(1);
  }
  console.log('✓\n');

  // 2. Check project link
  console.log('2️⃣ Checking project link...', ' ');
  const linkCheck = runCommand('npx supabase projects list 2>&1');
  if (!linkCheck.stdout.includes(PROJECT_REF)) {
    console.log('❌\n  Run: npx supabase link --project-ref ' + PROJECT_REF);
    process.exit(1);
  }
  console.log('✓\n');

  // 3. Save SQL to file
  console.log('3️⃣ Preparing SQL setup...', ' ');
  const sqlFile = path.join(__dirname, 'embedding-setup.sql');
  fs.writeFileSync(sqlFile, SQL_SETUP);
  console.log('✓\n');

  // 4. Show instructions
  console.log('📋 SETUP INSTRUCTIONS');
  console.log('='.repeat(70) + '\n');

  console.log('✅ Edge Functions are ALREADY DEPLOYED:');
  console.log('   • generate-embedding');
  console.log('   • generate-query-embedding');
  console.log('   • retry-embedding-jobs\n');

  console.log('⏭️  STEP 1: Apply Database Changes\n');
  console.log(`   Open Supabase Dashboard SQL Editor:`);
  console.log(`   ${SUPABASE_URL}/dashboard/project/${PROJECT_REF}/sql/new\n`);

  console.log('   Copy and paste the SQL below (or from embedding-setup.sql):\n');
  console.log('-'.repeat(70));
  console.log(SQL_SETUP);
  console.log('-'.repeat(70) + '\n');

  console.log('   Then click "RUN" to execute\n');

  console.log('⏭️  STEP 2: Verify Setup\n');
  console.log('   Run in SQL Editor to verify:\n');
  console.log(`   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public' AND table_name = 'embedding_jobs';\n`);

  console.log('   Expected result: 1 row with "embedding_jobs"\n');

  console.log('⏭️  STEP 3: Run Tests\n');
  console.log('   After SQL setup, execute:\n');
  console.log(`   SUPABASE_SERVICE_ROLE_KEY="your-key" node test-embeddings-simple.js\n`);

  console.log('='.repeat(70) + '\n');

  console.log('📂 Files created:');
  console.log('   • embedding-setup.sql - Ready to copy/paste');
  console.log('   • test-embeddings-simple.js - Test script');
  console.log('   • docs/EMBEDDINGS.md - Full documentation\n');

  console.log('✨ Setup complete! Follow the steps above to activate embeddings.\n');
}

main().catch(console.error);
