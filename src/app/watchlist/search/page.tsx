import { Suspense } from "react";
import { MovieGrid } from "@/components/movie-grid";

export default function WatchlistSearchPage() {
  return (
    <Suspense>
      <MovieGrid />
    </Suspense>
  );
}
