const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

function getApiKey() {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY env variable is required");
  return key;
}

export type MediaType = "movie" | "tv";

export interface TMDBItem {
  id: number;
  media_type: MediaType;
  title: string; // normalized: original is "name" for tv
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string; // normalized: original is "first_air_date" for tv
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
}

export interface TMDBItemDetail extends TMDBItem {
  genres: { id: number; name: string }[];
  runtime: number | null; // for tv we'll use episode_run_time
  tagline: string;
  number_of_seasons?: number;
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface WatchProviderResult {
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

export function posterUrl(path: string | null, size: "w342" | "w500" | "w780" = "w500") {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function backdropUrl(path: string | null) {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/w1280${path}`;
}

export function providerLogoUrl(path: string) {
  return `${TMDB_IMAGE_BASE}/w92${path}`;
}

// Normalize TMDB results (movies use title/release_date, tv uses name/first_air_date)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeItem(item: any, fallbackMediaType?: MediaType): TMDBItem {
  const mediaType = item.media_type || fallbackMediaType || "movie";
  return {
    id: item.id,
    media_type: mediaType,
    title: item.title || item.name || "",
    overview: item.overview || "",
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    release_date: item.release_date || item.first_air_date || "",
    vote_average: item.vote_average || 0,
    vote_count: item.vote_count || 0,
    genre_ids: item.genre_ids || [],
  };
}

export async function searchMulti(query: string): Promise<TMDBItem[]> {
  if (!query.trim()) return [];
  const key = getApiKey();
  const res = await fetch(
    `${TMDB_BASE}/search/multi?api_key=${key}&query=${encodeURIComponent(query)}&language=es-AR&include_adult=false`
  );
  if (!res.ok) throw new Error("TMDB search failed");
  const data = await res.json();
  // Filter only movie and tv, skip person results
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.results
    .filter((r: any) => r.media_type === "movie" || r.media_type === "tv")
    .map((r: any) => normalizeItem(r));
}

export async function getTrending(): Promise<TMDBItem[]> {
  const key = getApiKey();
  const res = await fetch(
    `${TMDB_BASE}/trending/all/week?api_key=${key}&language=es-AR`
  );
  if (!res.ok) throw new Error("TMDB trending failed");
  const data = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.results
    .filter((r: any) => r.media_type === "movie" || r.media_type === "tv")
    .map((r: any) => normalizeItem(r));
}

export async function getDetail(id: number, mediaType: MediaType): Promise<TMDBItemDetail> {
  const key = getApiKey();
  const res = await fetch(
    `${TMDB_BASE}/${mediaType}/${id}?api_key=${key}&language=es-AR`
  );
  if (!res.ok) throw new Error("TMDB detail failed");
  const data = await res.json();
  const normalized = normalizeItem(data, mediaType);
  return {
    ...normalized,
    genres: data.genres || [],
    runtime: data.runtime || (data.episode_run_time?.[0] ?? null),
    tagline: data.tagline || "",
    number_of_seasons: data.number_of_seasons,
  };
}

export async function getWatchProviders(id: number, mediaType: MediaType): Promise<WatchProviderResult | null> {
  const key = getApiKey();
  const res = await fetch(
    `${TMDB_BASE}/${mediaType}/${id}/watch/providers?api_key=${key}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.results?.AR || data.results?.US || null;
}

// TMDB genre map (movies + tv)
const GENRE_MAP: Record<number, string> = {
  28: "Accion",
  12: "Aventura",
  16: "Animacion",
  35: "Comedia",
  80: "Crimen",
  99: "Documental",
  18: "Drama",
  10751: "Familia",
  14: "Fantasia",
  36: "Historia",
  27: "Terror",
  10402: "Musica",
  9648: "Misterio",
  10749: "Romance",
  878: "Ciencia Ficcion",
  10770: "Pelicula de TV",
  53: "Suspenso",
  10752: "Guerra",
  37: "Western",
  // TV-specific genres
  10759: "Accion y Aventura",
  10762: "Kids",
  10763: "Noticias",
  10764: "Reality",
  10765: "Sci-Fi y Fantasia",
  10766: "Telenovela",
  10767: "Talk Show",
  10768: "Guerra y Politica",
};

export function genreName(id: number): string {
  return GENRE_MAP[id] || "Otro";
}
