import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/api/auth";
import { pgErrorToResponse, HttpError } from "@/lib/api/errors";

type Params = { params: Promise<{ id: string }> };

// POST /api/lessons/[id]/complete — Marca la lección como completada (estudiante inscrito, vía RLS).
export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  try {
    const user = await requireUser(supabase);
    const { error } = await supabase
      .from("lesson_completions")
      .insert({ student_id: user.id, lesson_id: id });

    // Ya estaba marcada como completada: idempotente, no es un error.
    if (error && error.code !== "23505") return pgErrorToResponse(error);
    return NextResponse.json({ data: { lesson_id: id, completed: true } });
  } catch (e) {
    if (e instanceof HttpError) return e.toResponse();
    throw e;
  }
}

// DELETE /api/lessons/[id]/complete — Desmarca la lección (estudiante inscrito, vía RLS).
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  try {
    const user = await requireUser(supabase);
    const { error } = await supabase
      .from("lesson_completions")
      .delete()
      .eq("student_id", user.id)
      .eq("lesson_id", id);

    if (error) return pgErrorToResponse(error);
    return NextResponse.json({ data: { lesson_id: id, completed: false } });
  } catch (e) {
    if (e instanceof HttpError) return e.toResponse();
    throw e;
  }
}
