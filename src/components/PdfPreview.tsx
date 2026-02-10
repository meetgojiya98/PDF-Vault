"use client";

import React, { useEffect, useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

// Use CDN for worker in production
if (typeof window !== 'undefined') {
  GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs`;
}

export type PagePreview = {
  index: number;
  width: number;
  height: number;
  dataUrl: string;
  scale: number;
};

type Props = {
  file: File | null;
  onLoad?: (doc: any) => void;
  onPageSelect?: (index: number) => void;
  selectedIndex?: number;
  onPages?: (pages: PagePreview[]) => void;
};

export function PdfPreview({ file, onLoad, onPageSelect, selectedIndex = 0, onPages }: Props) {
  const [pages, setPages] = useState<PagePreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!file) {
        setPages([]);
        setError(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await file.arrayBuffer();
        const doc = await getDocument({ data }).promise;
        onLoad?.(doc);

        const previews: PagePreview[] = [];
        const scale = 0.3; // Increased scale for better quality
        for (let i = 1; i <= doc.numPages; i += 1) {
          if (cancelled) break;
          const page = await doc.getPage(i);
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          await page.render({ canvasContext: ctx, viewport }).promise;
          previews.push({
            index: i - 1,
            width: viewport.width,
            height: viewport.height,
            dataUrl: canvas.toDataURL("image/png"),
            scale
          });
        }

        if (!cancelled) {
          setPages(previews);
          onPages?.(previews);
        }
      } catch (err) {
        console.error("Failed to load PDF:", err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load PDF. Please try another file.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [file, onLoad, onPages]);

  if (!file) {
    return (
      <div className="card-hover flex flex-col h-80 items-center justify-center p-8 text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 to-slate-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative z-10">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-slate-600/50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <svg className="w-12 h-12 text-slate-500 group-hover:text-slate-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-base font-semibold text-slate-400 mb-2">No PDF loaded</p>
          <p className="text-sm text-slate-600">Upload a file to preview pages</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-hover flex flex-col h-80 items-center justify-center p-8 text-center border-red-500/30">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
          <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-base font-semibold text-red-400 mb-2">Failed to Load PDF</p>
        <p className="text-sm text-slate-500 max-w-sm">{error}</p>
        <button 
          onClick={() => {
            setError(null);
            setPages([]);
          }}
          className="mt-4 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-all duration-300"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card-hover flex flex-col h-80 items-center justify-center p-8">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500/30 border-t-cyan-500"></div>
          <div className="absolute inset-0 animate-pulse rounded-full h-16 w-16 border-4 border-cyan-500/10"></div>
        </div>
        <p className="text-base font-semibold text-slate-300 mt-6">Loading PDF...</p>
        <p className="text-sm text-slate-500 mt-2">Generating page previews</p>
        <div className="mt-4 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: `${i * 150}ms` }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card-hover p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <svg className="w-6 h-6 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Page Previews</h3>
            <p className="text-xs text-slate-500">{pages.length} {pages.length === 1 ? 'page' : 'pages'} loaded</p>
          </div>
        </div>
        <div className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
          <p className="text-sm font-semibold text-emerald-400">✓ Ready</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {pages.map((page, idx) => (
          <button
            key={page.index}
            onClick={() => onPageSelect?.(page.index)}
            className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:shadow-2xl ${
              selectedIndex === page.index
                ? "border-cyan-400 shadow-xl shadow-cyan-500/30 scale-105 ring-2 ring-cyan-400/20"
                : "border-slate-700/50 hover:border-cyan-500/50 hover:scale-[1.02]"
            }`}
            style={{ 
              animationDelay: `${idx * 50}ms`,
              animation: 'fadeIn 0.5s ease-out forwards'
            }}
          >
            <div className="relative aspect-[8.5/11] bg-white">
              <img 
                src={page.dataUrl} 
                alt={`Page ${page.index + 1}`} 
                className="w-full h-full object-contain"
              />
            </div>
            <div className={`absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-500 transition-opacity duration-300 ${
              selectedIndex === page.index ? 'opacity-20' : 'opacity-0 group-hover:opacity-10'
            }`}></div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3">
              <p className="text-sm font-bold text-white text-center">
                Page {page.index + 1}
              </p>
            </div>
            {selectedIndex === page.index && (
              <div className="absolute top-3 right-3 animate-scale-in">
                <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
