"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Search, Trash2, X, Camera, MapPin } from "lucide-react";
import { HomeButton } from "@/components/pipon-os/home-button";
import { StarRatingDisplay, StarRatingInput } from "@/components/star-rating";
import { UserAvatar } from "@/components/user-avatar";
import { useUpload } from "@/lib/use-upload";
import { FilterDropdown } from "@/components/filter-dropdown";
import { invalidatePendingActions } from "@/lib/use-pending-actions";
import { useOnboarding } from "@/lib/use-onboarding";
import { useCurrentUser } from "@/lib/use-current-user";

interface PlaceRating {
  username: string;
  avatarUrl: string | null;
  score: number;
  comment: string | null;
}

interface Place {
  id: number;
  name: string;
  imageUrl: string | null;
  address: string | null;
  category: string | null;
  notes: string | null;
  visitedAt: string | null;
  addedBy: string;
  createdAt: string;
  ratings: PlaceRating[];
}

const CATEGORIES = [
  { value: "restaurant", label: "Restaurant" },
  { value: "cafe", label: "Cafe" },
  { value: "bar", label: "Bar" },
  { value: "pizza", label: "Pizzeria" },
  { value: "sushi", label: "Sushi" },
  { value: "burger", label: "Hamburguesas" },
  { value: "helado", label: "Heladeria" },
  { value: "parrilla", label: "Parrilla" },
  { value: "otro", label: "Otro" },
];

