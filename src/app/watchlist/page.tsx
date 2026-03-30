import { WatchlistView } from "@/components/watchlist-view";
import { Header } from "@/components/header";

export default function WatchlistPage() {
  return (
    <div className="min-h-screen bg-theme-bg">
      <Header />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <WatchlistView />
      </main>
      <footer className="border-t-3 border-theme-border bg-theme-surface py-6">
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">
          <p className="font-mono text-xs text-theme-text-muted">
            Datos de{" "}
            <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-theme-text transition-colors">
              TMDB
            </a>
          </p>
          <p className="font-mono text-xs text-theme-text-muted">2026</p>
        </div>
      </footer>
    </div>
  );
}
