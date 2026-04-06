"use client";

import Image from "next/image";
import { Dog, Cat } from "lucide-react";

interface UserAvatarProps {
  username: string;
  avatarUrl?: string | null;
  size?: number;
  className?: string;
}

export function UserAvatar({ username, avatarUrl, size = 40, className = "" }: UserAvatarProps) {
  const colorClass = username === "vicki" ? "bg-pink-200 text-pink-600" : "bg-blue-200 text-blue-600";
  const iconSize = Math.round(size * 0.45);

  return (
    <div
      className={`relative flex items-center justify-center rounded-full border-2 border-theme-border overflow-hidden ${!avatarUrl ? colorClass : ""} ${className}`}
      style={{ width: size, height: size }}
    >
      {avatarUrl ? (
        <Image src={avatarUrl} alt={username} fill className="object-cover" sizes={`${size}px`} />
      ) : (
        username === "vicki" ? <Dog size={iconSize} strokeWidth={2.5} /> : <Cat size={iconSize} strokeWidth={2.5} />
      )}
    </div>
  );
}
