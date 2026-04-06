"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ArrowLeft, Camera } from "lucide-react";
import { HomeButton } from "@/components/pipon-os/home-button";
import { UserAvatar } from "@/components/user-avatar";
import { useUpload } from "@/lib/use-upload";
import { useOnboarding } from "@/lib/use-onboarding";

export default function SettingsPage() {
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const { upload, uploading, error: uploadError } = useUpload();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.username) setUsername(data.username);
        if (data?.avatarUrl) setAvatarUrl(data.avatarUrl);
      })
      .catch(() => {});
  }, []);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await upload(file, "avatars");
    if (result) {
      setAvatarUrl(result.url);
      await fetch("/api/auth/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: result.url }),
      });
    }
  }

  async function handleRemoveAvatar() {
    setAvatarUrl(null);
    await fetch("/api/auth/avatar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarUrl: null }),
    });
  }

  useOnboarding({
    phase: "settings",
    steps: [
      {
        element: "#settings-avatar",
        popover: {
          title: "Tu foto de perfil 📸",
          description: "Toca el icono de camara para cambiar tu foto. Se ve en toda la app!!",
        },
      },
      {
        element: "#settings-logout",
        popover: {
          title: "Cerrar sesion 👋",
          description: "Por si te pinta esa jajajja",
        },
      },
      {
        element: "#home-button",
        popover: {
          title: "Boton de inicio 🏠",
          description: "Este boton aparece en todas las apps y te lleva al inicio. Tambien podes usar la flechita ← de arriba a la izquierda!",
        },
      },
    ],
    nextPhase: "rating",
    nextRoute: "/rating",
  }, username);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col bg-theme-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-theme-badge border-b-3 border-theme-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="flex h-9 w-9 items-center justify-center rounded-lg border-3 border-theme-border bg-theme-surface shadow-[2px_2px_0px_0px] shadow-theme-border transition-all hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer text-theme-text"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <h1 className="text-lg sm:text-xl font-bold text-theme-text">Settings</h1>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-lg w-full px-4 sm:px-6 py-8">
        <div className="flex flex-col gap-4">
          {/* User card with avatar upload */}
          <div id="settings-avatar" className="rounded-xl border-3 border-theme-border bg-theme-surface shadow-[4px_4px_0px_0px] shadow-theme-border p-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                {username ? (
                  <UserAvatar username={username} avatarUrl={avatarUrl} size={56} className="border-3" />
                ) : (
                  <div className="w-14 h-14 rounded-full border-3 border-dashed border-theme-border" />
                )}
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-theme-border bg-theme-highlight shadow-[2px_2px_0px_0px] shadow-theme-border cursor-pointer hover:scale-110 transition-transform disabled:opacity-50"
                >
                  <Camera size={12} strokeWidth={2.5} />
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </div>
              <div>
                <p className="text-xl font-bold text-theme-text capitalize">{username || "..."}</p>
                <p className="font-mono text-xs text-theme-text-muted flex items-center gap-1.5">
                  {uploading ? "Subiendo..." : <><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" /></span>Conectado</>}
                </p>
                {uploadError && <p className="font-mono text-[10px] text-red-500">{uploadError}</p>}
              </div>
            </div>
            {avatarUrl && (
              <button
                onClick={handleRemoveAvatar}
                className="mt-3 font-mono text-xs text-theme-text-muted underline hover:text-red-500 transition-colors cursor-pointer"
              >
                Quitar foto de perfil
              </button>
            )}
          </div>

          {/* Info */}
          <div className="rounded-xl border-3 border-theme-border bg-theme-surface shadow-[4px_4px_0px_0px] shadow-theme-border p-5">
            <p className="font-mono text-[10px] font-bold text-theme-text-muted uppercase tracking-widest mb-3">Informacion</p>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-theme-text-muted">Version</span>
                <span className="font-bold text-theme-text">PiponOS 2.0</span>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            id="settings-logout"
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 rounded-xl border-3 border-theme-border bg-red-100 p-4 font-bold text-sm text-red-600 shadow-[4px_4px_0px_0px] shadow-theme-border transition-all hover:shadow-[2px_2px_0px_0px] hover:shadow-theme-border hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer"
          >
            <LogOut size={18} strokeWidth={2.5} />
            Cerrar sesion
          </button>
        </div>
      </main>

      <HomeButton />
    </div>
  );
}
