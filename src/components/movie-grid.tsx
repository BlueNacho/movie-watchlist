"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LayoutGrid, Rows3 } from "lucide-react";
import { SearchBar } from "./search-bar";
import { MovieCard } from "./movie-card";
import { MovieDetailDialog } from "./movie-detail-dialog";
import { FilterDropdown } from "./filter-dropdown";
import { useAppStore } from "@/lib/store";
import { genreName } from "@/lib/tmdb";
import type { TMDBItem, MediaType } from "@/lib/tmdb";

const GENRES = [
  { value: "28", label: "Accion" },
  { value: "16", label: "Animacion" },
  { value: "35", label: "Comedia" },
  { value: "80", label: "Crimen" },
  { value: "99", label: "Documental" },
  { value: "18", label: "Drama" },
  { value: "10751", label: "Familia" },
  { value: "14", label: "Fantasia" },
  { value: "27", label: "Terror" },
  { value: "10749", label: "Romance" },
  { value: "878", label: "Sci-Fi" },
  { value: "53", label: "Suspenso" },
];

const YEARS = Array.from({ length: 10 }, (_, i) => {
  const y = String(2026 - i);
  return { value: y, label: y };
});

const RATINGS = [
  { value: "7", label: "7+" },
  { value: "7.5", label: "7.5+" },
  { value: "8", label: "8+" },
  { value: "8.5", label: "8.5+" },
  { value: "9", label: "9+" },
];

const PROVIDERS = [
  { value: "8", label: "Netflix" },
  { value: "119", label: "Amazon Prime" },
  { value: "337", label: "Disney+" },
  { value: "384", label: "HBO Max" },
  { value: "350", label: "Apple TV+" },
  { value: "531", label: "Paramount+" },
  { value: "283", label: "Crunchyroll" },
  { value: "2", label: "Apple iTunes" },
  { value: "339", label: "Movistar Play" },
];

