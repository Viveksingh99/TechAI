"use client";

import * as React from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface KanbanColumn<T> {
  id: string;
  title: string;
  items: T[];
  dotClassName?: string;
}

export function KanbanBoard<T>({
  columns,
  keyField,
  renderCard,
  onMove,
  className,
}: {
  columns: KanbanColumn<T>[];
  keyField: (item: T) => string;
  renderCard: (item: T) => ReactNode;
  onMove?: (itemId: string, fromColumnId: string, toColumnId: string) => void;
  className?: string;
}) {
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [draggingFrom, setDraggingFrom] = React.useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = React.useState<string | null>(null);

  return (
    <div className={cn("flex gap-4 overflow-x-auto pb-3", className)}>
      {columns.map((col) => (
        <div
          key={col.id}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverCol(col.id);
          }}
          onDragLeave={() => setDragOverCol((c) => (c === col.id ? null : c))}
          onDrop={() => {
            if (draggingId && draggingFrom && draggingFrom !== col.id) {
              onMove?.(draggingId, draggingFrom, col.id);
            }
            setDragOverCol(null);
          }}
          className={cn(
            "flex w-[280px] shrink-0 flex-col rounded-2xl border bg-secondary/20 p-3 transition-colors",
            dragOverCol === col.id ? "border-primary/50 bg-primary/5" : "border-border"
          )}
        >
          <div className="mb-3 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full bg-primary", col.dotClassName)} />
              <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
            </div>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {col.items.length}
            </span>
          </div>
          <div className="flex min-h-[100px] flex-col gap-2">
            {col.items.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-5 text-center text-xs text-muted-foreground">
                No items
              </div>
            )}
            {col.items.map((item) => {
              const id = keyField(item);
              return (
                <div
                  key={id}
                  draggable
                  onDragStart={() => {
                    setDraggingId(id);
                    setDraggingFrom(col.id);
                  }}
                  onDragEnd={() => {
                    setDraggingId(null);
                    setDraggingFrom(null);
                    setDragOverCol(null);
                  }}
                  className={cn(
                    "cursor-grab rounded-xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing",
                    draggingId === id && "opacity-50"
                  )}
                >
                  {renderCard(item)}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
