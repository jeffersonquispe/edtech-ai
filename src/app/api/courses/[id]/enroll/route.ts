import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/api/auth";
import { pgErrorToResponse, HttpError } from "@/lib/api/errors";

// POST /api/courses/[id]/enroll — Estudiante. 409 si ya inscrito (UNIQUE).
// RLS rechaza si el curso no está 'published'.
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  try {
    const user = await requireUser(supabase);
    const { data, error } = await supabase
      .from("enrollments")
      .insert({ student_id: user.id, course_id: id })
      .select()
      .single();

    if (error) return pgErrorToResponse(error); // 23505 → 409, 42501 → 403
    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    if (e instanceof HttpError) return e.toResponse();
    throw e;
  }
}
