"use client";

import { useState } from "react";

interface Props {
  username: string;
  onAccepted: () => void;
}

export function TosModal({ username, onAccepted }: Props) {
  const [accepting, setAccepting] = useState(false);

  async function handleAccept() {
    setAccepting(true);
    const res = await fetch("/api/auth/accept-tos", { method: "POST" });
    if (res.ok) {
      onAccepted();
    }
    setAccepting(false);
  }

  const isVicki = username === "vicki";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border-3 border-theme-border bg-theme-surface shadow-[8px_8px_0px_0px] shadow-theme-border overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b-3 border-theme-border bg-theme-card-bar">
          <div className="w-3 h-3 rounded-full border-2 border-theme-border bg-theme-surface" />
          <div className="w-3 h-3 rounded-full border-2 border-theme-border bg-theme-surface" />
          <span className="ml-2 font-mono text-xs text-theme-text-muted">terminos-y-condiciones.mkv</span>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col items-center gap-6 text-center">
          <div className="text-6xl">📜</div>

          <h2 className="text-2xl font-bold text-theme-text">
            Terminos y Condiciones
          </h2>

          <div className="rounded-xl border-3 border-theme-border bg-theme-surface-alt p-5">
            <p className="text-base text-theme-text leading-relaxed">
              {isVicki ? (
                <>
                  Para usar esta app acepto que le debo a <span className="font-bold">Nacho</span> un minimo de <span className="font-bold">347 besitos</span> 😘 y <span className="font-bold">52 siestitas acurrucados</span> 😴
                </>
              ) : (
                <>
                    Para usar esta app acepto que le debo a <span className="font-bold">Vicki</span> un minimo de <span className="font-bold">347 besitos</span> 😘 y <span className="font-bold">52 siestitas acurrucados</span> 😴
                </>
              )}
            </p>
          </div>

          <p className="font-mono text-[10px] text-theme-text-muted">
            * Estos terminos son legalmente vinculantes y no se pueden apelar jeje.
          </p>

          <button
            onClick={handleAccept}
            disabled={accepting}
            className="w-full h-14 rounded-lg border-3 border-theme-border bg-theme-highlight font-bold text-lg shadow-[4px_4px_0px_0px] shadow-theme-border transition-all hover:shadow-[2px_2px_0px_0px] hover:shadow-theme-border hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer disabled:opacity-50"
          >
            {accepting ? "Aceptando..." : "Acepto ❤️"}
          </button>
        </div>
      </div>
    </div>
  );
}
