import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/api/auth";
import { pgErrorToResponse, HttpError, jsonError } from "@/lib/api/errors";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/lessons/[id] — Dueño del curso (RLS).
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  try {
    await requireUser(supabase);
    const body = await req.json();
    const allowed = ["titulo", "contenido", "position"] as const;
    const patch: Record<string, unknown> = {};
    for (const k of allowed) if (k in body) patch[k] = body[k];
    if (Object.keys(patch).length === 0) return jsonError(400, "Sin campos para actualizar");

    const { data, error } = await supabase
      .from("lessons")
      .update(patch)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) return pgErrorToResponse(error);
    if (!data) return jsonError(403, "No autorizado o lección inexistente");
    return NextResponse.json({ data });
  } catch (e) {
    if (e instanceof HttpError) return e.toResponse();
    throw e;
  }
}

// DELETE /api/lessons/[id] — Dueño del curso (RLS).
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  try {
    await requireUser(supabase);
    const { data, error } = await supabase
      .from("lessons")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) return pgErrorToResponse(error);
    if (!data) return jsonError(403, "No autorizado o lección inexistente");
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    if (e instanceof HttpError) return e.toResponse();
    throw e;
  }
}
