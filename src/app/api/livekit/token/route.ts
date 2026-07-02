import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { AccessToken } from "livekit-server-sdk";
import { createClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";

export const runtime = "nodejs";

/**
 * POST /api/livekit/token — Emite un token de acceso a LiveKit para el cliente del agente Edy.
 *
 * Auth OPCIONAL: Edy es un agente de ventas para visitantes. Si hay sesión, se incluye
 * el user.id como identity y en attributes (`student_id`) para que las tools de
 * enrollment del agente lo reciban. Si es anónimo, se genera una identidad de visitante.
 *
 * El secreto LIVEKIT_API_SECRET vive SOLO aquí (server). Nunca se expone al cliente.
 */
export async function POST(req: NextRequest) {
  const url = process.env.LIVEKIT_URL;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const clientUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? url;

  if (!url || !apiKey || !apiSecret) {
    return jsonError(500, "LiveKit no está configurado (revisa las variables de entorno)");
  }

  // Sesión opcional — no bloqueamos a visitantes anónimos.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const studentId = user?.id ?? null;
  const identity = studentId ?? `visitor-${randomUUID()}`;

  // Permite reutilizar una room enviada por el cliente; si no, una por sesión.
  let requestedRoom: string | undefined;
  try {
    const body = await req.json();
    requestedRoom = typeof body?.room === "string" ? body.room : undefined;
  } catch {
    // body vacío — ok
  }
  const room = requestedRoom ?? `edy-${identity}`;

  const at = new AccessToken(apiKey, apiSecret, {
    identity,
    // Pasa el student_id al agente vía metadata/attributes de participante.
    metadata: JSON.stringify({ student_id: studentId }),
    attributes: studentId ? { student_id: studentId } : undefined,
  });
  at.addGrant({
    room,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true, // necesario para el chat de texto (data/text streams)
  });

  const token = await at.toJwt();
  return NextResponse.json({ token, url: clientUrl, room });
}
