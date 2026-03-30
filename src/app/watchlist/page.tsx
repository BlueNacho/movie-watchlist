import { Suspense } from "react";
import { WatchlistView } from "@/components/watchlist-view";
import { PageLayout } from "@/components/page-layout";

export default function WatchlistPage() {
  return (
    <PageLayout>
      <Suspense>
        <WatchlistView />
      </Suspense>
    </PageLayout>
  );
}
