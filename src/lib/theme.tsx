"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "blue" | "pink";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "blue",
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("blue");

  useEffect(() => {
    // Try to get theme from user session
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data?.theme === "blue" || data?.theme === "pink") {
          setTheme(data.theme);
        }
      })
      .catch(() => {
        // Not logged in, use localStorage fallback
        const saved = localStorage.getItem("pipones-theme") as Theme | null;
        if (saved === "blue" || saved === "pink") {
          setTheme(saved);
        }
      });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("pipones-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "blue" ? "pink" : "blue"));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
