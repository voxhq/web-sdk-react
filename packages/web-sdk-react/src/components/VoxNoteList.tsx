import React, { useMemo, useState } from "react";
import type { Note } from "@voxhq/web-sdk";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "../cn";
import type { VoxNoteListProps } from "../types";

function statusBadgeClass(status: Note["status"]) {
  switch (status) {
    case "ready":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    case "generating":
    case "pending":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case "failed":
      return "bg-red-500/10 text-red-700 dark:text-red-300";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function toUpdatedAtString(updatedAt: Note["updatedAt"]) {
  if (typeof updatedAt === "string") return updatedAt;
  if (updatedAt instanceof Date) return updatedAt.toISOString();
  return String(updatedAt);
}

export function VoxNoteList(props: VoxNoteListProps) {
  const {
    notes,
    selectedId,
    defaultSelectedId,
    onSelectId,
    showPreview = true,
    listTitle = "Notes",
    previewTitle,
    className,
    ...rest
  } = props;

  const firstId = notes[0]?.id;
  const [uncontrolledId, setUncontrolledId] = useState<string | undefined>(
    defaultSelectedId ?? firstId
  );

  const activeId = selectedId ?? uncontrolledId ?? firstId;

  const active = useMemo(() => notes.find((n) => n.id === activeId), [notes, activeId]);

  function select(id: string) {
    onSelectId?.(id);
    if (selectedId === undefined) setUncontrolledId(id);
  }

  return (
    <div className={cn("grid gap-4 md:grid-cols-[280px_1fr]", className)} {...rest}>
      {/* List panel */}
      <div className="rounded-xl border bg-background">
        <div className="border-b px-3 py-2 text-sm font-medium">{listTitle}</div>
        <div className="p-2">
          {notes.length === 0 ? (
            <div className="px-2 py-6 text-sm text-muted-foreground">No notes yet.</div>
          ) : (
            <div className="space-y-1">
              {notes.map((n) => {
                const isActive = n.id === activeId;
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => select(n.id)}
                    className={cn(
                      "w-full rounded-lg border px-2 py-2 text-left transition-colors",
                      "hover:bg-muted",
                      isActive ? "border-primary/40 bg-muted" : "border-transparent"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate text-sm font-medium">{n.name}</div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                          statusBadgeClass(n.status)
                        )}
                      >
                        {n.status}
                      </span>
                    </div>
                    <div className="mt-1 truncate text-xs text-muted-foreground">
                      {toUpdatedAtString(n.updatedAt)}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Preview panel */}
      {showPreview ? (
        <div className="rounded-xl border bg-background">
          <div className="border-b px-3 py-2 text-sm font-medium">
            {previewTitle ?? active?.name ?? "Preview"}
          </div>

          <div className="p-4">
            {!active ? (
              <div className="text-sm text-muted-foreground">Select a note to preview.</div>
            ) : active.status !== "ready" ? (
              <div className="text-sm text-muted-foreground">
                This note is {active.status}.
              </div>
            ) : (
              <article className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {active.content || ""}
                </ReactMarkdown>
              </article>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}