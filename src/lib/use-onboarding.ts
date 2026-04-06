"use client";

import { useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import {
  shouldShowOnboarding,
  getOnboardingPhase,
  setOnboardingPhase,
  completeOnboarding,
  skipOnboarding,
  type OnboardingPhase,
} from "./onboarding";

interface OnboardingConfig {
  phase: OnboardingPhase;
  steps: DriveStep[];
  nextPhase?: OnboardingPhase;
  nextRoute?: string;
}

export function useOnboarding(config: OnboardingConfig, username: string, ready = true) {
  const router = useRouter();
  const ran = useRef(false);
  const configRef = useRef(config);
  configRef.current = config;

  // Only depend on stable primitives
  const canRun = username === "vicki" && ready && shouldShowOnboarding() && getOnboardingPhase() === config.phase;

  useEffect(() => {
    if (!canRun || ran.current) return;
    ran.current = true;

    const cfg = configRef.current;

    const timeout = setTimeout(() => {
      const d = driver({
        showProgress: true,
        animate: true,
        allowClose: true,
        overlayColor: "rgba(0,0,0,0.6)",
        stagePadding: 8,
        stageRadius: 12,
        popoverClass: "pipones-tour",
        nextBtnText: "Siguiente →",
        prevBtnText: "← Anterior",
        doneBtnText: cfg.nextPhase ? "Continuar →" : "Listo!",
        progressText: "{{current}} de {{total}}",
        steps: cfg.steps,
        onCloseClick: () => {
          skipOnboarding();
          d.destroy();
        },
        onDestroyStarted: () => {
          if (!d.isLastStep()) {
            skipOnboarding();
            d.destroy();
            return;
          }
          if (cfg.nextPhase && cfg.nextRoute) {
            setOnboardingPhase(cfg.nextPhase);
            d.destroy();
            router.push(cfg.nextRoute);
          } else {
            completeOnboarding();
            d.destroy();
          }
        },
      });

      d.drive();
    }, 800);

    return () => clearTimeout(timeout);
  }, [canRun, router]);
}
