"use client";

import Link from "next/link";
import { TOOL_CATEGORY_LABELS, TOOL_DEFINITIONS, type ToolDefinition } from "../config/tools";
import type { ToolSlug } from "../storage/indexedDb";

type ToolGridProps = {
  tools?: ToolDefinition[];
  favorites?: ToolSlug[];
  onToggleFavorite?: (slug: ToolSlug) => void;
  compact?: boolean;
};

export function ToolGrid({
  tools = TOOL_DEFINITIONS,
  favorites = [],
  onToggleFavorite,
  compact = false
}: ToolGridProps) {
  const favoriteSet = new Set(favorites);

  return (
    <div className={compact ? "grid gap-4 md:grid-cols-2" : "grid gap-5 md:grid-cols-2 xl:grid-cols-3"}>
      {tools.map((tool) => {
        const isFavorite = favoriteSet.has(tool.slug);
        return (
          <Link
            key={tool.slug}
            href={`/app/${tool.slug}`}
            className="group relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.04] p-6 shadow-[0_20px_70px_-45px_rgba(20,35,60,0.9)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-white/30"
          >
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
            <div className="relative z-10 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${tool.borderColor} bg-slate-950/40 text-2xl shadow-inner shadow-black/35`}>
                    {tool.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300/80">
                      {TOOL_CATEGORY_LABELS[tool.category]}
                    </p>
                    <h3 className={`text-xl font-black bg-gradient-to-r ${tool.gradient} bg-clip-text text-transparent`}>
                      {tool.name}
                    </h3>
                  </div>
                </div>
                {onToggleFavorite && (
                  <button
                    type="button"
                    className={`rounded-xl border px-2 py-1 text-xs font-bold uppercase tracking-[0.14em] transition ${
                      isFavorite
                        ? "border-amber-300/60 bg-amber-300/10 text-amber-200"
                        : "border-white/20 bg-white/[0.03] text-slate-300 hover:border-white/45"
                    }`}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onToggleFavorite(tool.slug);
                    }}
                  >
                    {isFavorite ? "Pinned" : "Pin"}
                  </button>
                )}
              </div>
              <p className="min-h-12 text-sm leading-relaxed text-slate-200/85">{tool.shortDescription}</p>
              {!compact && (
                <div className="flex flex-wrap gap-2">
                  {tool.keywords.slice(0, 3).map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full border border-white/15 bg-slate-900/35 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300/90"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-300/75">
                  {tool.outputs.join(" + ")}
                </span>
                <span className="text-sm font-semibold text-cyan-200 transition group-hover:translate-x-1">
                  Open Tool -&gt;
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
