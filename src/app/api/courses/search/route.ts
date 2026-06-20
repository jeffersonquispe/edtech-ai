import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { pgErrorToResponse, jsonError } from '@/lib/api/errors';

// POST /api/courses/search — Búsqueda por similitud de embedding
// Body: { query: string, limit?: number }
// Retorna: cursos publicados ordenados por similitud de embedding
export async function POST(req: NextRequest) {
  const supabase = await createClient();

  try {
    const body = await req.json();
    const { query, limit = 10 } = body ?? {};

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return jsonError(400, 'query es obligatorio y debe ser un string no vacío');
    }

    const parsedLimit = Math.min(Math.max(1, Number(limit) || 10), 50);

    // Generar embedding del query usando fetch a Edge Function embdedding-query
    // Primero intentamos generar el embedding del query
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return jsonError(500, 'Missing Supabase configuration');
    }

    // Llamar a función para generar embedding del query
    let queryEmbedding: number[] | null = null;

    try {
      const embeddingRes = await fetch(
        `${supabaseUrl}/functions/v1/generate-query-embedding`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ text: query }),
        }
      );

      if (embeddingRes.ok) {
        const embeddingData = await embeddingRes.json();
        queryEmbedding = embeddingData.embedding;
      } else {
        console.warn('Failed to generate query embedding, falling back to text search');
      }
    } catch (error) {
      console.warn('Error generating query embedding:', error);
    }

    // Si tenemos embedding, usar búsqueda vectorial
    if (queryEmbedding) {
      const { data, error } = await supabase.rpc('search_courses_by_embedding', {
        query_embedding: queryEmbedding,
        limit_count: parsedLimit,
      });

      if (error) {
        console.warn('RPC search failed, falling back to text search:', error);
      } else {
        return NextResponse.json({
          data: data ?? [],
          count: (data ?? []).length,
          search_type: 'vector',
        });
      }
    }

    // Fallback: búsqueda por texto (búsqueda full-text o simple LIKE)
    const { data, error } = await supabase
      .from('courses')
      .select('id, titulo, descripcion, precio, estado, instructor_id')
      .eq('estado', 'published')
      .or(`titulo.ilike.%${query}%,descripcion.ilike.%${query}%`)
      .limit(parsedLimit);

    if (error) return pgErrorToResponse(error);

    return NextResponse.json({
      data: data ?? [],
      count: (data ?? []).length,
      search_type: 'text',
    });
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'Unknown error';
    console.error('Error in search:', errorMsg);
    return jsonError(500, 'Error al buscar cursos');
  }
}
