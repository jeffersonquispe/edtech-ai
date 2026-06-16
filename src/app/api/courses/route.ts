import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/api/auth";
import { pgErrorToResponse, HttpError, jsonError } from "@/lib/api/errors";

// GET /api/courses — público. Solo cursos publicados (RLS). Filtro ?category=<slug>.
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));
  const from = (page - 1) * limit;

  let query = supabase
    .from("courses")
    .select("id, titulo, descripcion, precio, estado, category_id, instructor_id, categories!inner(slug)")
    .eq("estado", "published")
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  if (category) query = query.eq("categories.slug", category);

  const { data, error } = await query;
  if (error) return pgErrorToResponse(error);
  return NextResponse.json({ data, page, limit });
}

// POST /api/courses — Instructor (RLS valida rol+dueño). 201.
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  try {
    const user = await requireUser(supabase);
    const body = await req.json();
    const { titulo, descripcion, category_id, precio, estado } = body ?? {};
    if (!titulo || !category_id) {
      return jsonError(400, "titulo y category_id son obligatorios");
    }

    const { data, error } = await supabase
      .from("courses")
      .insert({
        instructor_id: user.id,
        titulo,
        descripcion: descripcion ?? null,
        category_id,
        precio: precio ?? 0,
        estado: estado ?? "draft",
      })
      .select()
      .single();

    if (error) return pgErrorToResponse(error);
    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    if (e instanceof HttpError) return e.toResponse();
    throw e;
  }
}
