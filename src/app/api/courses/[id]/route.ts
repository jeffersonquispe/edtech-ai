import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/api/auth";
import { pgErrorToResponse, HttpError, jsonError } from "@/lib/api/errors";

type Params = { params: Promise<{ id: string }> };

// GET /api/courses/[id] — detalle de curso publicado (o borrador si dueño, vía RLS).
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("*, categories(slug, nombre)")
    .eq("id", id)
    .maybeSingle();

  if (error) return pgErrorToResponse(error);
  if (!data) return jsonError(404, "Curso no encontrado");
  return NextResponse.json({ data });
}

// PATCH /api/courses/[id] — Dueño (RLS bloquea si no lo es). Incluye publicar (estado).
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  try {
    await requireUser(supabase);
    const body = await req.json();
    const allowed = ["titulo", "descripcion", "category_id", "precio", "estado"] as const;
    const patch: Record<string, unknown> = {};
    for (const k of allowed) if (k in body) patch[k] = body[k];
    if (Object.keys(patch).length === 0) {
      return jsonError(400, "Sin campos para actualizar");
    }

    const { data, error } = await supabase
      .from("courses")
      .update(patch)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) return pgErrorToResponse(error);
    if (!data) return jsonError(403, "No autorizado o curso inexistente");
    return NextResponse.json({ data });
  } catch (e) {
    if (e instanceof HttpError) return e.toResponse();
    throw e;
  }
}

// DELETE /api/courses/[id] — Dueño. Cascade a lessons/enrollments/reviews.
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  try {
    await requireUser(supabase);
    const { data, error } = await supabase
      .from("courses")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) return pgErrorToResponse(error);
    if (!data) return jsonError(403, "No autorizado o curso inexistente");
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    if (e instanceof HttpError) return e.toResponse();
    throw e;
  }
}