export function MovieGrid() {
  const [items, setItems] = useState<TMDBItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<MediaType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { gridColumns, setGridColumns } = useAppStore();

  // Watchlist IDs for quick-add status
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set());

  const fetchWatchlistIds = useCallback(() => {
    fetch("/api/watchlist")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setWatchlistIds(new Set(data.map((i: { tmdbId: number; mediaType: string }) => `${i.mediaType}-${i.tmdbId}`)));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchWatchlistIds();
  }, [fetchWatchlistIds]);

  // Filters
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [genreFilter, setGenreFilter] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState<string | null>(null);
  const [ratingFilter, setRatingFilter] = useState<string | null>(null);
  const [providerFilter, setProviderFilter] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const hasFilters = genreFilter || yearFilter || ratingFilter || providerFilter || typeFilter;

  const buildDiscoverUrl = useCallback((p: number, genre = genreFilter, year = yearFilter, type = typeFilter, rating = ratingFilter, provider = providerFilter) => {
    const params = new URLSearchParams();
    if (genre) params.set("genre", genre);
    if (year) params.set("year", year);
    if (type) params.set("type", type);
    if (rating) params.set("ratingMin", rating);
    if (provider) params.set("provider", provider);
    params.set("page", String(p));
    return `/api/discover?${params}`;
  }, [genreFilter, yearFilter, typeFilter, ratingFilter, providerFilter]);

  function fetchInitial(url: string, isSearch: boolean) {
    setSearchMode(isSearch);
    setLoading(true);
    setPage(1);
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.results || []);
        setTotalPages(data.totalPages || 1);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchInitial("/api/trending", false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = useCallback((query: string) => {
    setCurrentQuery(query);
    if (!query.trim()) {
      if (hasFilters) {
        fetchInitial(buildDiscoverUrl(1), true);
      } else {
        fetchInitial("/api/trending", false);
      }
      return;
    }
    fetchInitial(`/api/search?q=${encodeURIComponent(query)}&page=1`, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasFilters, buildDiscoverUrl]);

  function applyFilter(genre: string | null, year: string | null, type: string | null, rating: string | null, provider: string | null) {
    setGenreFilter(genre);
    setYearFilter(year);
    setTypeFilter(type);
    setRatingFilter(rating);
    setProviderFilter(provider);

    if (!genre && !year && !type && !rating && !provider && !currentQuery.trim()) {
      fetchInitial("/api/trending", false);
      return;
    }
    if (currentQuery.trim()) {
      fetchInitial(`/api/search?q=${encodeURIComponent(currentQuery)}&page=1`, true);
      return;
    }
    const params = new URLSearchParams();
    if (genre) params.set("genre", genre);
    if (year) params.set("year", year);
    if (type) params.set("type", type);
    if (rating) params.set("ratingMin", rating);
    if (provider) params.set("provider", provider);
    params.set("page", "1");
    fetchInitial(`/api/discover?${params}`, true);
  }

  // Stable ref for loadMore so IntersectionObserver always calls the latest version
  const stateRef = useRef({ loadingMore: false, page: 1, totalPages: 1, currentQuery: "", hasFilters: false, buildDiscoverUrl: buildDiscoverUrl });
  stateRef.current = { loadingMore, page, totalPages, currentQuery, hasFilters: !!hasFilters, buildDiscoverUrl };

  const loadMore = useCallback(() => {
    const s = stateRef.current;
    if (s.loadingMore || s.page >= s.totalPages) return;
    const nextPage = s.page + 1;
    setLoadingMore(true);

    let url: string;
    if (s.currentQuery.trim()) {
      url = `/api/search?q=${encodeURIComponent(s.currentQuery)}&page=${nextPage}`;
    } else if (s.hasFilters) {
      url = s.buildDiscoverUrl(nextPage);
    } else {
      setLoadingMore(false);
      return;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setItems((prev) => [...prev, ...(data.results || [])]);
        setPage(nextPage);
        setTotalPages(data.totalPages || 1);
      })
      .finally(() => setLoadingMore(false));
  }, []);

  // Single observer, re-observe only when sentinel changes
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: "600px" } // preload well before reaching bottom
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, items.length, page, totalPages]);

  const displayed = typeFilter && currentQuery.trim()
    ? items.filter((i) => i.media_type === typeFilter)
    : items;

  const handleItemClick = useCallback((item: TMDBItem) => {
    setSelectedId(item.id);
    setSelectedType(item.media_type);
    setDialogOpen(true);
  }, []);

  const handleQuickAdd = useCallback(async (item: TMDBItem, collectionId?: number | null): Promise<boolean> => {
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdbId: item.id,
          mediaType: item.media_type,
          title: item.title,
          posterPath: item.poster_path,
          overview: item.overview,
          voteAverage: item.vote_average?.toFixed(1),
          genreNames: item.genre_ids?.map((gid) => genreName(gid)).join(", "),
          collectionId: collectionId || null,
        }),
      });
      if (res.ok || res.status === 409) {
        setWatchlistIds((prev) => new Set(prev).add(`${item.media_type}-${item.id}`));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const gridClass = gridColumns === 1
    ? "grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5"
    : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5";

  return (
    <div className="flex flex-col gap-6">
      <SearchBar onSearch={handleSearch} />

      {/* Filters + grid toggle */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2 flex-1">
          <FilterDropdown
            label="Tipo"
            options={[{ value: "movie", label: "Pelis" }, { value: "tv", label: "Series" }]}
            value={typeFilter}
            onChange={(v) => applyFilter(genreFilter, yearFilter, v, ratingFilter, providerFilter)}
          />
          <FilterDropdown
            label="Genero"
            options={GENRES}
            value={genreFilter}
            onChange={(v) => applyFilter(v, yearFilter, typeFilter, ratingFilter, providerFilter)}
          />
          <FilterDropdown
            label="Año"
            options={YEARS}
            value={yearFilter}
            onChange={(v) => applyFilter(genreFilter, v, typeFilter, ratingFilter, providerFilter)}
          />
          <FilterDropdown
            label="Rating"
            options={RATINGS}
            value={ratingFilter}
            onChange={(v) => applyFilter(genreFilter, yearFilter, typeFilter, v, providerFilter)}
          />
          <FilterDropdown
            label="Plataforma"
            options={PROVIDERS}
            value={providerFilter}
            onChange={(v) => applyFilter(genreFilter, yearFilter, typeFilter, ratingFilter, v)}
          />
        </div>

        {/* Grid toggle - only visible on mobile */}
        <div className="flex sm:hidden shrink-0 rounded-lg border-3 border-theme-border bg-theme-surface shadow-[2px_2px_0px_0px] shadow-theme-border overflow-hidden">
          <button
            onClick={() => setGridColumns(2)}
            className={`flex h-9 w-9 items-center justify-center transition-colors cursor-pointer ${
              gridColumns === 2 ? "bg-theme-highlight" : "hover:bg-theme-surface-alt"
            }`}
          >
            <LayoutGrid size={16} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => setGridColumns(1)}
            className={`flex h-9 w-9 items-center justify-center border-l-2 border-theme-border transition-colors cursor-pointer ${
              gridColumns === 1 ? "bg-theme-highlight" : "hover:bg-theme-surface-alt"
            }`}
          >
            <Rows3 size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Section header */}
      <div className="flex items-center gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-theme-text">
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
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="text-5xl animate-bounce">🍿</div>
            <span className="font-mono text-sm font-bold text-theme-text-muted">Cargando...</span>
          </div>
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 rounded-xl border-3 border-theme-border bg-theme-surface shadow-[4px_4px_0px_0px] shadow-theme-border">
          <span className="text-6xl">🎬</span>
            <p className="text-lg font-bold text-theme-text-muted">No hay resultados.</p>
        </div>
      ) : (
        <div className={gridClass}>
          {displayed.map((item, idx) => (
            <MovieCard
              key={`${item.media_type}-${item.id}-${idx}`}
              item={item}
              onClick={handleItemClick}
              inWatchlist={watchlistIds.has(`${item.media_type}-${item.id}`)}
              onQuickAdd={handleQuickAdd}
            />
          ))}
        </div>
      )}

      {/* Invisible sentinel for infinite scroll - always rendered, preloads 600px before visible */}
      {page < totalPages && (
        <div ref={sentinelRef} className="h-1" />
      )}
      {loadingMore && (
        <div className="flex justify-center py-4">
          <span className="font-mono text-xs text-theme-text-muted animate-pulse">Cargando mas...</span>
        </div>
      )}

      <MovieDetailDialog
        itemId={selectedId}
        mediaType={selectedType}
        open={dialogOpen}
        onOpenChange={(v) => { setDialogOpen(v); if (!v) fetchWatchlistIds(); }}
        onAdded={fetchWatchlistIds}
        alreadyInWatchlist={selectedId && selectedType ? watchlistIds.has(`${selectedType}-${selectedId}`) : false}
      />
    </div>
  );
}