export default function RatingPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const { user } = useCurrentUser();
  const username = user?.username ?? "";
  const router = useRouter();

  const fetchPlaces = useCallback(() => {
    setLoading(true);
    fetch("/api/places")
      .then((r) => r.json())
      .then((data) => setPlaces(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPlaces(); }, [fetchPlaces]);

  async function deletePlace(e: React.MouseEvent, id: number) {
    e.stopPropagation();
    await fetch(`/api/places/${id}`, { method: "DELETE" });
    setPlaces((prev) => prev.filter((p) => p.id !== id));
  }

  useOnboarding({
    phase: "rating",
    steps: [
      {
        element: "#rating-add",
        popover: {
          title: "Agregar lugares 📍",
          description: "Toca aca para agregar un lugar nuevo que hayamos visitado.",
        },
      },
      {
        element: "#rating-search",
        popover: {
          title: "Buscar y filtrar 🔍",
          description: "Podes buscar por nombre o filtrar por categoria.",
        },
      },
      {
        element: "#rating-list",
        popover: {
          title: "Tus lugares ⭐",
          description: "Toca cualquier lugar para ver el detalle y dejar tu calificacion. Si ves 'Calificar' en naranja es que te falta puntuar!",
        },
      },
    ],
  }, username, !loading);

  const displayed = places
    .filter((p) => !search.trim() || p.name.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => !categoryFilter || p.category === categoryFilter);

  return (
    <div className="min-h-screen flex flex-col bg-theme-bg">
      <header className="sticky top-0 z-50 bg-theme-badge border-b-3 border-theme-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center gap-3">
          <button onClick={() => router.push("/")} className="flex h-9 w-9 items-center justify-center rounded-lg border-3 border-theme-border bg-theme-surface shadow-[2px_2px_0px_0px] shadow-theme-border transition-all hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer text-theme-text">
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <h1 className="text-lg sm:text-xl font-[family-name:var(--font-title)] text-theme-text">Pipon Rank ☕⭐</h1>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-2xl w-full px-4 sm:px-6 py-8 pb-20">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold text-theme-text">Lugares</h2>
            <div className="flex-1 border-t-3 border-theme-border" />
            <button id="rating-add" onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 rounded-lg border-3 border-theme-border bg-theme-highlight px-3 py-2 font-bold text-sm shadow-[3px_3px_0px_0px] shadow-theme-border transition-all hover:shadow-[1px_1px_0px_0px] hover:shadow-theme-border hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer shrink-0">
              <Plus size={16} strokeWidth={2.5} /> Agregar
            </button>
          </div>

          {/* Search */}
          <div id="rating-search" className="flex items-center border-3 border-theme-border rounded-xl bg-theme-surface shadow-[4px_4px_0px_0px] shadow-theme-border overflow-hidden">
            <div className="flex items-center justify-center w-12 h-12 bg-theme-accent border-r-3 border-theme-border shrink-0">
              <Search size={18} strokeWidth={3} className="text-white" />
            </div>
            <input type="text" placeholder="Buscar lugar..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="flex-1 h-12 px-4 text-base font-medium bg-transparent outline-none placeholder:text-theme-text-muted text-theme-text" />
            {search && (
              <button onClick={() => setSearch("")} className="flex items-center justify-center w-10 h-10 mr-2 rounded-lg text-theme-text-muted hover:text-theme-text cursor-pointer">
                <X size={18} strokeWidth={2.5} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterDropdown label="Categoria" options={CATEGORIES} value={categoryFilter} onChange={setCategoryFilter} />
          </div>

          {/* List */}
          {loading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4 rounded-xl border-3 border-theme-border bg-theme-surface shadow-[4px_4px_0px_0px] shadow-theme-border overflow-hidden">
                  <div className="w-24 sm:w-28 shrink-0 aspect-square bg-theme-surface-alt animate-pulse" />
                  <div className="flex flex-1 flex-col gap-2 py-3 pr-3">
                    <div className="h-5 w-2/3 bg-theme-surface-alt rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-theme-card-bar rounded animate-pulse" />
                    <div className="h-4 w-24 bg-theme-surface-alt rounded animate-pulse mt-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 rounded-xl border-3 border-theme-border bg-theme-surface shadow-[4px_4px_0px_0px] shadow-theme-border">
              <span className="text-5xl">🍽️</span>
              <p className="text-base font-bold text-theme-text-muted">
                {places.length === 0 ? "No hay lugares todavia. Agrega uno!" : "Nada con estos filtros."}
              </p>
            </div>
          ) : (
            <div id="rating-list" className="flex flex-col gap-3">
              {displayed.map((place) => (
                <PlaceCard key={place.id} place={place} onClick={() => setSelectedPlace(place)} onDelete={(e) => deletePlace(e, place.id)} username={username} />
              ))}
            </div>
          )}
        </div>
      </main>

      <HomeButton />
      {showAdd && <AddPlaceModal onClose={() => setShowAdd(false)} onAdded={() => { setShowAdd(false); fetchPlaces(); invalidatePendingActions(); }} />}
      {selectedPlace && (
        <PlaceDetailModal place={selectedPlace} username={username} onClose={() => setSelectedPlace(null)} onRated={() => { setSelectedPlace(null); fetchPlaces(); invalidatePendingActions(); }} />
      )}
    </div>
  );
}

function PlaceCard({ place, onClick, onDelete, username }: { place: Place; onClick: () => void; onDelete: (e: React.MouseEvent) => void; username: string }) {
  const missingRating = username && !place.ratings.some((r) => r.username === username);

  return (
    <button onClick={onClick}
      className="flex gap-4 rounded-xl border-3 border-theme-border bg-theme-surface shadow-[4px_4px_0px_0px] shadow-theme-border overflow-hidden transition-all hover:shadow-[6px_6px_0px_0px] hover:shadow-theme-border hover:-translate-x-[2px] hover:-translate-y-[2px] cursor-pointer text-left w-full">
      <div className="relative w-24 sm:w-28 shrink-0 aspect-square bg-theme-surface-alt">
        {place.imageUrl ? (
          <Image src={place.imageUrl} alt={place.name} fill className="object-cover" sizes="112px" />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl">🍽️</div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 py-3 pr-1 min-w-0">
        <div className="flex items-start gap-2">
          <h3 className="font-bold text-theme-text text-sm sm:text-base leading-tight line-clamp-1">{place.name}</h3>
          {place.category && (
            <span className="shrink-0 rounded-md border-2 border-theme-border bg-theme-badge px-1.5 py-0.5 text-[10px] font-bold text-theme-text">
              {CATEGORIES.find((c) => c.value === place.category)?.label || place.category}
            </span>
          )}
          {missingRating && (
            <span className="shrink-0 flex items-center gap-1 rounded-md border-2 border-orange-300 bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-600">
              ⭐ Calificar
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {place.notes && (
            <p className="font-mono text-[10px] text-theme-text-muted truncate">{place.notes}</p>
          )}
        </div>
        {place.visitedAt && (
          <p className="font-mono text-[10px] text-theme-text-muted">
            📅 {new Date(place.visitedAt).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit" })}
          </p>
        )}
        <div className="flex flex-col gap-0.5 mt-auto">
          {place.ratings.map((r) => (
            <div key={r.username} className="flex items-center gap-1.5">
              <span className={`text-[10px] font-bold w-10 ${r.username === "vicki" ? "text-pink-600" : "text-blue-600"}`}>{r.username}</span>
              <StarRatingDisplay score={r.score} size={11} />
              <span className="font-mono text-[10px] text-theme-text-muted">{r.score.toFixed(1)}</span>
            </div>
          ))}
          {place.ratings.length === 0 && (
            <span className="font-mono text-[10px] text-theme-text-muted">Sin calificaciones</span>
          )}
        </div>
      </div>

      <div className="flex flex-col justify-center pr-3 shrink-0">
        <button onClick={onDelete} title="Eliminar"
          className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-theme-border bg-red-100 shadow-[2px_2px_0px_0px] shadow-theme-border transition-all hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer text-red-600">
          <Trash2 size={14} strokeWidth={2.5} />
        </button>
      </div>
    </button>
  );
}

function AddPlaceModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [visitedAt, setVisitedAt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { upload, uploading } = useUpload();

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await upload(file, "places");
    if (result) setImageUrl(result.url);
  }

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    await fetch("/api/places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, address, category, notes, imageUrl, visitedAt: visitedAt || null }),
    });
    setSaving(false);
    onAdded();
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50">
      <div className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-xl border-3 border-theme-border bg-theme-surface shadow-[8px_8px_0px_0px] shadow-theme-border">
        <div className="sticky top-0 z-10 flex items-center gap-1.5 px-4 py-2.5 border-b-3 border-theme-border bg-theme-card-bar">
          <div className="w-3 h-3 rounded-full border-2 border-theme-border bg-theme-surface" />
          <div className="w-3 h-3 rounded-full border-2 border-theme-border bg-theme-surface" />
          <span className="ml-2 flex-1 font-mono text-xs text-theme-text-muted">nuevo lugar</span>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-md border-2 border-theme-border bg-theme-surface text-theme-text hover:bg-theme-highlight transition-colors cursor-pointer">
            <X size={14} strokeWidth={3} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="relative flex items-center justify-center w-20 h-20 rounded-xl border-3 border-dashed border-theme-border bg-theme-surface-alt hover:bg-theme-card-bar transition-colors cursor-pointer overflow-hidden shrink-0">
              {imageUrl ? (
                <Image src={imageUrl} alt="Preview" fill className="object-cover" sizes="80px" />
              ) : (
                <Camera size={24} strokeWidth={2} className="text-theme-text-muted" />
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            <p className="font-mono text-xs text-theme-text-muted">{uploading ? "Subiendo..." : "Foto del lugar (opcional)"}</p>
          </div>

          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del lugar *"
            className="h-12 rounded-lg border-3 border-theme-border bg-theme-surface px-4 text-base font-medium outline-none focus:shadow-[3px_3px_0px_0px] focus:shadow-theme-border transition-shadow" />
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Direccion (opcional)"
            className="h-12 rounded-lg border-3 border-theme-border bg-theme-surface px-4 text-base font-medium outline-none focus:shadow-[3px_3px_0px_0px] focus:shadow-theme-border transition-shadow" />
          <FilterDropdown label="Categoria" options={CATEGORIES} value={category} onChange={setCategory} />
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs font-bold text-theme-text-muted uppercase tracking-wider">Fecha de visita</label>
            <input type="date" value={visitedAt} onChange={(e) => setVisitedAt(e.target.value)}
              className="h-12 rounded-lg border-3 border-theme-border bg-theme-surface px-4 text-base font-medium outline-none focus:shadow-[3px_3px_0px_0px] focus:shadow-theme-border transition-shadow" />
          </div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas (opcional)" rows={2}
            className="rounded-lg border-3 border-theme-border bg-theme-surface px-4 py-3 text-sm font-medium outline-none focus:shadow-[3px_3px_0px_0px] focus:shadow-theme-border transition-shadow resize-none" />

          <button onClick={handleSave} disabled={!name.trim() || saving}
            className="h-12 rounded-lg border-3 border-theme-border bg-theme-highlight font-bold text-sm shadow-[4px_4px_0px_0px] shadow-theme-border transition-all hover:shadow-[2px_2px_0px_0px] hover:shadow-theme-border hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer disabled:opacity-50">
            {saving ? "Guardando..." : "Agregar lugar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PlaceDetailModal({ place, username, onClose, onRated }: { place: Place; username: string; onClose: () => void; onRated: () => void }) {
  const myRating = place.ratings.find((r) => r.username === username);
  const [score, setScore] = useState(myRating?.score ?? 0);
  const [comment, setComment] = useState(myRating?.comment ?? "");
  const [saving, setSaving] = useState(false);

  async function handleRate() {
    setSaving(true);
    await fetch(`/api/places/${place.id}/rate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score, comment }),
    });
    setSaving(false);
    onRated();
  }

  const avgScore = place.ratings.length > 0
    ? place.ratings.reduce((a, r) => a + r.score, 0) / place.ratings.length
    : 0;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50">
      <div className="w-full h-full sm:h-auto sm:max-w-lg sm:max-h-[90vh] overflow-y-auto sm:rounded-xl border-0 sm:border-3 border-theme-border bg-theme-surface sm:shadow-[8px_8px_0px_0px] sm:shadow-theme-border">
        <div className="sticky top-0 z-10 flex items-center gap-1.5 px-4 py-2.5 border-b-3 border-theme-border bg-theme-card-bar">
          <div className="w-3 h-3 rounded-full border-2 border-theme-border bg-theme-surface" />
          <div className="w-3 h-3 rounded-full border-2 border-theme-border bg-theme-surface" />
          <span className="ml-2 flex-1 font-mono text-xs text-theme-text-muted truncate">{place.name}</span>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-md border-2 border-theme-border bg-theme-surface text-theme-text hover:bg-theme-highlight transition-colors cursor-pointer">
            <X size={14} strokeWidth={3} />
          </button>
        </div>

        {place.imageUrl && (
          <div className="relative w-full h-48 border-b-3 border-theme-border bg-theme-surface-alt">
            <Image src={place.imageUrl} alt={place.name} fill className="object-cover" sizes="512px" />
          </div>
        )}

        <div className="p-5 flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold text-theme-text">{place.name}</h2>
            {place.address && (
              <p className="font-mono text-xs text-theme-text-muted flex items-center gap-1 mt-1">
                <MapPin size={12} strokeWidth={2} /> {place.address}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {place.category && (
                <span className="rounded-md border-2 border-theme-border bg-theme-badge px-2 py-0.5 text-xs font-bold text-theme-text">
                  {CATEGORIES.find((c) => c.value === place.category)?.label || place.category}
                </span>
              )}
              {place.visitedAt && (
                <span className="rounded-md border-2 border-theme-border bg-theme-surface-alt px-2 py-0.5 text-xs font-mono font-bold text-theme-text-muted">
                  📅 {new Date(place.visitedAt).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              )}
            </div>
          </div>

          {place.notes && <p className="text-sm text-theme-text-muted leading-relaxed">{place.notes}</p>}

          {/* Google Maps */}
          {place.address && (
            <div className="rounded-lg border-2 border-theme-border overflow-hidden">
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(place.address)}&output=embed`}
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}

          {/* Average */}
          {place.ratings.length > 0 && (
            <div className="flex items-center gap-3 rounded-lg border-2 border-theme-border bg-theme-surface-alt px-3 py-2">
              <span className="font-mono text-xs font-bold text-theme-text-muted">Promedio</span>
              <StarRatingDisplay score={avgScore} size={18} />
              <span className="font-mono text-lg font-bold text-theme-text">{avgScore.toFixed(1)}</span>
            </div>
          )}

          {/* All ratings */}
          {place.ratings.map((r) => (
            <div key={r.username} className="rounded-lg border-2 border-theme-border bg-theme-surface-alt p-3">
              <div className="flex items-center gap-2 mb-1">
                <UserAvatar username={r.username} avatarUrl={r.avatarUrl} size={24} />
                <span className="font-bold text-sm text-theme-text capitalize">{r.username}</span>
                <StarRatingDisplay score={r.score} size={14} />
                <span className="font-mono text-xs font-bold text-theme-text-muted">{r.score.toFixed(1)}</span>
              </div>
              {r.comment && <p className="text-sm text-theme-text-muted mt-1 italic">&ldquo;{r.comment}&rdquo;</p>}
            </div>
          ))}

          {/* Rate */}
          <div className="border-t-2 border-dashed border-theme-badge pt-4">
            <p className="font-mono text-[10px] font-bold text-theme-text-muted uppercase tracking-widest mb-3">
              {myRating ? "Editar mi calificacion" : "Calificar"}
            </p>
            <div className="flex flex-col gap-4">
              <StarRatingInput value={score} onChange={setScore} />
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Comentario (opcional)" rows={2}
                className="w-full rounded-lg border-2 border-theme-border bg-theme-surface px-3 py-2 text-sm outline-none resize-none" />
              <button onClick={handleRate} disabled={score === 0 || saving}
                className="w-full h-11 rounded-lg border-3 border-theme-border bg-theme-highlight font-bold text-sm shadow-[4px_4px_0px_0px] shadow-theme-border transition-all hover:shadow-[2px_2px_0px_0px] hover:shadow-theme-border hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer disabled:opacity-50">
                {saving ? "Guardando..." : myRating ? "Actualizar" : "Calificar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
