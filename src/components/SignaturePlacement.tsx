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
    const next = {
      ...placement,
      x: (event.clientX - rect.left) / rect.width - placement.width / 2,
      y: (event.clientY - rect.top) / rect.height - placement.height / 2
    };
    onChange(normalizePlacement(next));
  };

  return (
    <div className="card-hover p-6 animate-slide-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Place Signature</h3>
          <p className="text-xs text-slate-500">Drag to position your signature</p>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl border-2 border-dashed border-emerald-500/30 bg-slate-900/50 backdrop-blur-sm hover:border-emerald-500/50 transition-all"
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
      >
        {image ? (
          <img src={image} alt="Preview" className="w-full select-none bg-white" />
        ) : (
          <div className="flex h-96 flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-400">Select a page to sign</p>
            <p className="text-xs text-slate-600 mt-1">Your signature will appear here</p>
          </div>
        )}
        {signature && image && (
          <div
            className="absolute cursor-move border-2 border-emerald-400 rounded-lg p-1 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow"
            onPointerDown={start}
            style={{
              left: `${placement.x * 100}%`,
              top: `${placement.y * 100}%`,
              width: `${placement.width * 100}%`,
              height: `${placement.height * 100}%`
            }}
          >
            <img src={signature} alt="Signature" className="h-full w-full object-contain" />
            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </div>
          </div>
        )}
      </div>
      
      {signature && image && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Small", width: 0.2, height: 0.08 },
              { label: "Medium", width: 0.28, height: 0.12 },
              { label: "Large", width: 0.38, height: 0.16 }
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => onChange(normalizePlacement({ ...placement, width: preset.width, height: preset.height }))}
                className="rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <p className="text-xs text-emerald-300 flex items-start gap-2">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Click and drag the signature to reposition it on the page.</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function normalizePlacement(rect: Rect) {
  const width = clamp(rect.width, 0.08, 0.7);
  const height = clamp(rect.height, 0.05, 0.35);
  return {
    x: clamp(rect.x, 0, 1 - width),
    y: clamp(rect.y, 0, 1 - height),
    width,
    height
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
