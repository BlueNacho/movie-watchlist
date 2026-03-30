"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Theme = "blue" | "pink";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "blue",
  setTheme: () => {},
});

function getThemeFromCookie(): Theme {
  if (typeof document === "undefined") return "blue";
  const match = document.cookie.match(/pipones-theme=(blue|pink)/);
  return (match?.[1] as Theme) || "blue";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getThemeFromCookie);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
  }, []);

  // Sync from server session on mount (in case cookie is stale)
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.theme && data.theme !== theme) {
          setTheme(data.theme);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
