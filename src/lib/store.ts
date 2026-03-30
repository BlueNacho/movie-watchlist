import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  gridColumns: 1 | 2;
  setGridColumns: (cols: 1 | 2) => void;
  collectionsCollapsed: boolean;
  setCollectionsCollapsed: (v: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      gridColumns: 2,
      setGridColumns: (cols) => set({ gridColumns: cols }),
      collectionsCollapsed: false,
      setCollectionsCollapsed: (v) => set({ collectionsCollapsed: v }),
    }),
    { name: "pipones-settings" }
  )
);

// Hook that waits for zustand hydration to avoid flash
export function useAppStoreHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated(true));
    // Already hydrated
    if (useAppStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);
  return hydrated;
}
