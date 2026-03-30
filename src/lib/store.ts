import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  gridColumns: 1 | 2;
  setGridColumns: (cols: 1 | 2) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      gridColumns: 2,
      setGridColumns: (cols) => set({ gridColumns: cols }),
    }),
    { name: "pipones-settings" }
  )
);
