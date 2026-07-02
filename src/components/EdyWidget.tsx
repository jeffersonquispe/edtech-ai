"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Burbuja flotante global que abre al agente Edy (voz + texto) dentro de un iframe.
 * El iframe (/agente-edy) solo se monta al abrir, para no pedir micrófono ni
 * conectar a LiveKit en cada carga de página.
 */
export default function EdyWidget() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // No anidar el widget dentro de su propio iframe.
  if (pathname?.startsWith("/agente-edy")) return null;

  return (
    <>
      {open && (
        <div className="edy-widget-panel">
          <iframe
            src="/agente-edy"
            allow="microphone; autoplay"
            title="Asistente Edy"
            className="edy-widget-iframe"
          />
        </div>
      )}

      <button
        className="edy-widget-fab"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Cerrar asistente Edy" : "Abrir asistente Edy"}
        title="Asistente Edy"
      >
        {open ? "✕" : "💬"}
      </button>

      <style>{`
        .edy-widget-fab {
          position: fixed; bottom: 20px; right: 20px; z-index: 1000;
          width: 56px; height: 56px; border-radius: 50%; border: none;
          background: var(--color-indigo, #5B4FFF); color: #fff;
          font-size: 24px; cursor: pointer;
          box-shadow: 0 6px 20px rgba(91,79,255,.35);
          display: flex; align-items: center; justify-content: center;
          transition: transform .15s ease;
        }
        .edy-widget-fab:hover { transform: scale(1.06); }
        .edy-widget-panel {
          position: fixed; bottom: 88px; right: 20px; z-index: 1000;
          width: min(380px, calc(100vw - 40px));
          height: min(600px, calc(100dvh - 120px));
          border-radius: 16px; overflow: hidden; background: #fff;
          box-shadow: 0 12px 40px rgba(0,0,0,.22);
          border: 1px solid rgba(0,0,0,.06);
        }
        .edy-widget-iframe { width: 100%; height: 100%; border: 0; display: block; }
      `}</style>
    </>
  );
}
