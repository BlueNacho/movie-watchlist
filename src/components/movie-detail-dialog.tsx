"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Plus, Check } from "lucide-react";
import { CollectionPopover } from "./collection-popover";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { posterUrl, providerLogoUrl } from "@/lib/tmdb";
import type { TMDBItemDetail, WatchProviderResult, MediaType } from "@/lib/tmdb";

interface DetailData extends TMDBItemDetail {
  watch_providers: WatchProviderResult | null;
}

interface Props {
  itemId: number | null;
  mediaType: MediaType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded?: () => void;
  hideAddButton?: boolean;
  headerLabel?: string;
  onOpenCallback?: () => void;
  alreadyInWatchlist?: boolean;
}

export function MovieDetailDialog({ itemId, mediaType, open, onOpenChange, onAdded, hideAddButton, headerLabel, onOpenCallback, alreadyInWatchlist }: Props) {
  const [item, setItem] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [addingToList, setAddingToList] = useState(false);
  const [addedToList, setAddedToList] = useState(false);
  const [addError, setAddError] = useState("");

  useEffect(() => {
    if (!itemId || !mediaType || !open) return;
    setLoading(true);
    setAddedToList(!!alreadyInWatchlist);
    setAddError("");
    fetch(`/api/movie/${itemId}?type=${mediaType}`)
      .then((res) => res.json())
      .then((data) => {
        setItem(data);
        onOpenCallback?.();
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, mediaType, open]);

  const poster = item ? posterUrl(item.poster_path, "w500") : null;
  const providers = item?.watch_providers;
  const allProviders = [
    ...(providers?.flatrate || []),
    ...(providers?.rent || []),
    ...(providers?.buy || []),
  ];
  const uniqueProviders = allProviders.filter(
    (p, i, arr) => arr.findIndex((x) => x.provider_id === p.provider_id) === i
  );
  const isTv = mediaType === "tv";

  async function handleAddToWatchlist(collectionId: number | null = null) {
    if (!item || !mediaType) return;
    setAddingToList(true);
    setAddError("");
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdbId: item.id,
          mediaType,
          title: item.title,
          posterPath: item.poster_path,
          overview: item.overview,
          voteAverage: item.vote_average?.toFixed(1),
          genreNames: item.genres?.map((g) => g.name).join(", "),
          releaseYear: item.release_date?.split("-")[0] || null,
          collectionId,
        }),
      });
      if (res.status === 409) {
        setAddedToList(true);
        return;
      }
      if (!res.ok) {
        setAddError("Error al agregar");
        return;
      }
      setAddedToList(true);
      onAdded?.();
    } catch {
      setAddError("Error de conexion");
    } finally {
      setAddingToList(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="fixed inset-0 top-0 left-0 flex flex-col w-full h-full max-w-none translate-x-0 translate-y-0 rounded-none border-0 p-0 bg-theme-surface shadow-none sm:inset-4 sm:top-[5%] sm:left-1/2 sm:w-auto sm:h-[90vh] sm:-translate-x-1/2 sm:translate-y-0 sm:max-w-4xl sm:rounded-xl sm:border-3 sm:border-theme-border sm:shadow-[8px_8px_0px_0px] sm:shadow-theme-border overflow-hidden"
      >
        {/* Window title bar */}
        <div className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 border-b-3 border-theme-border bg-theme-card-bar z-10">
          <div className="w-3 h-3 rounded-full border-2 border-theme-border bg-theme-surface" />
          <div className="w-3 h-3 rounded-full border-2 border-theme-border bg-theme-surface" />
          <span className="ml-2 flex-1 font-mono text-xs text-theme-text-muted truncate">
            {headerLabel || `${item?.title || "cargando..."} — detalle.mkv`}
          </span>
          <DialogClose className="flex h-7 w-7 items-center justify-center rounded-md border-2 border-theme-border bg-theme-surface text-theme-text hover:bg-theme-highlight transition-colors cursor-pointer shrink-0">
            <X size={14} strokeWidth={3} />
          </DialogClose>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {loading || !item ? (
            <div className="flex items-center justify-center py-32">
              <div className="flex flex-col items-center gap-3">
                <div className="text-5xl animate-bounce">🍿</div>
                <span className="font-mono text-sm font-bold text-theme-text-muted">Cargando...</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Poster */}
              {poster && (
                <div className="relative w-full h-72 sm:h-80 shrink-0 border-b-3 border-theme-border bg-theme-surface-alt">
                  <Image
                    src={poster}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 896px"
                    priority
                  />
                </div>
              )}

              {/* Details */}
              <div className="flex flex-col gap-3 p-5">
                <div className="flex items-start gap-2">
                  <DialogTitle className="text-xl sm:text-2xl font-bold text-theme-text leading-tight">
                    {item.title}
                  </DialogTitle>
                  <span className="shrink-0 mt-1 rounded-md border-2 border-theme-border bg-theme-badge px-2 py-0.5 text-xs font-bold text-theme-text">
                    {isTv ? "SERIE" : "PELI"}
                  </span>
                </div>

                {item.tagline && (
                  <p className="font-mono text-xs sm:text-sm italic text-theme-text-muted">
                    &ldquo;{item.tagline}&rdquo;
                  </p>
                )}

                {/* Stats row */}
                <div className="flex flex-wrap gap-2">
                  {item.release_date && (
                    <div className="flex items-center rounded-lg border-2 border-theme-border bg-theme-surface-alt px-3 py-1">
                      <span className="font-mono text-sm font-bold text-theme-text">{item.release_date.split("-")[0]}</span>
                    </div>
                  )}
                  {item.runtime && (
                    <div className="flex items-center rounded-lg border-2 border-theme-border bg-theme-surface-alt px-3 py-1">
                      <span className="font-mono text-sm font-bold text-theme-text">{item.runtime} min</span>
                    </div>
                  )}
                  {item.number_of_seasons && (
                    <div className="flex items-center rounded-lg border-2 border-theme-border bg-theme-surface-alt px-3 py-1">
                      <span className="font-mono text-sm font-bold text-theme-text">{item.number_of_seasons} temp.</span>
                    </div>
                  )}
                  {item.vote_average > 0 && (
                    <div className="flex items-center gap-1 rounded-lg border-2 border-theme-border bg-theme-highlight px-3 py-1">
                      <span className="font-bold">★</span>
                      <span className="font-mono text-sm font-bold">{item.vote_average.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-1.5">
                  {item.genres?.map((g) => (
                    <span
                      key={g.id}
                      className="rounded-md border-2 border-theme-border bg-theme-header px-2 py-0.5 text-xs font-bold text-theme-header-text"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>

                {/* Overview */}
                <p className="text-sm text-theme-text-muted leading-relaxed">
                  {item.overview || "Sin descripcion disponible."}
                </p>

                {/* Watch Providers */}
                {uniqueProviders.length > 0 && (
                  <div className="pt-3 border-t-2 border-dashed border-theme-badge">
                    <p className="font-mono text-[10px] font-bold text-theme-text-muted uppercase tracking-widest mb-2">
                      Donde verla
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {uniqueProviders.map((p) => (
                        <div key={p.provider_id} title={p.provider_name}>
                          <Image
                            src={providerLogoUrl(p.logo_path)}
                            alt={p.provider_name}
                            width={40}
                            height={40}
                            className="rounded-lg border-2 border-theme-border shadow-[2px_2px_0px_0px] shadow-theme-border"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add to watchlist button */}
                {!hideAddButton && <div className="pt-3">
                  {addError && (
                    <p className="font-mono text-xs text-red-500 mb-2">{addError}</p>
                  )}
                  {addedToList ? (
                    <div className="w-full flex items-center justify-center gap-2 h-12 rounded-lg border-3 border-theme-border bg-green-200 text-green-800 font-bold text-sm">
                      <Check size={18} strokeWidth={3} />
                      Ya esta en la lista
                    </div>
                  ) : addingToList ? (
                    <div className="w-full flex items-center justify-center h-12 rounded-lg border-3 border-theme-border bg-theme-surface-alt font-bold text-sm text-theme-text-muted">
                      Agregando...
                    </div>
                  ) : (
                    <CollectionPopover
                      onSelect={(colId) => handleAddToWatchlist(colId)}
                      triggerClassName="w-full flex items-center justify-center gap-2 h-12 rounded-lg border-3 border-theme-border bg-theme-highlight text-theme-text font-bold text-sm shadow-[4px_4px_0px_0px] shadow-theme-border transition-all cursor-pointer hover:shadow-[2px_2px_0px_0px] hover:shadow-theme-border hover:translate-x-[2px] hover:translate-y-[2px]"
                      triggerLabel={<><Plus size={18} strokeWidth={3} /> Agregar a la lista</>}
                      position="above"
                    />
                  )}
                </div>}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
