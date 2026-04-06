"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Search, List } from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Close on escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/30"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-theme-surface border-r-3 border-theme-border flex flex-col transition-transform duration-200 ${
          open ? "translate-x-0 shadow-[6px_0px_0px_0px] shadow-theme-border" : "-translate-x-[calc(100%+6px)]"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b-3 border-theme-border bg-theme-card-bar">
          <span className="font-bold text-theme-text text-lg">Menu</span>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-theme-border bg-theme-surface text-theme-text hover:bg-theme-highlight transition-colors cursor-pointer"
          >
            <X size={16} strokeWidth={3} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-2 p-4 flex-1">
          <Link
            href="/watchlist/search"
            className={`flex items-center gap-3 rounded-lg border-3 border-theme-border px-4 py-3 font-bold text-sm transition-all ${
              pathname === "/watchlist/search"
                ? "bg-theme-highlight shadow-[3px_3px_0px_0px] shadow-theme-border"
                : "bg-theme-surface shadow-[2px_2px_0px_0px] shadow-theme-border hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
            }`}
          >
            <Search size={18} strokeWidth={2.5} />
            Buscar
          </Link>
          <Link
            href="/watchlist"
            className={`flex items-center gap-3 rounded-lg border-3 border-theme-border px-4 py-3 font-bold text-sm transition-all ${
              pathname === "/watchlist"
                ? "bg-theme-highlight shadow-[3px_3px_0px_0px] shadow-theme-border"
                : "bg-theme-surface shadow-[2px_2px_0px_0px] shadow-theme-border hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
            }`}
          >
            <List size={18} strokeWidth={2.5} />
            La listita ❤️
          </Link>
        </nav>
      </div>
    </>
  );
}
