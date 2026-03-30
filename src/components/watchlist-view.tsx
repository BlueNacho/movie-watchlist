"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { posterUrl } from "@/lib/tmdb";

interface WatchlistItem {
  id: number;
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  overview: string | null;
  voteAverage: string | null;
  genreNames: string | null;
  status: "pending" | "watched";
  addedAt: string;
  watchedAt: string | null;
}

type FilterStatus = "all" | "pending" | "watched";

export function WatchlistView() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");

  const fetchItems = useCallback(() => {
    setLoading(true);
    fetch("/api/watchlist")
      .then((res) => res.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  async function toggleStatus(item: WatchlistItem) {
    const newStatus = item.status === "pending" ? "watched" : "pending";
    await fetch(`/api/watchlist/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, status: newStatus, watchedAt: newStatus === "watched" ? new Date().toISOString() : null } : i
      )
    );
  }

  async function removeItem(id: number) {
    await fetch(`/api/watchlist/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const filtered = items.filter((i) => filter === "all" || i.status === filter);

  const pendingCount = items.filter((i) => i.status === "pending").length;
  const watchedCount = items.filter((i) => i.status === "watched").length;

  // Extract unique genres from all items
  const allGenres = Array.from(
    new Set(
      items
        .flatMap((i) => (i.genreNames || "").split(", "))
        .filter(Boolean)
    )
  ).sort();

  const [genreFilter, setGenreFilter] = useState<string | null>(null);

  const displayed = filtered.filter(
    (i) => !genreFilter || (i.genreNames || "").includes(genreFilter)
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="flex items-center gap-4">
        <h2 className="text-3xl font-bold text-theme-text">Mi Lista</h2>
        <div className="flex-1 border-t-3 border-theme-border" />
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {([
          ["all", `Todas (${items.length})`],
          ["pending", `Pendientes (${pendingCount})`],
          ["watched", `Vistas (${watchedCount})`],
        ] as [FilterStatus, string][]).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`rounded-lg border-3 border-theme-border px-4 py-2 font-mono text-sm font-bold transition-all cursor-pointer ${
              filter === value
                ? "bg-theme-highlight shadow-[3px_3px_0px_0px] shadow-theme-border"
                : "bg-theme-surface hover:bg-theme-surface-alt shadow-[2px_2px_0px_0px] shadow-theme-border"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Genre filter */}
      {allGenres.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setGenreFilter(null)}
            className={`rounded-md border-2 border-theme-border px-2 py-0.5 text-xs font-bold transition-colors cursor-pointer ${
              !genreFilter ? "bg-theme-header text-theme-header-text" : "bg-theme-surface text-theme-text"
            }`}
          >
            Todos
          </button>
          {allGenres.map((genre) => (
            <button
              key={genre}
              onClick={() => setGenreFilter(genreFilter === genre ? null : genre)}
              className={`rounded-md border-2 border-theme-border px-2 py-0.5 text-xs font-bold transition-colors cursor-pointer ${
                genreFilter === genre ? "bg-theme-header text-theme-header-text" : "bg-theme-surface text-theme-text"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="text-5xl animate-bounce">🍿</div>
            <span className="font-mono text-sm font-bold text-theme-text-muted">Cargando...</span>
          </div>
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 rounded-xl border-3 border-theme-border bg-theme-surface shadow-[4px_4px_0px_0px] shadow-theme-border">
          <span className="text-5xl">📭</span>
          <p className="text-base font-bold text-theme-text-muted">
            {items.length === 0
              ? "Tu lista esta vacia. Busca pelis y agregalas!"
              : "Nada con este filtro."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {displayed.map((item) => (
            <WatchlistCard
              key={item.id}
              item={item}
              onToggle={() => toggleStatus(item)}
              onRemove={() => removeItem(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function WatchlistCard({
  item,
  onToggle,
  onRemove,
}: {
  item: WatchlistItem;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const poster = posterUrl(item.posterPath, "w342");
  const isWatched = item.status === "watched";

  return (
    <div
      className={`flex gap-4 rounded-xl border-3 border-theme-border bg-theme-surface shadow-[4px_4px_0px_0px] shadow-theme-border overflow-hidden transition-opacity ${
        isWatched ? "opacity-70" : ""
      }`}
    >
      {/* Poster */}
      <div className="relative w-20 sm:w-24 shrink-0 bg-theme-surface-alt">
        {poster ? (
          <Image
            src={poster}
            alt={item.title}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl">
            {item.mediaType === "tv" ? "📺" : "🎬"}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1.5 py-3 pr-3 min-w-0">
        <div className="flex items-start gap-2">
          <h3 className={`font-bold text-theme-text text-sm sm:text-base leading-tight line-clamp-1 ${isWatched ? "line-through" : ""}`}>
            {item.title}
          </h3>
          <span className="shrink-0 rounded-md border-2 border-theme-border bg-theme-badge px-1.5 py-0.5 text-[10px] font-bold text-theme-text">
            {item.mediaType === "tv" ? "SERIE" : "PELI"}
          </span>
        </div>

        {item.genreNames && (
          <p className="font-mono text-[10px] text-theme-text-muted truncate">
            {item.genreNames}
          </p>
        )}

        <div className="flex items-center gap-2 mt-auto">
          {item.voteAverage && (
            <span className="flex items-center gap-0.5 rounded-md border-2 border-theme-border bg-theme-highlight px-1.5 py-0.5 text-[10px] font-bold">
              ★ {item.voteAverage}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col justify-center gap-2 pr-3 shrink-0">
        <button
          onClick={onToggle}
          title={isWatched ? "Marcar como pendiente" : "Marcar como vista"}
          className={`flex h-9 w-9 items-center justify-center rounded-lg border-2 border-theme-border shadow-[2px_2px_0px_0px] shadow-theme-border transition-all hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer ${
            isWatched ? "bg-theme-surface-alt" : "bg-green-200"
          }`}
        >
          {isWatched ? <EyeOff size={16} strokeWidth={2.5} /> : <Eye size={16} strokeWidth={2.5} />}
        </button>
        <button
          onClick={onRemove}
          title="Eliminar"
          className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-theme-border bg-red-100 shadow-[2px_2px_0px_0px] shadow-theme-border transition-all hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer text-red-600"
        >
          <Trash2 size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
