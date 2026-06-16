import { NextResponse } from "next/server";
import type { PostgrestError } from "@supabase/supabase-js";

/**
 * Traduce errores de Postgres/PostgREST a códigos HTTP.
 * La REGLA de autorización vive en RLS; aquí solo mapeamos el resultado.
 */
export function pgErrorToResponse(error: PostgrestError) {
  switch (error.code) {
    case "23505": // unique_violation → recurso duplicado (inscripción/reseña repetida)
      return jsonError(409, "El recurso ya existe", error);
    case "23514": // check_violation → p. ej. rating fuera de 1..5
      return jsonError(400, "Datos inválidos", error);
    case "23503": // foreign_key_violation → referencia inexistente
      return jsonError(400, "Referencia inválida", error);
    case "42501": // insufficient_privilege → bloqueado por RLS (write)
    case "PGRST301": // JWT/permiso insuficiente
      return jsonError(403, "No autorizado", error);
    default:
      return jsonError(400, error.message || "Solicitud inválida", error);
  }
}

export function jsonError(
  status: number,
  message: string,
  detail?: PostgrestError | null,
) {
  return NextResponse.json(
    { error: message, code: detail?.code ?? null },
    { status },
  );
}

/** Exige sesión; devuelve el user o lanza una respuesta 401. */
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
  toResponse() {
    return jsonError(this.status, this.message);
  }
}
