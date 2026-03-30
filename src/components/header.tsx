"use client";

import { useCallback, useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./sidebar";

export function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.username) setUsername(data.username);
      })
      .catch(() => {});
  }, []);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <>
      <header className="sticky top-0 z-50 bg-theme-badge border-b-3 border-theme-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border-3 border-theme-border bg-theme-surface shadow-[2px_2px_0px_0px] shadow-theme-border transition-all hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer text-theme-text"
          >
            <Menu size={18} strokeWidth={2.5} />
          </button>
          <h1 className="text-lg sm:text-xl font-[family-name:var(--font-title)] font-semibold text-theme-text">
            Piponcito&apos;s Watchlist
          </h1>
        </div>
      </header>

      <Sidebar open={sidebarOpen} onClose={closeSidebar} username={username} />
    </>
  );
}
