import React, { useMemo, useState } from "react";
import type { Note } from "@voxhq/web-sdk";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { remarkAlert } from "remark-github-blockquote-alert";
import { cn } from "../cn";
import type { VoxNoteListProps } from "../types";

const alertStyles: Record<string, string> = {
  "markdown-alert-note": "border-blue-500 bg-blue-50 text-blue-800",
  "markdown-alert-tip": "border-green-500 bg-green-50 text-green-800",
  "markdown-alert-warning": "border-amber-500 bg-amber-50 text-amber-800",
  "markdown-alert-caution": "border-red-500 bg-red-50 text-red-800",
};

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
    <div className={cn("grid gap-4 ", className)} {...rest}>
      {/* Preview panel */}
      {showPreview ? (
        <div className="rounded-xl border bg-background">
          <div className="border-b px-3 py-2 text-sm font-medium">
            {previewTitle ?? active?.name ?? "Notes Preview"}
          </div>

          <div className="p-4">
            {!active ? (
              <div className="text-sm text-muted-foreground">Start a session to capture notes.</div>
            ) : active.status !== "ready" ? (
              <div className="text-sm text-muted-foreground">
                This note is {active.status}.
              </div>
            ) : (
              <article className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm, remarkAlert]}
                  components={{
                    div: ({ className, children, ...props }) => {
                      if (className?.includes("markdown-alert")) {
                        const typeClass = className.split(" ").find(c => c.startsWith("markdown-alert-")) || "";
                        const style = alertStyles[typeClass] || "border-gray-500 bg-gray-50";
                        return (
                          <div className={`mb-4 rounded-md border-l-4 p-4 text-sm ${style} ${className}`} {...props}>
                            {children}
                          </div>
                        );
                      }
                      return <div className={className} {...props}>{children}</div>;
                    },
                    p: ({ className, children, ...props }) => {
                      if (className?.includes("markdown-alert-title")) {
                        return (
                          <p className={`mb-1 font-semibold flex items-center gap-2 [&>svg]:fill-current [&>svg]:text-current ${className}`} {...props}>
                            {children}
                          </p>
                        );
                      }
                      return <p className={className} {...props}>{children}</p>
                   }
                  }}
                >
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