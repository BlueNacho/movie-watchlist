"use client";

import Image from "next/image";
import { posterUrl, genreName } from "@/lib/tmdb";
import type { TMDBItem } from "@/lib/tmdb";

interface MovieCardProps {
  item: TMDBItem;
  onClick: (item: TMDBItem) => void;
}

export function MovieCard({ item, onClick }: MovieCardProps) {
  const poster = posterUrl(item.poster_path, "w342");
  const year = item.release_date?.split("-")[0];
  const rating = item.vote_average?.toFixed(1);
  const isTv = item.media_type === "tv";

  return (
    <button
      onClick={() => onClick(item)}
      className="group relative flex flex-col overflow-hidden rounded-xl border-3 border-theme-border bg-theme-surface shadow-[4px_4px_0px_0px] shadow-theme-border transition-all duration-200 hover:shadow-[6px_6px_0px_0px] hover:shadow-theme-border hover:-translate-x-[2px] hover:-translate-y-[2px] cursor-pointer text-left"
    >
      {/* Window title bar */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b-3 border-theme-border bg-theme-card-bar">
        <div className="w-2.5 h-2.5 rounded-full border-2 border-theme-border bg-theme-surface" />
        <div className="w-2.5 h-2.5 rounded-full border-2 border-theme-border bg-theme-surface" />
        <span className="ml-2 font-mono text-[10px] text-theme-text-muted truncate">
          {isTv ? "serie" : "pelicula"}.tmdb
        </span>
      </div>

      {/* Poster */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-theme-surface-alt border-b-3 border-theme-border">
        {poster ? (
          <Image
            src={poster}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl bg-theme-surface-alt">
            {isTv ? "📺" : "🎬"}
          </div>
        )}

        {/* Rating */}
        {rating && Number(rating) > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-lg border-2 border-theme-border bg-theme-highlight px-2 py-0.5 text-sm font-bold shadow-[2px_2px_0px_0px] shadow-theme-border">
            <span>★</span>
            <span>{rating}</span>
          </div>
        )}

        {/* Type badge */}
        <div className="absolute bottom-2 left-2 rounded-lg border-2 border-theme-border bg-theme-badge px-2 py-0.5 text-xs font-bold text-theme-text shadow-[2px_2px_0px_0px] shadow-theme-border">
          {isTv ? "SERIE" : "PELI"}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="font-bold text-theme-text leading-tight line-clamp-2 text-sm">
          {item.title}
        </h3>
        {year && (
          <p className="font-mono text-xs text-theme-text-muted">{year}</p>
        )}
        <div className="flex flex-wrap gap-1 mt-auto pt-1">
          {item.genre_ids?.slice(0, 2).map((gid) => (
            <span
              key={gid}
              className="rounded-md border-2 border-theme-border bg-theme-surface-alt px-1.5 py-0.5 text-[10px] font-bold text-theme-text"
            >
              {genreName(gid)}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
