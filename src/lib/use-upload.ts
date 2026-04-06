"use client";

import { useState } from "react";

interface UploadResult {
  url: string;
}

export function useUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File, folder = "uploads"): Promise<UploadResult | null> {
    setUploading(true);
    setError(null);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", folder);

      const res = await fetch("/api/upload", { method: "POST", body: form });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al subir");
        return null;
      }

      return await res.json();
    } catch {
      setError("Error de conexion");
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function remove(url: string): Promise<boolean> {
    try {
      const res = await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  return { upload, remove, uploading, error };
}
