"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clapperboard } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al iniciar sesion");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Error de conexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f0e8] p-4">
      <div className="w-full max-w-sm">
        {/* Window card */}
        <div className="rounded-xl border-3 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          {/* Title bar */}
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b-3 border-black bg-neutral-100">
            <div className="w-3 h-3 rounded-full border-2 border-black bg-white" />
            <div className="w-3 h-3 rounded-full border-2 border-black bg-white" />
            <span className="ml-2 font-mono text-xs text-neutral-500">login.tmdb</span>
          </div>

          {/* Content */}
          <div className="p-6 flex flex-col gap-6">
            {/* Logo */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center justify-center w-14 h-14 bg-amber-400 border-3 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <Clapperboard size={28} strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl font-bold text-black">
                Piponcito&apos;s Watchlist
              </h1>
              <p className="text-sm text-neutral-500 font-mono">Inicia sesion</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="username" className="font-mono text-xs font-bold text-black uppercase tracking-wider">
                  Usuario
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 rounded-lg border-3 border-black bg-white px-4 text-base font-medium outline-none focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                  autoComplete="username"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="font-mono text-xs font-bold text-black uppercase tracking-wider">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-lg border-3 border-black bg-white px-4 text-base font-medium outline-none focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                  autoComplete="current-password"
                  required
                />
              </div>

              {error && (
                <div className="rounded-lg border-2 border-red-400 bg-red-50 px-3 py-2 font-mono text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="h-12 rounded-lg border-3 border-black bg-black text-white font-bold text-base shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
