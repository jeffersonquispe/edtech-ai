import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/api/auth";
import { pgErrorToResponse, HttpError } from "@/lib/api/errors";

// GET /api/courses/mine — Instructor: sus cursos, incluidos borradores.
export async function GET(_req: NextRequest) {
  const supabase = await createClient();
  try {
    const user = await requireUser(supabase);
    const { data, error } = await supabase
      .from("courses")
      .select("*, categories(slug, nombre)")
      .eq("instructor_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return pgErrorToResponse(error);
    return NextResponse.json({ data });
  } catch (e) {
    if (e instanceof HttpError) return e.toResponse();
    throw e;
  }
}
