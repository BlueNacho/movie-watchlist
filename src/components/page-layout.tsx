"use client";

import { useEffect, useState } from "react";
import { Header } from "./header";
import { TosModal } from "./tos-modal";

export function PageLayout({ children }: { children: React.ReactNode }) {
  const [showTos, setShowTos] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && !data.tosAccepted) {
          setUsername(data.username);
          setShowTos(true);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-theme-bg">
      <Header />
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-8">
        {children}
      </main>
      <footer className="border-t-3 border-theme-border bg-theme-surface py-6">
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">
          <p className="font-mono text-xs text-theme-text-muted">Made with love ❤️</p>
          <p className="font-mono text-xs text-theme-text-muted">2026</p>
        </div>
      </footer>

      {showTos && (
        <TosModal username={username} onAccepted={() => setShowTos(false)} />
      )}
    </div>
  );
}
