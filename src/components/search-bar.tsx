"use client";

import { useRef, useState, useEffect } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [value, setValue] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(value);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, onSearch]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="flex items-center border-3 border-theme-border rounded-xl bg-theme-surface shadow-[4px_4px_0px_0px] shadow-theme-border overflow-hidden">
        <div className="flex items-center justify-center w-14 h-14 bg-theme-accent border-r-3 border-theme-border shrink-0">
          <Search size={20} strokeWidth={3} className="text-white" />
        </div>
        <input
          type="text"
          placeholder="Buscar pelis, series..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 h-14 px-4 text-lg font-medium bg-transparent outline-none placeholder:text-theme-text-muted text-theme-text"
        />
      </div>
    </div>
  );
}
