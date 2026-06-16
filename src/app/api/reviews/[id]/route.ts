import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/api/auth";
import { pgErrorToResponse, HttpError, jsonError } from "@/lib/api/errors";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/reviews/[id] — Autor (RLS).
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  try {
    await requireUser(supabase);
    const body = await req.json();
    const patch: Record<string, unknown> = {};
    if ("rating" in body) {
      if (typeof body.rating !== "number" || body.rating < 1 || body.rating > 5) {
        return jsonError(400, "rating debe ser un entero entre 1 y 5");
      }
      patch.rating = body.rating;
    }
    if ("texto" in body) patch.texto = body.texto;
    if (Object.keys(patch).length === 0) return jsonError(400, "Sin campos para actualizar");

    const { data, error } = await supabase
      .from("reviews")
      .update(patch)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) return pgErrorToResponse(error);
    if (!data) return jsonError(403, "No autorizado o reseña inexistente");
    return NextResponse.json({ data });
  } catch (e) {
    if (e instanceof HttpError) return e.toResponse();
    throw e;
  }
}

// DELETE /api/reviews/[id] — Autor (RLS).
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  try {
    await requireUser(supabase);
    const { data, error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) return pgErrorToResponse(error);
    if (!data) return jsonError(403, "No autorizado o reseña inexistente");
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    if (e instanceof HttpError) return e.toResponse();
    throw e;
  }
}
