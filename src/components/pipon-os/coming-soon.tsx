"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { HomeButton } from "./home-button";

export function ComingSoon({ title }: { title: string }) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-theme-bg">
      <header className="sticky top-0 z-50 bg-theme-badge border-b-3 border-theme-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border-3 border-theme-border bg-theme-surface shadow-[2px_2px_0px_0px] shadow-theme-border transition-all hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer text-theme-text"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-theme-text">{title}</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 rounded-xl border-3 border-theme-border bg-theme-surface shadow-[4px_4px_0px_0px] shadow-theme-border p-10">
          <span className="text-6xl">🚧</span>
          <h2 className="text-xl font-bold text-theme-text">Proximamente...</h2>
          <p className="text-sm text-theme-text-muted font-mono text-center">Esta app esta en desarrollo.</p>
        </div>
      </main>

      <HomeButton />
    </div>
  );
}
