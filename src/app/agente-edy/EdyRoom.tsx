"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useVoiceAssistant,
  useTranscriptions,
} from "@livekit/components-react";
import "@livekit/components-styles";

type TokenResponse = { token: string; url: string; room: string };

type ChatMessage = {
  id: string;
  from: "user" | "edy";
  text: string;
};

export default function EdyRoom() {
  const [conn, setConn] = useState<TokenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/livekit/token", { method: "POST" })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json())?.error ?? "Error obteniendo token");
        return r.json();
      })
      .then((data: TokenResponse) => {
        if (active) setConn(data);
      })
      .catch((e) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <div className="edy-state">
        <p>No se pudo conectar con Edy.</p>
        <small>{error}</small>
      </div>
    );
  }

  if (!conn) {
    return (
      <div className="edy-state">
        <p>Conectando con Edy…</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={conn.url}
      token={conn.token}
      connect
      audio
      video={false}
      data-lk-theme="default"
      style={{ height: "100dvh" }}
    >
      <EdyConversation />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

function EdyConversation() {
  const { state } = useVoiceAssistant();
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();
  const transcriptions = useTranscriptions();
  const [input, setInput] = useState("");
  const [textMessages, setTextMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Une transcripciones de voz (usuario y Edy) con los mensajes de texto enviados.
  // La transcripción del propio participante local es del usuario; el resto, de Edy.
  const localIdentity = localParticipant.identity;
  const voiceMessages: ChatMessage[] = transcriptions.map((seg, i) => ({
    id: seg.streamInfo?.id ?? `tx-${i}`,
    from: seg.participantInfo?.identity === localIdentity ? "user" : "edy",
    text: seg.text,
  }));

  const messages = [...textMessages, ...voiceMessages];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages.length]);

  const toggleMic = useCallback(() => {
    localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
  }, [localParticipant, isMicrophoneEnabled]);

  const sendText = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const text = input.trim();
      if (!text) return;
      setInput("");
      setTextMessages((m) => [
        ...m,
        { id: `local-${Date.now()}`, from: "user", text },
      ]);
      try {
        await localParticipant.sendText(text, { topic: "lk.chat" });
      } catch (err) {
        console.error("Error enviando texto a Edy", err);
      }
    },
    [input, localParticipant],
  );

  const stateLabel: Record<string, string> = {
    connecting: "Conectando…",
    initializing: "Iniciando…",
    listening: "Escuchando",
    thinking: "Pensando…",
    speaking: "Hablando",
    disconnected: "Desconectado",
  };

  return (
    <div className="edy-room">
      <header className="edy-header">
        <span className="edy-title">Edy · Asistente</span>
        <span className="edy-status">{stateLabel[state] ?? state}</span>
      </header>

      <div className="edy-messages" ref={scrollRef}>
        {messages.length === 0 ? (
          <p className="edy-hint">
            Habla por el micrófono o escribe tu pregunta sobre los cursos.
          </p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`edy-msg edy-msg-${m.from}`}>
              {m.text}
            </div>
          ))
        )}
      </div>

      <form className="edy-input-row" onSubmit={sendText}>
        <button
          type="button"
          onClick={toggleMic}
          className={`edy-mic ${isMicrophoneEnabled ? "on" : "off"}`}
          title={isMicrophoneEnabled ? "Silenciar micrófono" : "Activar micrófono"}
          aria-label="Alternar micrófono"
        >
          {isMicrophoneEnabled ? "🎙️" : "🔇"}
        </button>
        <input
          className="edy-text-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje…"
        />
        <button type="submit" className="edy-send" disabled={!input.trim()}>
          Enviar
        </button>
      </form>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
.edy-state { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100dvh; gap:8px; font-family:system-ui,sans-serif; color:#3a3a3a; }
.edy-state small { color:#b00020; max-width:80%; text-align:center; }
.edy-room { display:flex; flex-direction:column; height:100dvh; font-family:system-ui,sans-serif; background:#fafafb; }
.edy-header { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; background:#5B4FFF; color:#fff; }
.edy-title { font-weight:600; }
.edy-status { font-size:12px; opacity:.85; background:rgba(255,255,255,.18); padding:3px 10px; border-radius:99px; }
.edy-messages { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:8px; }
.edy-hint { color:#888; font-size:14px; text-align:center; margin:auto; }
.edy-msg { max-width:78%; padding:9px 13px; border-radius:14px; font-size:14px; line-height:1.4; white-space:pre-wrap; }
.edy-msg-user { align-self:flex-end; background:#5B4FFF; color:#fff; border-bottom-right-radius:4px; }
.edy-msg-edy { align-self:flex-start; background:#ececf3; color:#1c1c1c; border-bottom-left-radius:4px; }
.edy-input-row { display:flex; align-items:center; gap:8px; padding:10px 12px; border-top:1px solid #e6e6ec; background:#fff; }
.edy-mic { border:none; background:#f0f0f5; width:40px; height:40px; border-radius:50%; cursor:pointer; font-size:18px; flex:0 0 auto; }
.edy-mic.on { background:#d9f5e3; }
.edy-text-input { flex:1; border:1px solid #dcdce4; border-radius:99px; padding:9px 14px; font-size:14px; outline:none; }
.edy-text-input:focus { border-color:#5B4FFF; }
.edy-send { border:none; background:#5B4FFF; color:#fff; border-radius:99px; padding:9px 16px; font-size:14px; cursor:pointer; }
.edy-send:disabled { opacity:.5; cursor:default; }
`;
