import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/api/auth";
import { pgErrorToResponse, HttpError, jsonError } from "@/lib/api/errors";

// GET /api/courses/[id]/lessons — Inscrito o Dueño (RLS). [] si no autorizado, no 403.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("id, titulo, contenido, position")
    .eq("course_id", id)
    .order("position", { ascending: true });

  if (error) return pgErrorToResponse(error);
  return NextResponse.json({ data: data ?? [] });
}

// POST /api/courses/[id]/lessons — Dueño crea lección (RLS).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  try {
    await requireUser(supabase);
    const body = await req.json();
    const { titulo, contenido, position } = body ?? {};
    if (!titulo) return jsonError(400, "titulo es obligatorio");

    const { data, error } = await supabase
      .from("lessons")
      .insert({ course_id: id, titulo, contenido: contenido ?? null, position: position ?? 0 })
      .select()
      .single();

    if (error) return pgErrorToResponse(error);
    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    if (e instanceof HttpError) return e.toResponse();
    throw e;
  }
}
