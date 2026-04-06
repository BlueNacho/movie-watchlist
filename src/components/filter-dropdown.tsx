"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  label: string;
  options: Option[];
  value: string | null;
  onChange: (value: string | null) => void;
  showReset?: boolean;
}

export function FilterDropdown({ label, options, value, onChange, showReset = true }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + window.scrollY + 6, left: rect.left + window.scrollX });
    }
  }, [open]);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 self-start rounded-lg border-3 border-theme-border px-3 py-2 font-mono text-xs font-bold transition-all cursor-pointer ${
          value
            ? "bg-theme-highlight shadow-[3px_3px_0px_0px] shadow-theme-border"
            : "bg-theme-surface shadow-[2px_2px_0px_0px] shadow-theme-border"
        }`}
      >
        <span className="truncate max-w-[120px]">{selectedLabel || label}</span>
        <ChevronDown size={14} strokeWidth={3} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && createPortal(
        <>
          <div className="fixed inset-0 z-[300]" onClick={() => setOpen(false)} />
          <div
            className="absolute z-[301] w-48 max-h-60 overflow-y-auto rounded-lg border-3 border-theme-border bg-theme-surface shadow-[4px_4px_0px_0px] shadow-theme-border"
            style={{ top: pos.top, left: pos.left }}
          >
            {showReset && (
              <button
                onClick={() => { onChange(null); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors hover:bg-theme-surface-alt ${
                  !value ? "bg-theme-highlight" : ""
                }`}
              >
                Todos
              </button>
            )}
            {options.map((opt, i) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors hover:bg-theme-surface-alt ${(i > 0 || showReset) ? "border-t border-theme-badge" : ""} ${
                  value === opt.value ? "bg-theme-highlight" : ""
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </>
  );
}
