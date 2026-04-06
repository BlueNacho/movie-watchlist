"use client";

const STORAGE_KEY = "pipones-onboarding";

export type OnboardingPhase = "home" | "settings" | "rating" | "done";

interface OnboardingState {
  phase: OnboardingPhase;
  completed: boolean;
  skipped: boolean;
}

function getState(): OnboardingState {
  if (typeof window === "undefined") return { phase: "home", completed: false, skipped: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { phase: "home", completed: false, skipped: false };
}

function setState(state: Partial<OnboardingState>) {
  const current = getState();
  const next = { ...current, ...state };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function shouldShowOnboarding(): boolean {
  const state = getState();
  return !state.completed && !state.skipped;
}

export function getOnboardingPhase(): OnboardingPhase {
  return getState().phase;
}

export function setOnboardingPhase(phase: OnboardingPhase) {
  setState({ phase });
}

export function completeOnboarding() {
  setState({ completed: true, phase: "done" });
}

export function skipOnboarding() {
  setState({ skipped: true, phase: "done" });
}

export function resetOnboarding() {
  localStorage.removeItem(STORAGE_KEY);
}
