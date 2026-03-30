import { Suspense } from "react";
import { MovieGrid } from "@/components/movie-grid";
import { PageLayout } from "@/components/page-layout";

export default function Home() {
  return (
    <PageLayout>
      <Suspense>
        <MovieGrid />
      </Suspense>
    </PageLayout>
  );
}
