"use client";

import { useState } from "react";
import Image from "next/image";
import { GripVertical, Trash2, X } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { posterUrl } from "@/lib/tmdb";

interface CollectionItem {
  id: number;
  tmdbId: number;
  title: string;
  posterPath: string | null;
  mediaType: string;
  voteAverage: string | null;
  position: number;
}

interface Collection {
  id: number;
  name: string;
  items: CollectionItem[];
}

interface Props {
  collection: Collection;
  onClose: () => void;
  onReorder: (collectionId: number, items: { id: number; position: number }[]) => void;
  onRemoveFromCollection: (itemId: number) => void;
  onDeleteCollection: (collectionId: number) => void;
  onItemClick: (item: CollectionItem) => void;
}

export function CollectionView({ collection, onClose, onReorder, onRemoveFromCollection, onDeleteCollection, onItemClick }: Props) {
  const [items, setItems] = useState(
    [...collection.items].sort((a, b) => a.position - b.position)
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    setItems(reordered);

    const updates = reordered.map((item, idx) => ({ id: item.id, position: idx }));
    onReorder(collection.id, updates);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-theme-border bg-theme-surface text-theme-text hover:bg-theme-surface-alt transition-colors cursor-pointer"
        >
          <X size={16} strokeWidth={3} />
        </button>
        <h3 className="text-xl font-bold text-theme-text flex-1">{collection.name}</h3>
        <span className="font-mono text-xs text-theme-text-muted">{items.length} items</span>
        <button
          onClick={() => setConfirmDelete(true)}
          className="flex h-8 items-center gap-1.5 rounded-lg border-2 border-theme-border bg-red-100 px-2 text-xs font-bold text-red-600 hover:bg-red-200 transition-colors cursor-pointer"
        >
          <Trash2 size={12} strokeWidth={2.5} />
          Eliminar
        </button>
      </div>

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="rounded-xl border-3 border-red-300 bg-red-50 p-4 flex flex-col gap-3">
          <p className="text-sm font-bold text-red-700">Eliminar &ldquo;{collection.name}&rdquo;?</p>
          <p className="text-xs text-red-600">Las pelis no se borran de la lista, solo se quitan de la coleccion.</p>
          <div className="flex gap-2">
            <button
              onClick={() => onDeleteCollection(collection.id)}
              className="flex-1 rounded-lg border-3 border-red-400 bg-red-500 text-white px-3 py-2 text-sm font-bold cursor-pointer hover:bg-red-600 transition-colors"
            >
              Si, eliminar
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="flex-1 rounded-lg border-3 border-theme-border bg-theme-surface px-3 py-2 text-sm font-bold cursor-pointer hover:bg-theme-surface-alt transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 rounded-xl border-3 border-theme-border bg-theme-surface shadow-[4px_4px_0px_0px] shadow-theme-border">
          <span className="text-4xl">📂</span>
          <p className="text-sm font-bold text-theme-text-muted">Coleccion vacia</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {items.map((item, idx) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  index={idx}
                  onRemove={() => { setItems((prev) => prev.filter((i) => i.id !== item.id)); onRemoveFromCollection(item.id); }}
                  onClick={() => onItemClick(item)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function SortableItem({
  item,
  index,
  onRemove,
  onClick,
}: {
  item: CollectionItem;
  index: number;
  onRemove: () => void;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  const poster = posterUrl(item.posterPath, "w342");

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-xl border-3 border-theme-border bg-theme-surface shadow-[3px_3px_0px_0px] shadow-theme-border overflow-hidden ${isDragging ? "shadow-[6px_6px_0px_0px]" : ""}`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-center w-10 shrink-0 self-stretch bg-theme-card-bar border-r-2 border-theme-border cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical size={18} strokeWidth={2} className="text-theme-text-muted" />
      </div>

      {/* Number */}
      <span className="font-mono text-sm font-bold text-theme-text-muted w-6 text-center shrink-0">
        {index + 1}
      </span>

      {/* Poster */}
      <div className="relative w-10 h-14 shrink-0 bg-theme-surface-alt rounded overflow-hidden">
        {poster ? (
          <Image src={poster} alt={item.title} fill className="object-cover" sizes="40px" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm">🎬</div>
        )}
      </div>

      {/* Title */}
      <button onClick={onClick} className="flex-1 text-left min-w-0 cursor-pointer py-2">
        <p className="font-bold text-sm text-theme-text truncate">{item.title}</p>
        <span className="font-mono text-[10px] text-theme-text-muted">
          {item.mediaType === "tv" ? "Serie" : "Peli"}
          {item.voteAverage && ` · ★ ${item.voteAverage}`}
        </span>
      </button>

      {/* Remove */}
      <button
        onClick={onRemove}
        className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-theme-border bg-theme-surface text-theme-text-muted hover:bg-red-100 hover:text-red-600 transition-colors cursor-pointer mr-2 shrink-0"
        title="Sacar de coleccion"
      >
        <X size={14} strokeWidth={3} />
      </button>
    </div>
  );
}
