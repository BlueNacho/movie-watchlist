"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Plus, FolderOpen } from "lucide-react";

interface Collection {
  id: number;
  name: string;
}

interface Props {
  onSelect: (collectionId: number | null) => void;
  triggerClassName?: string;
  triggerLabel?: React.ReactNode;
  showNone?: boolean;
  position?: "below" | "above";
}

export function CollectionPopover({ onSelect, triggerClassName, triggerLabel, showNone = true, position = "below" }: Props) {
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (open && !loaded) {
      fetch("/api/collections")
        .then((r) => r.json())
        .then((data) => setCollections(Array.isArray(data) ? data : []))
        .finally(() => setLoaded(true));
    }
  }, [open, loaded]);

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      if (position === "above") {
        setMenuPos({
          top: rect.top + window.scrollY - 8,
          left: Math.max(8, rect.right - 224),
        });
      } else {
        setMenuPos({
          top: rect.bottom + window.scrollY + 8,
          left: Math.max(8, rect.right - 224),
        });
      }
    }
  }, [open, position]);

  async function handleCreate() {
    if (!newName.trim()) return;
    const res = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    if (res.ok) {
      const col = await res.json();
      setCollections((prev) => [...prev, col]);
      setNewName("");
      setCreating(false);
      onSelect(col.id);
      setOpen(false);
    }
  }

  function handleSelect(id: number | null) {
    onSelect(id);
    setOpen(false);
  }

  return (
    <>
      <button
        ref={triggerRef}
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className={triggerClassName || "flex items-center gap-1.5 rounded-lg border-2 border-theme-border bg-theme-surface px-2 py-1 text-xs font-bold shadow-[2px_2px_0px_0px] shadow-theme-border transition-all hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer"}
      >
        {triggerLabel || <><FolderOpen size={12} strokeWidth={2.5} /> Coleccion</>}
      </button>

      {open && createPortal(
        <>
          <div className="fixed inset-0 z-[100]" onClick={(e) => { e.stopPropagation(); setOpen(false); }} />
          <div
            className="absolute z-[101] w-56 rounded-xl border-3 border-theme-border bg-theme-surface shadow-[4px_4px_0px_0px] shadow-theme-border p-2 flex flex-col gap-1"
            style={{
              top: menuPos.top,
              left: menuPos.left,
              ...(position === "above" ? { transform: "translateY(-100%)" } : {}),
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-mono text-[10px] font-bold text-theme-text-muted uppercase tracking-wider px-2 py-1">Coleccion</p>

            {showNone && (
              <button
                onClick={() => handleSelect(null)}
                className="w-full text-left rounded-lg px-3 py-2 text-xs font-bold hover:bg-theme-surface-alt transition-colors cursor-pointer"
              >
                Ninguna
              </button>
            )}

            {!loaded ? (
              <p className="px-3 py-2 text-xs text-theme-text-muted animate-pulse">Cargando...</p>
            ) : (
              collections.map((col) => (
                <button
                  key={col.id}
                  onClick={() => handleSelect(col.id)}
                  className="w-full text-left rounded-lg px-3 py-2 text-xs font-bold hover:bg-theme-surface-alt transition-colors cursor-pointer flex items-center gap-2"
                >
                  <FolderOpen size={12} strokeWidth={2} />
                  {col.name}
                </button>
              ))
            )}

            {creating ? (
              <div className="flex gap-1 px-1" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nombre..."
                  className="flex-1 rounded-lg border-2 border-theme-border bg-theme-surface px-2 py-1.5 text-xs outline-none"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setCreating(false); }}
                />
                <button onClick={handleCreate} className="rounded-lg border-2 border-theme-border bg-theme-highlight px-2 py-1.5 text-xs font-bold cursor-pointer">OK</button>
              </div>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="w-full text-left rounded-lg px-3 py-2 text-xs font-bold text-theme-text-muted hover:bg-theme-surface-alt transition-colors cursor-pointer flex items-center gap-2 border-t border-theme-badge mt-1 pt-2"
              >
                <Plus size={12} strokeWidth={3} />
                Nueva coleccion
              </button>
            )}
          </div>
        </>,
        document.body
      )}
    </>
  );
}
