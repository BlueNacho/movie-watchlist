"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { LayoutGrid, Rows3, Dices, XCircle } from "lucide-react";
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
  const [randomMenuOpen, setRandomMenuOpen] = useState(false);
  const [randomType, setRandomType] = useState<string | null>(null);
  const [randomGenre, setRandomGenre] = useState<string | null>(null);
  const [randomProvider, setRandomProvider] = useState<string | null>(null);
  const [isRandomPick, setIsRandomPick] = useState(false);

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

  // Filters from URL
  const searchParams = useSearchParams();
  const router = useRouter();

  const typeFilter = searchParams.get("type") || null;
  const genreFilter = searchParams.get("genre") || null;
  const yearFilter = searchParams.get("year") || null;
  const ratingFilter = searchParams.get("rating") || null;
  const providerFilter = searchParams.get("provider") || null;
  const currentQuery = searchParams.get("q") || "";

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  }

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

  // Initial load: respect URL params
  useEffect(() => {
    fetchWithFilters(currentQuery, genreFilter, yearFilter, typeFilter, ratingFilter, providerFilter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Text search → search API + client-side filters (type, genre, rating, year)
  // No text → discover API (supports all filters including provider)
  function fetchWithFilters(query: string, genre: string | null, year: string | null, type: string | null, rating: string | null, provider: string | null) {
    const anyFilter = genre || year || rating || provider || type;

    if (!query.trim() && !anyFilter) {
      fetchInitial("/api/trending", false);
      return;
    }

    if (query.trim()) {
      // Text search: use search API, all filters applied client-side
      fetchInitial(`/api/search?q=${encodeURIComponent(query)}&page=1`, true);
      return;
    }

    // No text: use discover with all server-side filters
    const params = new URLSearchParams();
    if (genre) params.set("genre", genre);
    if (year) params.set("year", year);
    if (type) params.set("type", type);
    else params.set("type", "movie");
    if (rating) params.set("ratingMin", rating);
    if (provider) params.set("provider", provider);
    params.set("page", "1");
    fetchInitial(`/api/discover?${params}`, true);
  }

  const handleSearch = useCallback((query: string) => {
    updateParams({ q: query || null });
    fetchWithFilters(query, genreFilter, yearFilter, typeFilter, ratingFilter, providerFilter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genreFilter, yearFilter, typeFilter, ratingFilter, providerFilter]);

  function applyFilter(genre: string | null, year: string | null, type: string | null, rating: string | null, provider: string | null) {
    updateParams({ genre, year, type, rating, provider });
    fetchWithFilters(currentQuery, genre, year, type, rating, provider);
  }

  function clearAllFilters() {
    router.replace("?", { scroll: false });
    fetchWithFilters("", null, null, null, null, null);
  }

  const hasAnyFilter = typeFilter || genreFilter || yearFilter || ratingFilter || providerFilter || currentQuery;

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
      { rootMargin: "1000px" } // preload well before reaching bottom
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, items.length, page, totalPages]);

  // Client-side filtering when using text search (search API doesn't support these params)
  const displayed = currentQuery.trim()
    ? items
        .filter((i) => !typeFilter || i.media_type === typeFilter)
        .filter((i) => !genreFilter || i.genre_ids?.includes(Number(genreFilter)))
        .filter((i) => !ratingFilter || (i.vote_average ?? 0) >= Number(ratingFilter))
        .filter((i) => !yearFilter || i.release_date?.startsWith(yearFilter))
    : items;

  function fireConfetti() {
    const end = Date.now() + 1500;
    function frame() {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 1 } });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 1 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    }
    frame();
  }

  async function pickRandom() {
    const hasRandomFilters = randomType || randomGenre || randomProvider;

    if (hasRandomFilters) {
      const params = new URLSearchParams();
      if (randomGenre) params.set("genre", randomGenre);
      if (randomType) params.set("type", randomType);
      else params.set("type", "movie");
      if (randomProvider) params.set("provider", randomProvider);
      const randomPage = Math.floor(Math.random() * 5) + 1;
      params.set("page", String(randomPage));
      try {
        const res = await fetch(`/api/discover?${params}`);
        const data = await res.json();
        const pool = data.results || [];
        if (pool.length > 0) {
          const pick = pool[Math.floor(Math.random() * pool.length)];
          setRandomMenuOpen(false);
          setIsRandomPick(true);
          setSelectedId(pick.id);
          setSelectedType(pick.media_type);
          setDialogOpen(true);
          return;
        }
      } catch { /* fall through */ }
    }

    if (displayed.length === 0) return;
    const pick = displayed[Math.floor(Math.random() * displayed.length)];
    setRandomMenuOpen(false);
    setIsRandomPick(true);
    setSelectedId(pick.id);
    setSelectedType(pick.media_type);
    setDialogOpen(true);
  }

  const randomPopover = (
    <>
      {randomMenuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setRandomMenuOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-xl border-3 border-theme-border bg-theme-surface shadow-[4px_4px_0px_0px] shadow-theme-border p-4 flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
            <p className="font-bold text-sm text-theme-text">🎲 Elegir al azar</p>
            <FilterDropdown label="Tipo" options={[{ value: "movie", label: "Pelis" }, { value: "tv", label: "Series" }]} value={randomType} onChange={setRandomType} />
            <FilterDropdown label="Genero" options={GENRES} value={randomGenre} onChange={setRandomGenre} />
            <FilterDropdown label="Plataforma" options={PROVIDERS} value={randomProvider} onChange={setRandomProvider} />
            <button onClick={pickRandom} className="flex items-center justify-center gap-2 rounded-lg border-3 border-theme-border bg-theme-highlight px-4 py-2.5 font-bold text-sm shadow-[3px_3px_0px_0px] shadow-theme-border transition-all hover:shadow-[1px_1px_0px_0px] hover:shadow-theme-border hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer">
              <Dices size={16} strokeWidth={2.5} /> Sorprendeme!
            </button>
          </div>
        </>
      )}
    </>
  );

  const handleItemClick = useCallback((item: TMDBItem) => {
    setIsRandomPick(false);
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
      <SearchBar onSearch={handleSearch} initialValue={currentQuery} />

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
          {hasAnyFilter && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1.5 rounded-lg border-3 border-theme-border bg-theme-surface px-3 py-2 font-mono text-xs font-bold text-theme-text-muted shadow-[2px_2px_0px_0px] shadow-theme-border transition-all hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] hover:text-theme-text cursor-pointer"
            >
              <XCircle size={14} strokeWidth={2.5} />
              Limpiar
            </button>
          )}
        </div>

        {/* Random - desktop only */}
        <div className="relative hidden sm:block shrink-0">
          <button
            onClick={() => setRandomMenuOpen(!randomMenuOpen)}
            title="Elegir random"
            className="flex items-center gap-1.5 rounded-lg border-3 border-theme-border bg-theme-highlight px-3 py-2 font-mono text-xs font-bold shadow-[3px_3px_0px_0px] shadow-theme-border transition-all hover:shadow-[1px_1px_0px_0px] hover:shadow-theme-border hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer"
          >
            <Dices size={14} strokeWidth={3} />
            Random
          </button>
          {randomPopover}
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
          {searchMode ? "Resultados" : "Tendencias"}
        </h2>
        <div className="flex-1 border-t-3 border-theme-border" />
        {/* Random - mobile */}
        <div className="relative sm:hidden shrink-0">
          <button
            onClick={() => setRandomMenuOpen(!randomMenuOpen)}
            title="Elegir random"
            className="flex items-center gap-1.5 rounded-lg border-3 border-theme-border bg-theme-highlight px-3 py-2 font-bold text-sm shadow-[3px_3px_0px_0px] shadow-theme-border transition-all hover:shadow-[1px_1px_0px_0px] hover:shadow-theme-border hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer"
          >
            <Dices size={16} strokeWidth={2.5} />
          </button>
          {randomPopover}
        </div>
      </div>

      {loading ? (
        <div className={gridClass}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex flex-col rounded-xl border-3 border-theme-border bg-theme-surface shadow-[4px_4px_0px_0px] shadow-theme-border overflow-hidden">
              <div className="flex items-center gap-1.5 px-3 py-1.5 border-b-3 border-theme-border bg-theme-card-bar">
                <div className="w-2.5 h-2.5 rounded-full border-2 border-theme-border bg-theme-surface" />
                <div className="w-2.5 h-2.5 rounded-full border-2 border-theme-border bg-theme-surface" />
              </div>
              <div className="aspect-[2/3] w-full bg-theme-surface-alt animate-pulse border-b-3 border-theme-border" />
              <div className="p-3 space-y-2">
                <div className="h-4 w-3/4 bg-theme-surface-alt rounded animate-pulse" />
                <div className="h-3 w-1/3 bg-theme-card-bar rounded animate-pulse" />
                <div className="flex gap-1 pt-1">
                  <div className="h-5 w-14 bg-theme-surface-alt rounded-md animate-pulse" />
                  <div className="h-5 w-12 bg-theme-surface-alt rounded-md animate-pulse" />
                </div>
              </div>
            </div>
          ))}
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
      {/* Sentinel + loading area: fixed height to prevent layout shifts */}
      {page < totalPages && (
        <div ref={sentinelRef} className="min-h-[100px] flex items-center justify-center">
          {loadingMore && (
            <span className="font-mono text-xs text-theme-text-muted animate-pulse">Cargando mas...</span>
          )}
        </div>
      )}

      <MovieDetailDialog
        itemId={selectedId}
        mediaType={selectedType}
        open={dialogOpen}
        onOpenChange={(v) => { setDialogOpen(v); if (!v) fetchWatchlistIds(); }}
        onAdded={fetchWatchlistIds}
        alreadyInWatchlist={selectedId && selectedType ? watchlistIds.has(`${selectedType}-${selectedId}`) : false}
        headerLabel={isRandomPick ? "🎲 Seleccion aleatoria" : undefined}
        onOpenCallback={isRandomPick ? fireConfetti : undefined}
      />
    </div>
  );
}
