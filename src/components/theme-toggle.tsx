"use client";

import { useTheme } from "@/lib/theme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 rounded-lg border-3 border-theme-border bg-theme-surface px-3 py-1.5 font-mono text-xs font-bold shadow-[3px_3px_0px_0px] shadow-theme-border transition-all hover:shadow-[1px_1px_0px_0px] hover:shadow-theme-border hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer"
      title={`Cambiar a tema ${theme === "blue" ? "rosa" : "celeste"}`}
    >
      <div className={`w-4 h-4 rounded-full border-2 border-theme-border ${
        theme === "blue" ? "bg-blue-300" : "bg-pink-300"
      }`} />
      <span className="hidden sm:inline text-theme-text">
        {theme === "blue" ? "Celeste" : "Rosa"}
      </span>
    </button>
  );
}
