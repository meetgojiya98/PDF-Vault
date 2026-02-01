"use client";

import React, { useEffect, useState } from "react";
import { getDocument, GlobalWorkerOptions, PDFDocumentProxy } from "pdfjs-dist/legacy/build/pdf";

const workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

GlobalWorkerOptions.workerSrc = workerSrc;

export type PagePreview = {
  index: number;
  width: number;
  height: number;
  dataUrl: string;
  scale: number;
};

type Props = {
  file: File | null;
  onLoad?: (doc: PDFDocumentProxy) => void;
  onPageSelect?: (index: number) => void;
  selectedIndex?: number;
  onPages?: (pages: PagePreview[]) => void;
};

export function PdfPreview({ file, onLoad, onPageSelect, selectedIndex = 0 }: Props) {
  const [pages, setPages] = useState<PagePreview[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!file) {
        setPages([]);
        return;
      }
      const data = await file.arrayBuffer();
      const doc = await getDocument({ data }).promise;
      onLoad?.(doc);

      const previews: PagePreview[] = [];
      const scale = 0.25;
      for (let i = 1; i <= doc.numPages; i += 1) {
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
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [file, onLoad]);

  if (!file) {
    return (
      <div className="card flex h-full items-center justify-center p-6 text-sm text-slate-400">
        Import a PDF to preview pages.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-3">
        {pages.map((page) => (
          <button
            key={page.index}
            onClick={() => onPageSelect?.(page.index)}
            className={`overflow-hidden rounded-lg border ${
              selectedIndex === page.index
                ? "border-cyan-300"
                : "border-slate-700"
            }`}
          >
            <img src={page.dataUrl} alt={`Page ${page.index + 1}`} className="w-full" />
          </button>
        ))}
      </div>
    </div>
  );
}
