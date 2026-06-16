import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/api/auth";
import { pgErrorToResponse, HttpError } from "@/lib/api/errors";

// GET /api/courses/[id]/enrollments — Dueño: ve las inscripciones de su curso.
// RLS limita las filas: estudiante propietario ve las suyas, instructor las de su curso.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  try {
    await requireUser(supabase);
    const { data, error } = await supabase
      .from("enrollments")
      .select("id, student_id, created_at, profiles:student_id(nombre, avatar_url)")
      .eq("course_id", id)
      .order("created_at", { ascending: false });

    if (error) return pgErrorToResponse(error);
    return NextResponse.json({ data });
  } catch (e) {
    if (e instanceof HttpError) return e.toResponse();
    throw e;
  }
}
