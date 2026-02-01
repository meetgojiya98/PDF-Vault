"use client";

import React, { useRef, useState } from "react";
import type { Rect } from "../utils/coords";

export function RedactionCanvas({
  image,
  rects,
  onChange
}: {
  image: string | null;
  rects: Rect[];
  onChange: (rects: Rect[]) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [draft, setDraft] = useState<Rect | null>(null);

  const start = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setDraft({ x, y, width: 0, height: 0 });
  };

  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draft || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setDraft({
      x: draft.x,
      y: draft.y,
      width: x - draft.x,
      height: y - draft.y
    });
  };

  const end = () => {
    if (draft) {
      const normalized = {
        x: Math.min(draft.x, draft.x + draft.width),
        y: Math.min(draft.y, draft.y + draft.height),
        width: Math.abs(draft.width),
        height: Math.abs(draft.height)
      };
      if (normalized.width > 4 && normalized.height > 4) {
        onChange([...rects, normalized]);
      }
    }
    setDraft(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-xl border border-slate-700 bg-slate-950"
      onPointerDown={start}
      onPointerMove={move}
      onPointerUp={end}
      onPointerLeave={end}
    >
      {image ? (
        <img src={image} alt="Preview" className="w-full select-none" />
      ) : (
        <div className="flex h-64 items-center justify-center text-sm text-slate-400">
          Select a page
        </div>
      )}
      {rects.map((rect, index) => (
        <div
          key={index}
          className="absolute border-2 border-red-400 bg-red-500/40"
          style={{
            left: rect.x,
            top: rect.y,
            width: rect.width,
            height: rect.height
          }}
        />
      ))}
      {draft && (
        <div
          className="absolute border-2 border-red-300 bg-red-400/30"
          style={{
            left: Math.min(draft.x, draft.x + draft.width),
            top: Math.min(draft.y, draft.y + draft.height),
            width: Math.abs(draft.width),
            height: Math.abs(draft.height)
          }}
        />
      )}
    </div>
  );
}
