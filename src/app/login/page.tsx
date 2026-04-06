"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { StatusBar } from "@/components/pipon-os/status-bar";
import { IPhoneHomeIcon } from "@/components/pipon-os/iphone-home-icon";
import { UserAvatar } from "@/components/user-avatar";

interface UserInfo {
  username: string;
  avatarUrl: string | null;
  theme: string;
}

const LABELS: Record<string, string> = { nacho: "Nacho", vicki: "Vicki" };

export default function LoginPage() {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const router = useRouter();

  // Fetch users with avatars
  useEffect(() => {
    fetch("/api/auth/users")
      .then((res) => res.json())
      .then((data) => { if (Array.isArray(data)) setUsers(data); })
      .catch(() => {});
  }, []);

  // Restore last user from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("pipones-last-user");
    if (saved) {
      setSelectedUser(saved);
    }
  }, []);

  // Auto-submit when 4 digits entered
  useEffect(() => {
    if (pin.length === 4 && selectedUser) {
      handleLogin();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  function selectUser(username: string) {
    setSelectedUser(username);
    setShowUserPicker(false);
    setPin("");
    setError("");
    localStorage.setItem("pipones-last-user", username);
  }

  function handleDigit(digit: string) {
    if (pin.length >= 4) return;
    setError("");
    setPin((prev) => prev + digit);
  }

  function handleDelete() {
    setPin((prev) => prev.slice(0, -1));
    setError("");
  }

  async function handleLogin() {
    if (!selectedUser || pin.length !== 4) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: selectedUser, pin }),
      });

      if (!res.ok) {
        setError("PIN incorrecto");
        setPin("");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Error de conexion");
      setPin("");
      setLoading(false);
    }
  }

  const currentUser = users.find((u) => u.username === selectedUser);

  // Set theme based on selected user
  useEffect(() => {
    if (selectedUser === "vicki") {
      document.documentElement.setAttribute("data-theme", "pink");
    } else if (selectedUser === "nacho") {
      document.documentElement.setAttribute("data-theme", "blue");
    }
  }, [selectedUser]);

  return (
    <div className="min-h-screen flex flex-col bg-theme-bg">
      <StatusBar />

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 max-w-sm mx-auto w-full">
        {/* User selector - at top */}
        <div className="relative w-full mb-6">
          <button
            onClick={() => setShowUserPicker(!showUserPicker)}
            className="flex items-center gap-3 w-full rounded-2xl border-3 border-theme-border bg-theme-surface/70 px-4 py-3 hover:bg-theme-surface transition-colors cursor-pointer"
          >
            {currentUser ? (
              <>
                <UserAvatar username={currentUser.username} avatarUrl={currentUser.avatarUrl} size={36} />
                <span className="flex-1 text-left font-bold text-theme-text">{LABELS[currentUser.username] || currentUser.username}</span>
              </>
            ) : (
              <>
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-dashed border-theme-border" />
                <span className="flex-1 text-left font-medium text-theme-text-muted">Selecciona un usuario</span>
              </>
            )}
            <ChevronDown size={18} strokeWidth={2.5} className={`text-theme-text-muted transition-transform ${showUserPicker ? "rotate-180" : ""}`} />
          </button>

          {showUserPicker && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border-3 border-theme-border bg-theme-surface shadow-lg overflow-hidden z-10">
              {users.map((user) => (
                <button
                  key={user.username}
                  onClick={() => selectUser(user.username)}
                  className={`flex items-center gap-3 w-full px-4 py-3 hover:bg-theme-surface-alt transition-colors cursor-pointer ${
                    selectedUser === user.username ? "bg-theme-surface-alt" : ""
                  }`}
                >
                  <UserAvatar username={user.username} avatarUrl={user.avatarUrl} size={36} />
                  <span className="font-bold text-theme-text">{LABELS[user.username] || user.username}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className={`text-xl font-bold text-theme-text mb-2 ${loading ? "animate-pulse" : ""}`}>
          {loading ? "Ingresando..." : "Ingresa el PIN"}
        </h1>

        {/* PIN dots */}
        <div className={`flex gap-3 mb-8 ${loading ? "animate-pulse" : ""}`}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-3 transition-all duration-150 ${
                i < pin.length
                  ? "bg-theme-text border-theme-text scale-110"
                  : "border-theme-text-muted bg-transparent"
              } ${error && pin.length === 0 ? "border-red-400" : ""}`}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm font-bold text-red-500 mb-4 animate-pulse">{error}</p>
        )}

        {/* Number pad */}
        <div className={`grid grid-cols-3 gap-4 mb-8 ${!selectedUser ? "opacity-30 pointer-events-none" : ""}`}>
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map((key) => {
            if (key === "") return <div key="empty" />;
            if (key === "del") {
              return (
                <button
                  key="del"
                  onClick={handleDelete}
                  className="flex items-center justify-center w-20 h-20 rounded-full text-3xl font-bold text-theme-text-muted hover:bg-black/5 transition-colors cursor-pointer"
                >
                  ⌫
                </button>
              );
            }
            return (
              <button
                key={key}
                onClick={() => handleDigit(key)}
                disabled={loading}
                className="flex items-center justify-center w-20 h-20 rounded-full border-3 border-theme-border bg-theme-surface/60 text-2xl font-bold text-theme-text hover:bg-theme-surface hover:border-theme-border active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {key}
              </button>
            );
          })}
        </div>

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
