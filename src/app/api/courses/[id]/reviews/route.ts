import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/api/auth";
import { pgErrorToResponse, HttpError, jsonError } from "@/lib/api/errors";

// GET /api/courses/[id]/reviews — público.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, texto, student_id, created_at, profiles:student_id(nombre, avatar_url)")
    .eq("course_id", id)
    .order("created_at", { ascending: false });

  if (error) return pgErrorToResponse(error);
  return NextResponse.json({ data: data ?? [] });
}

// POST /api/courses/[id]/reviews — Estudiante inscrito (RLS). 409 si ya reseñó (UNIQUE).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  try {
    const user = await requireUser(supabase);
    const body = await req.json();
    const { rating, texto } = body ?? {};
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return jsonError(400, "rating debe ser un entero entre 1 y 5");
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert({ student_id: user.id, course_id: id, rating, texto: texto ?? null })
      .select()
      .single();

    if (error) return pgErrorToResponse(error); // 23505 → 409 (ya reseñó), 42501 → 403 (no inscrito)
    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    if (e instanceof HttpError) return e.toResponse();
    throw e;
  }
}
