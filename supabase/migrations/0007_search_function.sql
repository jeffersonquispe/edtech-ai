-- =====================================================================
-- 0007_search_function.sql — Función para búsqueda por similaridad
-- =====================================================================

-- Función para generar embedding de query y buscar cursos similares
create or replace function public.search_courses(
  query_text text,
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
declare
  query_embedding vector(384);
begin
  -- Generar embedding del query usando el modelo gte-small
  -- Nota: Esto requiere llamar a la API de Supabase.ai
  -- Por ahora, retornamos empty set - se debe llamar desde Edge Function

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

-- Función alternativa más simple: búsqueda por embedding precalculado
-- Se usa cuando ya tenemos el embedding del query desde la Edge Function
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
