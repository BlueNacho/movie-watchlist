"use client";

import Link from "next/link";
import { IPhoneHomeIcon } from "./iphone-home-icon";

export function HomeButton() {
  return (
    <Link
      href="/"
      id="home-button"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center w-12 h-12 rounded-full border-3 border-theme-border bg-theme-surface shadow-[3px_3px_0px_0px] shadow-theme-border transition-all hover:shadow-[1px_1px_0px_0px] hover:shadow-theme-border hover:translate-y-[2px] active:scale-95"
    >
      <IPhoneHomeIcon size={22} className="text-theme-text" />
    </Link>
  );
}
