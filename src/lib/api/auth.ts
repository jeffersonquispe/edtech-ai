import type { SupabaseClient, User } from "@supabase/supabase-js";
import { HttpError } from "./errors";

/** Devuelve el usuario autenticado o lanza HttpError(401). */
export async function requireUser(supabase: SupabaseClient): Promise<User> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new HttpError(401, "Autenticación requerida");
  return user;
}
