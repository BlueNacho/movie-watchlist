"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Search, List } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 bg-theme-badge border-b-3 border-theme-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="flex items-center justify-center w-9 h-9 bg-theme-accent border-3 border-theme-border rounded-lg shadow-[2px_2px_0px_0px] shadow-theme-border">
            <span className="text-lg leading-none">🎬</span>
          </div>
          <h1 className="hidden sm:block text-lg font-bold tracking-tight text-theme-text">
            Piponcito&apos;s
          </h1>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1.5">
          <Link
            href="/"
            className={`flex items-center gap-1.5 rounded-lg border-3 border-theme-border px-3 py-1.5 font-mono text-xs font-bold transition-all ${
              pathname === "/"
                ? "bg-theme-highlight shadow-[3px_3px_0px_0px] shadow-theme-border"
                : "bg-theme-surface shadow-[2px_2px_0px_0px] shadow-theme-border hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
            }`}
          >
            <Search size={14} strokeWidth={3} />
            <span className="hidden sm:inline">Buscar</span>
          </Link>
          <Link
            href="/watchlist"
            className={`flex items-center gap-1.5 rounded-lg border-3 border-theme-border px-3 py-1.5 font-mono text-xs font-bold transition-all ${
              pathname === "/watchlist"
                ? "bg-theme-highlight shadow-[3px_3px_0px_0px] shadow-theme-border"
                : "bg-theme-surface shadow-[2px_2px_0px_0px] shadow-theme-border hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
            }`}
          >
            <List size={14} strokeWidth={3} />
            <span className="hidden sm:inline">Mi Lista</span>
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            title="Cerrar sesion"
            className="flex h-8 w-8 items-center justify-center rounded-lg border-3 border-theme-border bg-theme-surface shadow-[2px_2px_0px_0px] shadow-theme-border transition-all hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer text-theme-text"
          >
            <LogOut size={14} strokeWidth={3} />
          </button>
        </div>
      </div>
    </header>
  );
}
