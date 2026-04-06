"use client";

import { useEffect, useSyncExternalStore } from "react";

interface UserData {
  userId: number;
  username: string;
  avatarUrl: string | null;
  theme: "blue" | "pink";
}

let cached: UserData | null = null;
let fetched = false;
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

function getSnapshot(): UserData | null {
  return cached;
}

async function fetchUser(force = false) {
  if (!force && fetched) return;
  fetched = true;
  try {
    const res = await fetch("/api/auth/me");
    if (res.ok) {
      cached = await res.json();
      notify();
    }
  } catch {}
}

/** Call after updating user data (avatar, theme, etc.) */
export function invalidateCurrentUser(optimistic?: Partial<UserData>) {
  if (optimistic && cached) {
    cached = { ...cached, ...optimistic };
    notify();
  }
  fetched = false;
  fetchUser(true);
}

export function useCurrentUser() {
  const user = useSyncExternalStore(subscribe, getSnapshot, () => null);

  useEffect(() => {
    fetchUser();
  }, []);

  return { user, invalidate: invalidateCurrentUser };
}
