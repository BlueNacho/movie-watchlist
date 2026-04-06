"use client";

import { useEffect } from "react";
import { Settings, Clapperboard, Star, CalendarHeart, Gamepad2, Music, BookOpen, Camera } from "lucide-react";
import { StatusBar } from "./status-bar";
import { AppIcon } from "./app-icon";
import { IPhoneHomeIcon } from "./iphone-home-icon";
import { useTheme } from "@/lib/theme";
import { usePendingActions } from "@/lib/use-pending-actions";
import { useOnboarding } from "@/lib/use-onboarding";
import { useCurrentUser } from "@/lib/use-current-user";

export function HomeScreen() {
  const { setTheme } = useTheme();
  const { counts } = usePendingActions();
  const { user } = useCurrentUser();
  const username = user?.username ?? "";

  // Re-sync theme from cached user
  useEffect(() => {
    if (user?.theme === "blue" || user?.theme === "pink") {
      setTheme(user.theme);
    }
  }, [user?.theme, setTheme]);

  useOnboarding({
    phase: "home",
    steps: [
      {
        popover: {
          title: "Bienvenida a PiponOS! 🎉",
          description: "Te hice un tour para que no te pierdas!! Podes omitir el tour cerrando la ventanita si te da paja jasjaj",
        },
      },
      {
        element: "#app-settings",
        popover: {
          title: "Settings ⚙️",
          description: "Aca podes cambiar tu foto de perfil y cerrar sesion.",
        },
      },
      {
        element: "#app-watchlist",
        popover: {
          title: "Watchlist 🎬",
          description: "Esta es la app de las pelis, que ya te enseñe a usar ajajajaj",
        },
      },
      {
        element: "#app-rank",
        popover: {
          title: "Pipon Rank ⭐",
          description: "Esta app es para ponerle rating a los lugares donde salimos a comerrr",
        },
      },
    ],
    nextPhase: "settings",
    nextRoute: "/settings",
  }, username);

  return (
    <div className="min-h-screen flex flex-col bg-theme-bg">
      <StatusBar />

      {/* Header */}
      <div className="text-center py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl font-[family-name:var(--font-title)] text-theme-text">
          PiponOS <span className="text-red-400">❤️</span>
        </h1>
      </div>

      {/* App grid */}
      <div className="flex-1 px-6 sm:px-12 max-w-lg mx-auto w-full">
        <div className="grid grid-cols-4 gap-y-6 gap-x-4 sm:gap-6 justify-items-center">
          <AppIcon href="/settings" label="Settings" icon={Settings} color="bg-theme-surface-alt" id="app-settings" />
          <AppIcon href="/watchlist" label="Watchlist" icon={Clapperboard} color="bg-theme-surface-alt" id="app-watchlist" />
          <AppIcon href="/rating" label="Pipon Rank" icon={Star} color="bg-theme-surface-alt" badge={counts.places} id="app-rank" />
          <AppIcon href="/dates" label="Dates" icon={CalendarHeart} comingSoon />
          <AppIcon href="/minigame" label="Minigame" icon={Gamepad2} comingSoon />
          <AppIcon href="/music" label="Musica" icon={Music} comingSoon />
          <AppIcon href="/notes" label="Notas" icon={BookOpen} comingSoon />
          <AppIcon href="/photos" label="Fotos" icon={Camera} comingSoon />
        </div>
      </div>

      {/* Page dot */}
      <div className="flex items-center justify-center py-4">
        <div className="w-2 h-2 rounded-full bg-theme-text" />
      </div>

      {/* Home button bar */}
      <div className="flex items-center justify-center py-3 bg-theme-badge border-t-3 border-theme-border">
        <div className="flex items-center justify-center w-12 h-12 rounded-full border-3 border-theme-border bg-theme-surface shadow-[3px_3px_0px_0px] shadow-theme-border">
          <IPhoneHomeIcon size={22} className="text-theme-text" />
        </div>
      </div>
    </div>
  );
}
