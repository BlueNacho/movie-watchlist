import { Suspense } from "react";
import { HomeScreen } from "@/components/pipon-os/home-screen";

export default function Home() {
  return (
    <Suspense>
      <HomeScreen />
    </Suspense>
  );
}
