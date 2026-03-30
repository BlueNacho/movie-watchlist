"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import confetti from "canvas-confetti";
import { Eye, EyeOff, Trash2, Search, Dices, Play, FolderOpen, Plus, X, XCircle } from "lucide-react";
import { posterUrl } from "@/lib/tmdb";
import { MovieDetailDialog } from "./movie-detail-dialog";
import { FilterDropdown } from "./filter-dropdown";
import { CollectionView } from "./collection-view";
import { CollectionPopover } from "./collection-popover";
import type { MediaType } from "@/lib/tmdb";

interface CollectionMembership {
  collectionId: number;
  collectionName: string;
  position: number;
}

interface WatchlistItem {
  id: number;
  userId: number;
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  overview: string | null;
  voteAverage: string | null;
  genreNames: string | null;
  releaseYear: string | null;
  status: "pending" | "watching" | "watched";
  collections: CollectionMembership[];
  addedAt: string;
  watchedAt: string | null;
  addedBy: string;
}

interface Collection {
  id: number;
  name: string;
}

type FilterStatus = "all" | "pending" | "watching" | "watched";

const STATUS_OPTIONS = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Por ver" },
  { value: "watching", label: "Viendo" },
  { value: "watched", label: "Vistas" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Mas recientes" },
  { value: "oldest", label: "Mas antiguas" },
  { value: "rating-desc", label: "Mejor rating" },
  { value: "title-asc", label: "A → Z" },
];

const RATING_OPTIONS = [
  { value: "7", label: "7+" },
  { value: "7.5", label: "7.5+" },
  { value: "8", label: "8+" },
  { value: "8.5", label: "8.5+" },
];

