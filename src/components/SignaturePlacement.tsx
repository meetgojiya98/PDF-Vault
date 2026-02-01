"use client";

import React, { useRef, useState } from "react";
import type { Rect } from "../utils/coords";

export function SignaturePlacement({
  image,
  signature,
  placement,
  onChange
}: {
  image: string | null;
  signature: string | null;
  placement: Rect;
  onChange: (rect: Rect) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const start = () => setDragging(true);
  const end = () => setDragging(false);

  const move = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left - placement.width / 2;
    const y = event.clientY - rect.top - placement.height / 2;
    onChange({ ...placement, x, y });
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-xl border border-slate-700 bg-slate-950"
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
      {signature && image && (
        <div
          className="absolute cursor-move"
          onPointerDown={start}
          style={{ left: placement.x, top: placement.y, width: placement.width, height: placement.height }}
        >
          <img src={signature} alt="Signature" className="h-full w-full object-contain" />
        </div>
      )}
    </div>
  );
}
