import { Suspense } from "react";
import { WatchlistView } from "@/components/watchlist-view";

export default function WatchlistPage() {
  return (
    <Suspense>
      <WatchlistView />
    </Suspense>
  );
}