export function WatchlistView() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [allCollections, setAllCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<MediaType | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isRandomPick, setIsRandomPick] = useState(false);

  // Active collection view
  const [activeCollection, setActiveCollection] = useState<number | null>(null);

  // Filters from URL
  const searchParams = useSearchParams();
  const router = useRouter();

  const filter = (searchParams.get("status") || "pending") as FilterStatus;
  const search = searchParams.get("q") || "";
  const typeFilter = searchParams.get("type") || null;
  const genreFilter = searchParams.get("genre") || null;
  const ratingFilter = searchParams.get("rating") || null;
  const addedByFilter = searchParams.get("addedBy") || null;
  const collectionFilter = searchParams.get("collection") || null;
  const sortBy = searchParams.get("sort") || "newest";

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.replace(`/watchlist?${params.toString()}`, { scroll: false });
  }

  function setFilter(v: FilterStatus) { updateParams({ status: v === "pending" ? null : v }); }
  function setSearch(v: string) { updateParams({ q: v || null }); }
  function setTypeFilter(v: string | null) { updateParams({ type: v }); }
  function setGenreFilter(v: string | null) { updateParams({ genre: v }); }
  function setRatingFilter(v: string | null) { updateParams({ rating: v }); }
  function setAddedByFilter(v: string | null) { updateParams({ addedBy: v }); }
  function setCollectionFilter(v: string | null) { updateParams({ collection: v }); }
  function setSortBy(v: string) { updateParams({ sort: v === "newest" ? null : v }); }

  function clearAllFilters() {
    router.replace("/watchlist", { scroll: false });
  }

  const hasAnyFilter = typeFilter || genreFilter || ratingFilter || addedByFilter || collectionFilter || search || (sortBy !== "newest") || (filter !== "pending");

  // Random filters
  const [randomMenuOpen, setRandomMenuOpen] = useState(false);
  const [randomType, setRandomType] = useState<string | null>(null);
  const [randomGenre, setRandomGenre] = useState<string | null>(null);

  // Create collection
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");

  const fetchItems = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/watchlist").then((r) => r.json()),
      fetch("/api/collections").then((r) => r.json()),
    ])
      .then(([watchlistData, collectionsData]) => {
        setItems(Array.isArray(watchlistData) ? watchlistData : []);
        setAllCollections(Array.isArray(collectionsData) ? collectionsData : []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  async function setItemStatus(e: React.MouseEvent, item: WatchlistItem, newStatus: "pending" | "watching" | "watched") {
    e.stopPropagation();
    await fetch(`/api/watchlist/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setItems((prev) =>
      prev.map((i) => i.id === item.id ? { ...i, status: newStatus, watchedAt: newStatus === "watched" ? new Date().toISOString() : null } : i)
    );
  }

  async function removeItem(e: React.MouseEvent, id: number) {
    e.stopPropagation();
    await fetch(`/api/watchlist/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function openDetail(tmdbId: number, mediaType: string) {
    setIsRandomPick(false);
    setSelectedId(tmdbId);
    setSelectedType(mediaType as MediaType);
    setDialogOpen(true);
  }

  function fireConfetti() {
    const end = Date.now() + 1500;
    function frame() {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0, y: 1 } });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1, y: 1 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    }
    frame();
  }

  function pickRandom() {
    const pending = items.filter((i) => i.status === "pending");
    let pool = pending.length > 0 ? pending : items;
    if (randomType) pool = pool.filter((i) => i.mediaType === randomType);
    if (randomGenre) pool = pool.filter((i) => (i.genreNames || "").includes(randomGenre));
    if (pool.length === 0) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setIsRandomPick(true);
    setRandomMenuOpen(false);
    setSelectedId(pick.tmdbId);
    setSelectedType(pick.mediaType);
    setDialogOpen(true);
  }

  async function handleReorder(collectionId: number, updates: { id: number; position: number }[]) {
    await fetch("/api/watchlist/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collectionId, items: updates.map((u) => ({ watchlistItemId: u.id, position: u.position })) }),
    });
    // Update local positions
    setItems((prev) =>
      prev.map((item) => {
        const update = updates.find((u) => u.id === item.id);
        if (!update) return item;
        return { ...item, collections: item.collections.map((c) => c.collectionId === collectionId ? { ...c, position: update.position } : c) };
      })
    );
  }

  async function removeFromCollection(collectionId: number, watchlistItemId: number) {
    await fetch(`/api/collections/${collectionId}/items`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ watchlistItemId }),
    });
    setItems((prev) => prev.map((i) => i.id === watchlistItemId
      ? { ...i, collections: i.collections.filter((c) => c.collectionId !== collectionId) }
      : i
    ));
  }

  async function addToCollection(watchlistItemId: number, collectionId: number) {
    const res = await fetch(`/api/collections/${collectionId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ watchlistItemId }),
    });
    if (res.ok) {
      const colName = allCollections.find((c) => c.id === collectionId)?.name || "";
      setItems((prev) => prev.map((i) => i.id === watchlistItemId
        ? { ...i, collections: [...i.collections, { collectionId, collectionName: colName, position: 0 }] }
        : i
      ));
    }
  }

  async function renameCollection(collectionId: number, name: string) {
    await fetch(`/api/collections/${collectionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setAllCollections((prev) => prev.map((c) => c.id === collectionId ? { ...c, name } : c));
    setItems((prev) => prev.map((i) => ({
      ...i,
      collections: i.collections.map((c) => c.collectionId === collectionId ? { ...c, collectionName: name } : c),
    })));
  }

  async function deleteCollection(collectionId: number) {
    await fetch(`/api/collections/${collectionId}`, { method: "DELETE" });
    setAllCollections((prev) => prev.filter((c) => c.id !== collectionId));
    setItems((prev) => prev.map((i) => ({
      ...i,
      collections: i.collections.filter((c) => c.collectionId !== collectionId),
    })));
    setActiveCollection(null);
  }

  async function createCollection() {
    if (!newCollectionName.trim()) return;
    const res = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCollectionName.trim() }),
    });
    if (res.ok) {
      const col = await res.json();
      setAllCollections((prev) => [...prev, col]);
      setNewCollectionName("");
      setShowCreateCollection(false);
    }
  }

  // Counts
  const pendingCount = items.filter((i) => i.status === "pending").length;
  const watchingCount = items.filter((i) => i.status === "watching").length;
  const watchedCount = items.filter((i) => i.status === "watched").length;

  // Dynamic options
  const allGenres = Array.from(
    new Set(items.flatMap((i) => (i.genreNames || "").split(", ")).filter(Boolean))
  ).sort().map((g) => ({ value: g, label: g }));

  const allUsers = Array.from(new Set(items.map((i) => i.addedBy).filter(Boolean)))
    .map((u) => ({ value: u, label: u }));

  const collectionOptions = allCollections.map((c) => ({ value: String(c.id), label: c.name }));

  const statusLabel = filter === "all" ? `Todas (${items.length})`
    : filter === "pending" ? `Por ver (${pendingCount})`
    : filter === "watching" ? `Viendo (${watchingCount})`
    : `Vistas (${watchedCount})`;

  // Filter + sort
  const displayed = [...items]
    .filter((i) => filter === "all" || i.status === filter)
    .filter((i) => !search.trim() || i.title.toLowerCase().includes(search.toLowerCase()))
    .filter((i) => !typeFilter || i.mediaType === typeFilter)
    .filter((i) => !genreFilter || (i.genreNames || "").includes(genreFilter))
    .filter((i) => !ratingFilter || (parseFloat(i.voteAverage || "0") >= parseFloat(ratingFilter)))
    .filter((i) => !addedByFilter || i.addedBy === addedByFilter)
    .filter((i) => !collectionFilter || (collectionFilter === "none" ? i.collections.length === 0 : i.collections.some((c) => String(c.collectionId) === collectionFilter)))
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest": return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
        case "newest": return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        case "rating-desc": return parseFloat(b.voteAverage || "0") - parseFloat(a.voteAverage || "0");
        case "title-asc": return a.title.localeCompare(b.title);
        default: return 0;
      }
    });

  // If viewing a collection
  if (activeCollection) {
    const col = allCollections.find((c) => c.id === activeCollection);
    if (!col) { setActiveCollection(null); return null; }
    const colItems = items
      .filter((i) => i.collections.some((c) => c.collectionId === activeCollection))
      .map((i) => {
        const membership = i.collections.find((c) => c.collectionId === activeCollection);
        return { id: i.id, tmdbId: i.tmdbId, title: i.title, posterPath: i.posterPath, mediaType: i.mediaType, voteAverage: i.voteAverage, position: membership?.position ?? 0 };
      });
    return (
      <div className="flex flex-col gap-6">
        <CollectionView
          collection={{ ...col, items: colItems }}
          onClose={() => setActiveCollection(null)}
          onReorder={handleReorder}
          onRemoveFromCollection={(itemId) => removeFromCollection(activeCollection, itemId)}
          onDeleteCollection={deleteCollection}
          onRenameCollection={renameCollection}
          onItemClick={(item) => openDetail(item.tmdbId, item.mediaType)}
        />
        <MovieDetailDialog
          itemId={selectedId}
          mediaType={selectedType}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          hideAddButton
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Title + random */}
      <div className="flex items-center gap-4">
        <h2 className="text-3xl font-bold text-theme-text">La listita ❤️</h2>
        <div className="flex-1 border-t-3 border-theme-border" />
        <div className="relative shrink-0">
          <button
            onClick={() => setRandomMenuOpen(!randomMenuOpen)}
            className="flex items-center gap-2 rounded-lg border-3 border-theme-border bg-theme-highlight px-3 py-2 font-bold text-sm shadow-[3px_3px_0px_0px] shadow-theme-border transition-all hover:shadow-[1px_1px_0px_0px] hover:shadow-theme-border hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer"
          >
            <Dices size={18} strokeWidth={2.5} />
            <span className="hidden sm:inline">Random</span>
          </button>
          {randomMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setRandomMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-xl border-3 border-theme-border bg-theme-surface shadow-[4px_4px_0px_0px] shadow-theme-border p-4 flex flex-col gap-3">
                <p className="font-bold text-sm text-theme-text">🎲 Elegir al azar</p>
                <FilterDropdown label="Tipo" options={[{ value: "movie", label: "Pelis" }, { value: "tv", label: "Series" }]} value={randomType} onChange={setRandomType} />
                {allGenres.length > 0 && <FilterDropdown label="Genero" options={allGenres} value={randomGenre} onChange={setRandomGenre} />}
                <button onClick={pickRandom} className="flex items-center justify-center gap-2 rounded-lg border-3 border-theme-border bg-theme-highlight px-4 py-2.5 font-bold text-sm shadow-[3px_3px_0px_0px] shadow-theme-border transition-all hover:shadow-[1px_1px_0px_0px] hover:shadow-theme-border hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer">
                  <Dices size={16} strokeWidth={2.5} /> Sorprendeme!
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {items.length > 0 && (() => {
        const total = items.length;
        const watchedPct = Math.round((watchedCount / total) * 100);
        const watchingPct = Math.round((watchingCount / total) * 100);
        const donePct = watchedPct + watchingPct;
        return (
          <div className="rounded-xl border-3 border-theme-border bg-theme-surface p-3 shadow-[3px_3px_0px_0px] shadow-theme-border">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-theme-text-muted">Progreso</span>
              <span className="font-mono text-xs font-bold text-theme-text">{donePct}%</span>
            </div>
            <div className="h-4 w-full rounded-full border-2 border-theme-border bg-theme-surface-alt overflow-hidden flex">
              {watchedPct > 0 && (
                <div className="h-full bg-green-400 transition-all duration-500" style={{ width: `${watchedPct}%` }} />
              )}
              {watchingPct > 0 && (
                <div className="h-full bg-yellow-400 transition-all duration-500" style={{ width: `${watchingPct}%` }} />
              )}
            </div>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-green-400 border-2 border-theme-border" />
                <span className="font-mono text-[10px] text-theme-text-muted">Vistas ({watchedCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-theme-border" />
                <span className="font-mono text-[10px] text-theme-text-muted">Viendo ({watchingCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-theme-surface-alt border-2 border-theme-border" />
                <span className="font-mono text-[10px] text-theme-text-muted">Por ver ({pendingCount})</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Status tabs */}
      <div className="rounded-xl border-3 border-theme-border bg-theme-card-bar p-2 shadow-[3px_3px_0px_0px] shadow-theme-border">
        <div className="hidden sm:flex gap-2">
          {([
            ["all", "Todas", `${items.length}`],
            ["pending", "Por ver", `${pendingCount}`],
            ["watching", "Viendo", `${watchingCount}`],
            ["watched", "Vistas", `${watchedCount}`],
          ] as [FilterStatus, string, string][]).map(([value, label, count]) => (
            <button key={value} onClick={() => setFilter(value)}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg border-3 border-theme-border px-3 py-3 font-bold text-sm transition-all cursor-pointer ${
                filter === value ? "bg-theme-highlight shadow-[3px_3px_0px_0px] shadow-theme-border" : "bg-theme-surface shadow-[2px_2px_0px_0px] shadow-theme-border hover:bg-theme-surface-alt"
              }`}>
              <span>{label}</span>
              <span className="rounded-full border-2 border-theme-border bg-theme-surface px-2 py-0.5 text-[10px] font-mono font-bold">{count}</span>
            </button>
          ))}
        </div>
        <div className="sm:hidden [&>div]:w-full [&>div>button]:w-full [&>div>button]:justify-between [&>div>button]:py-3 [&>div>div]:w-full">
          <FilterDropdown label={statusLabel}
            options={STATUS_OPTIONS.map((o) => ({
              value: o.value,
              label: `${o.label} (${o.value === "all" ? items.length : o.value === "pending" ? pendingCount : o.value === "watching" ? watchingCount : watchedCount})`,
            }))}
            value={filter} onChange={(v) => setFilter((v || "all") as FilterStatus)} showReset={false} />
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center border-3 border-theme-border rounded-xl bg-theme-surface shadow-[4px_4px_0px_0px] shadow-theme-border overflow-hidden">
        <div className="flex items-center justify-center w-12 h-12 bg-theme-accent border-r-3 border-theme-border shrink-0">
          <Search size={18} strokeWidth={3} className="text-white" />
        </div>
        <input type="text" placeholder="Buscar en tu lista..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 h-12 px-4 text-base font-medium bg-transparent outline-none placeholder:text-theme-text-muted text-theme-text" />
        {search && (
          <button onClick={() => setSearch("")} className="flex items-center justify-center w-10 h-10 mr-2 rounded-lg text-theme-text-muted hover:text-theme-text hover:bg-theme-surface-alt transition-colors cursor-pointer">
            <X size={18} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <FilterDropdown label="Tipo" options={[{ value: "movie", label: "Pelis" }, { value: "tv", label: "Series" }]} value={typeFilter} onChange={setTypeFilter} />
        {allGenres.length > 0 && <FilterDropdown label="Genero" options={allGenres} value={genreFilter} onChange={setGenreFilter} />}
        <FilterDropdown label="Rating" options={RATING_OPTIONS} value={ratingFilter} onChange={setRatingFilter} />
        {allUsers.length > 1 && <FilterDropdown label="Agregado por" options={allUsers} value={addedByFilter} onChange={setAddedByFilter} />}
        {collectionOptions.length > 0 && (
          <FilterDropdown label="Coleccion" options={[{ value: "none", label: "Sin coleccion" }, ...collectionOptions]} value={collectionFilter} onChange={setCollectionFilter} />
        )}
        <FilterDropdown label="Ordenar" options={SORT_OPTIONS} value={sortBy} onChange={(v) => setSortBy(v || "newest")} showReset={false} />
        {hasAnyFilter && (
          <button onClick={clearAllFilters}
            className="flex items-center gap-1.5 rounded-lg border-3 border-theme-border bg-theme-surface px-3 py-2 font-mono text-xs font-bold text-theme-text-muted shadow-[2px_2px_0px_0px] shadow-theme-border transition-all hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] hover:text-theme-text cursor-pointer">
            <XCircle size={14} strokeWidth={2.5} /> Limpiar
          </button>
        )}
      </div>

      {/* Collections section */}
      {allCollections.length > 0 && (
        <div>
          <p className="font-mono text-[10px] font-bold text-theme-text-muted uppercase tracking-widest mb-2">Colecciones</p>
          <div className="flex flex-wrap gap-2">
            {allCollections.map((col) => (
              <button key={col.id} onClick={() => setActiveCollection(col.id)}
                className="flex items-center gap-2 rounded-lg border-3 border-theme-border bg-theme-surface px-3 py-2 font-bold text-sm shadow-[2px_2px_0px_0px] shadow-theme-border transition-all hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer">
                <FolderOpen size={14} strokeWidth={2.5} />
                {col.name}
                <span className="rounded-full border-2 border-theme-border bg-theme-surface-alt px-1.5 py-0.5 text-[10px] font-mono font-bold">
                  {items.filter((i) => i.collections.some((c) => c.collectionId === col.id)).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create collection */}
      {showCreateCollection ? (
        <div className="flex gap-2">
          <input type="text" value={newCollectionName} onChange={(e) => setNewCollectionName(e.target.value)} placeholder="Nombre de la coleccion..."
            className="flex-1 rounded-lg border-3 border-theme-border bg-theme-surface px-3 py-2 text-sm font-medium outline-none" autoFocus
            onKeyDown={(e) => e.key === "Enter" && createCollection()} />
          <button onClick={createCollection} className="rounded-lg border-3 border-theme-border bg-theme-highlight px-4 py-2 text-sm font-bold cursor-pointer">Crear</button>
          <button onClick={() => setShowCreateCollection(false)} className="rounded-lg border-3 border-theme-border bg-theme-surface px-3 py-2 text-sm font-bold cursor-pointer">✕</button>
        </div>
      ) : (
        <button onClick={() => setShowCreateCollection(true)}
          className="flex items-center gap-2 self-start rounded-lg border-3 border-dashed border-theme-border bg-theme-surface px-3 py-2 font-bold text-sm text-theme-text-muted hover:bg-theme-surface-alt transition-colors cursor-pointer">
          <Plus size={14} strokeWidth={3} /> Nueva coleccion
        </button>
      )}

      {/* List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 rounded-xl border-3 border-theme-border bg-theme-surface shadow-[4px_4px_0px_0px] shadow-theme-border overflow-hidden">
              <div className="w-20 sm:w-24 shrink-0 aspect-[2/3] bg-theme-surface-alt animate-pulse" />
              <div className="flex flex-1 flex-col gap-2 py-3 pr-3">
                <div className="flex gap-2">
                  <div className="h-5 w-2/3 bg-theme-surface-alt rounded animate-pulse" />
                  <div className="h-5 w-12 bg-theme-card-bar rounded-md animate-pulse" />
                </div>
                <div className="h-3 w-1/2 bg-theme-card-bar rounded animate-pulse" />
                <div className="flex gap-1.5 mt-auto">
                  <div className="h-5 w-10 bg-theme-surface-alt rounded-md animate-pulse" />
                  <div className="h-5 w-14 bg-theme-surface-alt rounded-md animate-pulse" />
                  <div className="h-5 w-12 bg-theme-surface-alt rounded-md animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 rounded-xl border-3 border-theme-border bg-theme-surface shadow-[4px_4px_0px_0px] shadow-theme-border">
          <span className="text-5xl">📭</span>
          <p className="text-base font-bold text-theme-text-muted">
            {items.length === 0 ? "La lista esta vacia. Busca pelis y agregalas!" : "Nada con estos filtros."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {displayed.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.15 }}
                className="flex"
              >
                <WatchlistCard item={item}
                  onSetStatus={(e, s) => setItemStatus(e, item, s)}
                  onRemove={(e) => removeItem(e, item.id)}
                  onClick={() => openDetail(item.tmdbId, item.mediaType)}
                  onAddToCollection={(colId) => addToCollection(item.id, colId)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <MovieDetailDialog itemId={selectedId} mediaType={selectedType} open={dialogOpen} onOpenChange={setDialogOpen}
        onAdded={fetchItems} hideAddButton
        headerLabel={isRandomPick ? "🎲 Seleccion aleatoria" : undefined}
        onOpenCallback={isRandomPick ? fireConfetti : undefined} />
    </div>
  );
}

function WatchlistCard({ item, onSetStatus, onRemove, onClick, onAddToCollection }: {
  item: WatchlistItem;
  onSetStatus: (e: React.MouseEvent, status: "pending" | "watching" | "watched") => void;
  onRemove: (e: React.MouseEvent) => void;
  onClick: () => void;
  onAddToCollection: (collectionId: number) => void;
}) {
  const poster = posterUrl(item.posterPath, "w342");
  const isWatched = item.status === "watched";
  const isWatching = item.status === "watching";

  // Main button: toggle pending↔watched (or watching→watched)
  const mainStatus = isWatched ? "pending" : "watched";
  const mainIcon = isWatched ? <EyeOff size={14} strokeWidth={2.5} /> : <Eye size={14} strokeWidth={2.5} />;
  const mainTitle = isWatched ? "Marcar por ver" : "Marcar como vista";
  const mainColor = isWatched ? "bg-theme-surface-alt" : "bg-green-200";

  return (
    <button onClick={onClick}
      className={`flex w-full gap-3 sm:gap-4 rounded-xl border-3 border-theme-border bg-theme-surface shadow-[4px_4px_0px_0px] shadow-theme-border overflow-hidden transition-all hover:shadow-[6px_6px_0px_0px] hover:shadow-theme-border hover:-translate-x-[2px] hover:-translate-y-[2px] cursor-pointer text-left ${isWatched ? "opacity-70" : ""}`}>
      {/* Poster */}
      <div className="relative w-20 sm:w-24 shrink-0 bg-theme-surface-alt">
        {poster ? <Image src={poster} alt={item.title} fill className="object-cover" sizes="96px" />
          : <div className="flex h-full items-center justify-center text-2xl">{item.mediaType === "tv" ? "📺" : "🎬"}</div>}
        {isWatching && (
          <div className="absolute top-1 left-1 rounded-md border-2 border-theme-border bg-yellow-400 px-1 py-0.5 text-[9px] font-bold">VIENDO</div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 py-2.5 pr-1 min-w-0">
        <div className="flex items-start gap-2">
          <h3 className={`font-bold text-theme-text text-sm leading-tight line-clamp-1 ${isWatched ? "line-through" : ""}`}>{item.title}</h3>
          <span className="shrink-0 rounded-md border-2 border-theme-border bg-theme-badge px-1.5 py-0.5 text-[10px] font-bold text-theme-text">
            {item.mediaType === "tv" ? "SERIE" : "PELI"}
          </span>
        </div>
        {(item.genreNames || item.releaseYear) && <p className="font-mono text-[10px] text-theme-text-muted truncate">{[item.releaseYear, item.genreNames].filter(Boolean).join(" · ")}</p>}
        <div className="flex items-center gap-1.5 mt-auto flex-wrap">
          {item.voteAverage && (
            <span className="flex items-center gap-0.5 rounded-md border-2 border-theme-border bg-theme-highlight px-1.5 py-0.5 text-[10px] font-bold">★ {item.voteAverage}</span>
          )}
          <span className={`rounded-md border-2 border-theme-border px-1.5 py-0.5 text-[10px] font-bold ${item.addedBy === "vicki" ? "bg-pink-200 text-pink-700" : "bg-blue-200 text-blue-700"}`}>{item.addedBy}</span>
          {item.addedAt && (
            <span className="rounded-md border-2 border-theme-border bg-theme-surface-alt px-1.5 py-0.5 text-[10px] font-mono font-bold text-theme-text-muted">
              {new Date(item.addedAt).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit" })}
            </span>
          )}
          {item.collections.map((c) => (
            <span key={c.collectionId} className="rounded-md border-2 border-theme-border bg-theme-card-bar px-1.5 py-0.5 text-[10px] font-bold text-theme-text-muted">📂 {c.collectionName}</span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col justify-center gap-2 py-3 pr-3 shrink-0">
        {/* Main: toggle vista/por ver */}
        <button onClick={(e) => onSetStatus(e, mainStatus)} title={mainTitle}
          className={`flex h-8 w-8 items-center justify-center rounded-lg border-2 border-theme-border shadow-[2px_2px_0px_0px] shadow-theme-border transition-all hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer ${mainColor}`}>
          {mainIcon}
        </button>
        {/* Viendo */}
        {!isWatched && (
          <button onClick={(e) => onSetStatus(e, isWatching ? "pending" : "watching")} title={isWatching ? "Dejar de ver" : "Viendo"}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border-2 border-theme-border shadow-[2px_2px_0px_0px] shadow-theme-border transition-all hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer ${isWatching ? "bg-yellow-300" : "bg-yellow-100"}`}>
            <Play size={14} strokeWidth={2.5} />
          </button>
        )}
        {/* Collection */}
        <CollectionPopover
          onSelect={(colId) => { if (colId) onAddToCollection(colId); }}
          showNone={false}
          triggerClassName="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-theme-border bg-theme-surface shadow-[2px_2px_0px_0px] shadow-theme-border transition-all hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer text-theme-text-muted hover:text-theme-text"
          triggerLabel={<FolderOpen size={14} strokeWidth={2.5} />}
        />
        {/* Delete */}
        <button onClick={onRemove} title="Eliminar"
          className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-theme-border bg-red-100 shadow-[2px_2px_0px_0px] shadow-theme-border transition-all hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer text-red-600">
          <Trash2 size={14} strokeWidth={2.5} />
        </button>
      </div>
    </button>
  );
}
