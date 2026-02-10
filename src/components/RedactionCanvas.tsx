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
    if (!containerRef.current || !image) return;
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
    if (draft && containerRef.current) {
      const bounds = containerRef.current.getBoundingClientRect();
      if (!bounds.width || !bounds.height) {
        setDraft(null);
        return;
      }
      const normalized = {
        x: Math.min(draft.x, draft.x + draft.width),
        y: Math.min(draft.y, draft.y + draft.height),
        width: Math.abs(draft.width),
        height: Math.abs(draft.height)
      };
      if (normalized.width > 4 && normalized.height > 4) {
        const percentRect = {
          x: normalized.x / bounds.width,
          y: normalized.y / bounds.height,
          width: normalized.width / bounds.width,
          height: normalized.height / bounds.height
        };
        onChange([...rects, clampNormalizedRect(percentRect)]);
      }
    }
    setDraft(null);
  };

  const removeRect = (index: number) => {
    onChange(rects.filter((_, i) => i !== index));
  };

  return (
    <div className="card-hover p-6 animate-slide-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Redaction Zones</h3>
            <p className="text-xs text-slate-500">{rects.length} {rects.length === 1 ? 'area' : 'areas'} marked</p>
          </div>
        </div>
        {rects.length > 0 && (
          <button
            onClick={() => onChange([])}
            className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl border-2 border-dashed border-red-500/30 bg-slate-900/50 backdrop-blur-sm cursor-crosshair hover:border-red-500/50 transition-all"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
      >
        {image ? (
          <img src={image} alt="Preview" className="w-full select-none bg-white" />
        ) : (
          <div className="flex h-96 flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-400">Select a page to redact</p>
            <p className="text-xs text-slate-600 mt-1">Click and drag to mark sensitive areas</p>
          </div>
        )}
        {rects.map((rect, index) => (
          <div
            key={index}
            className="absolute border-2 border-red-400 bg-red-500/40 backdrop-blur-sm group cursor-pointer"
            style={{
              left: `${rect.x * 100}%`,
              top: `${rect.y * 100}%`,
              width: `${rect.width * 100}%`,
              height: `${rect.height * 100}%`
            }}
            onClick={(e) => {
              e.stopPropagation();
              removeRect(index);
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/60">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        ))}
        {draft && (
          <div
            className="absolute border-2 border-red-300 bg-red-400/30 animate-pulse"
            style={{
              left: Math.min(draft.x, draft.x + draft.width),
              top: Math.min(draft.y, draft.y + draft.height),
              width: Math.abs(draft.width),
              height: Math.abs(draft.height)
            }}
          />
        )}
      </div>
      
      <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
        <p className="text-xs text-red-300 flex items-start gap-2">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>Click on a redaction zone to remove it. Redaction permanently removes content.</span>
        </p>
      </div>
    </div>
  );
}

function clampNormalizedRect(rect: Rect): Rect {
  const x = clamp(rect.x, 0, 1);
  const y = clamp(rect.y, 0, 1);
  const width = clamp(rect.width, 0.01, 1 - x);
  const height = clamp(rect.height, 0.01, 1 - y);
  return { x, y, width, height };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
