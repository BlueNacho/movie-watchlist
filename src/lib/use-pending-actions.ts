"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

interface PendingCounts {
  [key: string]: number;
}

// Global client-side cache shared across all components
let cachedCounts: PendingCounts = {};
let lastFetchedAt = 0;
const STALE_MS = 5 * 60 * 1000; // 5 minutes
let listeners: (() => void)[] = [];

function notify() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot() {
  return cachedCounts;
}

async function fetchCounts(force = false) {
  if (!force && Date.now() - lastFetchedAt < STALE_MS) return;
  try {
    const res = await fetch("/api/pending-actions");
    if (res.ok) {
      cachedCounts = await res.json();
      lastFetchedAt = Date.now();
      notify();
    }
  } catch {}
}

/** Call this after a rating or any action that changes pending counts */
export function invalidatePendingActions() {
  lastFetchedAt = 0;
  fetchCounts(true);
}

export function usePendingActions() {
  const counts = useSyncExternalStore(subscribe, getSnapshot, () => ({} as PendingCounts));

  useEffect(() => {
    fetchCounts();
  }, []);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return { counts, total, invalidate: invalidatePendingActions };
}
