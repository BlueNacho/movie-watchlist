"use client";

import { useCallback, useEffect, useState } from "react";
import { SearchBar } from "./search-bar";
import { MovieCard } from "./movie-card";
import { MovieDetailDialog } from "./movie-detail-dialog";
import type { TMDBItem, MediaType } from "@/lib/tmdb";

export function MovieGrid() {
  const [items, setItems] = useState<TMDBItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchMode, setSearchMode] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<MediaType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetch("/api/trending")
      .then((res) => res.json())
      .then((data) => setItems(data))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchMode(false);
      setLoading(true);
      fetch("/api/trending")
        .then((res) => res.json())
        .then((data) => setItems(data))
        .finally(() => setLoading(false));
      return;
    }
    setSearchMode(true);
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => setItems(data))
      .finally(() => setLoading(false));
  }, []);

  const handleItemClick = useCallback((item: TMDBItem) => {
    setSelectedId(item.id);
    setSelectedType(item.media_type);
    setDialogOpen(true);
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <SearchBar onSearch={handleSearch} />

      {/* Section header */}
      <div className="flex items-center gap-4">
        <h2 className="text-3xl font-bold text-theme-text">
          {searchMode ? "Resultados" : "Trending"}
        </h2>
        {!searchMode && (
          <span className="rounded-lg border-3 border-theme-border bg-theme-highlight px-3 py-1 font-mono text-sm font-bold shadow-[3px_3px_0px_0px] shadow-theme-border">
            Esta semana
          </span>
        )}
        <div className="flex-1 border-t-3 border-theme-border" />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex flex-col rounded-xl border-3 border-theme-border bg-theme-surface shadow-[4px_4px_0px_0px] shadow-theme-border overflow-hidden">
              <div className="flex items-center gap-1.5 px-3 py-1.5 border-b-3 border-theme-border bg-theme-card-bar">
                <div className="w-2.5 h-2.5 rounded-full border-2 border-theme-border bg-theme-surface" />
                <div className="w-2.5 h-2.5 rounded-full border-2 border-theme-border bg-theme-surface" />
              </div>
              <div className="aspect-[2/3] w-full bg-theme-surface-alt animate-pulse border-b-3 border-theme-border" />
              <div className="p-3 space-y-2">
                <div className="h-4 w-3/4 bg-theme-surface-alt rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-theme-card-bar rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 rounded-xl border-3 border-theme-border bg-theme-surface shadow-[4px_4px_0px_0px] shadow-theme-border">
          <span className="text-6xl">🎬</span>
          <p className="text-lg font-bold text-theme-text-muted">No encontramos nada... proba con otra busqueda!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {items.map((item) => (
            <MovieCard key={`${item.media_type}-${item.id}`} item={item} onClick={handleItemClick} />
          ))}
        </div>
      )}

      <MovieDetailDialog
        itemId={selectedId}
        mediaType={selectedType}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
