"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";

interface StarRatingDisplayProps {
  score: number;
  size?: number;
  className?: string;
}

export function StarRatingDisplay({ score, size = 16, className = "" }: StarRatingDisplayProps) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.min(1, Math.max(0, score - (star - 1)));
        return (
          <div key={star} className="relative" style={{ width: size, height: size }}>
            <Star size={size} strokeWidth={2} className="text-theme-border absolute" />
            <div className="absolute overflow-hidden" style={{ width: `${fill * 100}%`, height: size }}>
              <Star size={size} strokeWidth={2} className="text-yellow-500 fill-yellow-400" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface StarRatingInputProps {
  value: number;
  onChange: (score: number) => void;
}

export function StarRatingInput({ value, onChange }: StarRatingInputProps) {
  const [text, setText] = useState(value ? String(value) : "");

  // Sync external value changes
  useEffect(() => {
    setText(value ? String(value) : "");
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setText(raw);
    if (raw === "" || raw === "0") {
      onChange(0);
      return;
    }
    const v = parseFloat(raw);
    if (!isNaN(v) && v >= 0 && v <= 5) {
      onChange(Math.round(v * 10) / 10);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <StarRatingDisplay score={value} size={24} />
      <input
        type="number"
        min="0"
        max="5"
        step="0.1"
        value={text}
        onChange={handleChange}
        placeholder="0.0"
        className="w-20 h-10 rounded-lg border-3 border-theme-border bg-theme-surface px-3 text-center font-mono text-lg font-bold outline-none focus:shadow-[3px_3px_0px_0px] focus:shadow-theme-border transition-shadow"
      />
      <span className="font-mono text-xs text-theme-text-muted">/ 5</span>
    </div>
  );
}
