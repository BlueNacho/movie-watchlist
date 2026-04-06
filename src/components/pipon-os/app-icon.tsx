"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface AppIconProps {
  href: string;
  label: string;
  icon?: LucideIcon;
  emoji?: string;
  color?: string;
  comingSoon?: boolean;
  badge?: number;
  id?: string;
}

export function AppIcon({ href, label, icon: Icon, emoji, color = "bg-theme-surface", comingSoon, badge, id }: AppIconProps) {
  if (comingSoon) {
    return (
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-3 border-dashed border-theme-border bg-theme-surface-alt opacity-40">
          {emoji && <span className="text-2xl sm:text-3xl">{emoji}</span>}
          {Icon && <Icon size={28} strokeWidth={2} className="text-theme-text-muted" />}
        </div>
        <span className="text-[10px] sm:text-xs font-bold text-theme-text-muted">{label}</span>
      </div>
    );
  }

  return (
    <Link href={href} id={id} className="flex flex-col items-center gap-1.5 group">
      <div className="relative">
        <div className={`flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-3 border-theme-border ${color} shadow-[3px_3px_0px_0px] shadow-theme-border transition-all group-hover:bg-theme-highlight group-hover:shadow-[1px_1px_0px_0px] group-hover:shadow-theme-border group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-active:bg-theme-highlight group-active:scale-95`}>
          {emoji && <span className="text-2xl sm:text-3xl">{emoji}</span>}
          {Icon && <Icon size={28} strokeWidth={2} />}
        </div>
        {badge != null && badge > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[20px] h-5 rounded-full bg-red-500 border-2 border-theme-bg px-1 text-[10px] font-bold text-white">
            {badge}
          </span>
        )}
      </div>
      <span className="text-[10px] sm:text-xs font-bold text-theme-text">{label}</span>
    </Link>
  );
}
