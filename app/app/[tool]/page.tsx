"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import ReactDOM from 'react-dom';
import { AppShell } from "../../../src/components/AppShell";
import { FileDropzone } from "../../../src/components/FileDropzone";
import { PdfPreview, type PagePreview } from "../../../src/components/PdfPreview";
import { SignaturePad } from "../../../src/components/SignaturePad";
import { RedactionCanvas } from "../../../src/components/RedactionCanvas";
import { SignaturePlacement } from "../../../src/components/SignaturePlacement";
import { ExportModal, type ExportInfo } from "../../../src/components/ExportModal";
import { PaywallModal } from "../../../src/components/PaywallModal";
import { AccountPanel } from "../../../src/components/AccountPanel";
import { EntitlementProvider, useEntitlement } from "../../../src/components/EntitlementProvider";
import {
  compressPdf,
  mergePdfs,
  parsePageRanges,
  redactPdf,
  splitPdf,
  stampSignature
} from "../../../src/engine/pdfEngine";
import { buildFileName } from "../../../src/utils/filename";
import type { Rect } from "../../../src/utils/coords";
import { viewToPdfRect } from "../../../src/utils/coords";
import { loadSignature, saveSignature } from "../../../src/storage/indexedDb";

const toolCopy: Record<string, { title: string; description: string; icon: string; color: string; gradient: string }> = {
  merge: {
    title: "Merge PDFs",
    description: "Combine multiple PDFs in a custom order.",
    icon: "📄",
    color: "from-cyan-500/20 to-blue-500/20",
    gradient: "from-cyan-500 to-blue-500"
  },
  split: {
    title: "Split / Extract",
    description: "Extract specific page ranges into new PDFs.",
    icon: "✂️",
    color: "from-purple-500/20 to-pink-500/20",
    gradient: "from-purple-500 to-pink-500"
  },
  sign: {
    title: "Sign",
    description: "Stamp a handwritten signature onto a page.",
    icon: "✍️",
    color: "from-emerald-500/20 to-teal-500/20",
    gradient: "from-emerald-500 to-teal-500"
  },
  redact: {
    title: "Safe Redaction",
    description: "Flatten redaction zones to permanently remove content.",
    icon: "🔒",
    color: "from-orange-500/20 to-red-500/20",
    gradient: "from-orange-500 to-red-500"
  },
  compress: {
    title: "Strong Compression",
    description: "Shrink files by rasterizing pages at lower DPI.",
    icon: "📦",
    color: "from-blue-500/20 to-indigo-500/20",
    gradient: "from-blue-500 to-indigo-500"
  }
};

function ToolWorkbench() {
  const params = useParams();
  const tool = params?.tool as string;
  const copy = toolCopy[tool];

  const [files, setFiles] = useState<File[]>([]);
  const [previewPages, setPreviewPages] = useState<PagePreview[]>([]);
  const [selectedPage, setSelectedPage] = useState(0);
  const [ranges, setRanges] = useState("1-2");
  const [signature, setSignature] = useState<string | null>(null);
  const [placement, setPlacement] = useState<Rect>({ x: 60, y: 80, width: 160, height: 80 });
  const [redactions, setRedactions] = useState<Record<number, Rect[]>>({});
  const [dpi, setDpi] = useState(150);
  const [output, setOutput] = useState<ExportInfo | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { consumeCredit, license } = useEntitlement();

  const primaryFile = files[0] ?? null;

  const previewImage = useMemo(() => {
    return previewPages.find((page) => page.index === selectedPage)?.dataUrl ?? null;
  }, [previewPages, selectedPage]);

  const handleFiles = (incoming: File[]) => {
    setFiles(incoming);
    setSelectedPage(0);
  };

  const handleSignatureSave = async (dataUrl: string) => {
    setSignature(dataUrl);
    await saveSignature(dataUrl);
  };

  useEffect(() => {
    if (tool !== "sign") return;
    loadSignature().then((stored) => {
      if (stored) setSignature(stored);
    });
  }, [tool]);

  const handleProcess = async () => {
    if (!copy) return;
    setProcessing(true);
    try {
      if (tool === "merge") {
        const data = await mergePdfs(files);
        const name = buildFileName("merged");
        const blob = new Blob([new Uint8Array(data)], { type: 'application/pdf' });
        setOutput({ name, size: data.length, url: URL.createObjectURL(blob) });
      }
      if (tool === "split" && primaryFile) {
        const parsed = parsePageRanges(ranges);
        const outputs = await splitPdf(primaryFile, parsed);
        const data = outputs[0];
        const name = buildFileName("split");
        const blob = new Blob([new Uint8Array(data)], { type: 'application/pdf' });
        setOutput({ name, size: data.length, url: URL.createObjectURL(blob) });
      }
      if (tool === "sign" && primaryFile && signature) {
        const page = previewPages.find((item) => item.index === selectedPage);
        if (!page) return;
        const pdfRect = viewToPdfRect(placement, page.width, page.height, page.scale);
        const data = await stampSignature(primaryFile, signature, selectedPage, pdfRect);
        const name = buildFileName("signed");
        const blob = new Blob([new Uint8Array(data)], { type: 'application/pdf' });
        setOutput({ name, size: data.length, url: URL.createObjectURL(blob) });
      }
      if (tool === "redact" && primaryFile) {
        const converted: Record<number, Rect[]> = {};
        previewPages.forEach((page) => {
          const rects = redactions[page.index] ?? [];
          converted[page.index] = rects.map((rect) =>
            viewToPdfRect(rect, page.width, page.height, page.scale)
          );
        });
        const data = await redactPdf(primaryFile, converted, dpi);
        const name = buildFileName("redacted");
        const blob = new Blob([new Uint8Array(data)], { type: 'application/pdf' });
        setOutput({ name, size: data.length, url: URL.createObjectURL(blob) });
      }
      if (tool === "compress" && primaryFile) {
        const data = await compressPdf(primaryFile, dpi);
        const name = buildFileName("compressed");
        const blob = new Blob([new Uint8Array(data)], { type: 'application/pdf' });
        setOutput({ name, size: data.length, url: URL.createObjectURL(blob) });
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!output) return;
    const link = document.createElement("a");
    link.href = output.url;
    link.download = output.name;
    link.click();
    if (license && !license.proActive) {
      consumeCredit();
    }
  };

  if (!copy) {
    return (
      <AppShell>
        <div className="card p-6 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-white">Tool Not Found</h2>
          <p className="text-slate-400 mt-2">The requested tool doesn't exist.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8 animate-fade-in">
        {/* Header with icon */}
        <header className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${copy.color} border border-white/10 flex items-center justify-center text-4xl animate-scale-in`}>
              {copy.icon}
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r ${copy.gradient} bg-clip-text text-transparent">
                {copy.title}
              </h1>
              <p className="text-slate-400 mt-1">{copy.description}</p>
            </div>
          </div>
          
          {/* Progress indicator */}
          {processing && (
            <div className="absolute -bottom-4 left-0 right-0 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r ${copy.gradient} animate-shimmer"></div>
            </div>
          )}
        </header>

        <section className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          {/* Left Column - Controls */}
          <div className="space-y-5">
            <FileDropzone multiple={tool === "merge"} onFiles={handleFiles} />

            {tool === "merge" && files.length > 0 && (
              <div className="card-hover p-6 animate-slide-in">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white">Reorder PDFs</h3>
                </div>
                <ul className="space-y-2">
                  {files.map((file, index) => (
                    <li key={file.name} className="group flex items-center gap-3 rounded-xl border border-slate-700/50 bg-slate-800/30 px-4 py-3 hover:border-cyan-500/30 hover:bg-slate-800/50 transition-all duration-300">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate group-hover:text-cyan-300 transition-colors">
                          {index + 1}. {file.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-700/50 hover:bg-cyan-500/20 border border-slate-600 hover:border-cyan-500/50 transition-all disabled:opacity-30"
                          onClick={() => {
                            if (index === 0) return;
                            const next = [...files];
                            [next[index - 1], next[index]] = [next[index], next[index - 1]];
                            setFiles(next);
                          }}
                          disabled={index === 0}
                        >
                          <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-700/50 hover:bg-cyan-500/20 border border-slate-600 hover:border-cyan-500/50 transition-all disabled:opacity-30"
                          onClick={() => {
                            if (index === files.length - 1) return;
                            const next = [...files];
                            [next[index + 1], next[index]] = [next[index], next[index + 1]];
                            setFiles(next);
                          }}
                          disabled={index === files.length - 1}
                        >
                          <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tool === "split" && (
              <div className="card-hover p-6 animate-slide-in">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white">Page Ranges</h3>
                </div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Enter ranges (e.g., 1-3, 5, 7-9)
                </label>
                <input
                  value={ranges}
                  onChange={(event) => setRanges(event.target.value)}
                  placeholder="1-2, 5-7"
                  className="w-full rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm px-4 py-3 text-white placeholder-slate-500 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
                <p className="mt-3 text-xs text-slate-500">
                  Separate ranges with commas. Use hyphens for page ranges.
                </p>
              </div>
            )}

            {tool === "sign" && (
              <SignaturePad onSave={handleSignatureSave} />
            )}

            {(tool === "redact" || tool === "compress") && (
              <div className="card-hover p-6 animate-slide-in">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${copy.color} border border-white/10 flex items-center justify-center`}>
                    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white">Quality Settings</h3>
                </div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Render DPI: {dpi}
                </label>
                <input
                  type="range"
                  min={96}
                  max={200}
                  value={dpi}
                  onChange={(event) => setDpi(Number(event.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>Lower (96)</span>
                  <span>Higher (200)</span>
                </div>
                {tool === "redact" && (
                  <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <p className="text-xs text-amber-300 flex items-start gap-2">
                      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>Safe redaction permanently removes searchability on affected pages by flattening them.</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-5">
            <PdfPreview
              file={primaryFile}
              selectedIndex={selectedPage}
              onPageSelect={setSelectedPage}
              onPages={setPreviewPages}
            />

            {tool === "sign" && (
              <SignaturePlacement
                image={previewImage}
                signature={signature}
                placement={placement}
                onChange={setPlacement}
              />
            )}

            {tool === "redact" && (
              <RedactionCanvas
                image={previewImage}
                rects={redactions[selectedPage] ?? []}
                onChange={(rects) => setRedactions({ ...redactions, [selectedPage]: rects })}
              />
            )}
          </div>
        </section>

        {/* Action Button */}
        <section className="flex justify-end">
          <button
            className={`btn-primary px-8 py-4 text-lg font-bold relative overflow-hidden group ${
              processing || files.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleProcess}
            disabled={processing || files.length === 0}
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Process & Export
              </>
            )}
          </button>
        </section>
      </div>

      <ExportModal
        open={Boolean(output)}
        onClose={() => setOutput(null)}
        info={output}
        onDownload={handleDownload}
        onPaywall={() => setPaywallOpen(true)}
      />
      <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </AppShell>
  );
}

export default function ToolPage() {
  return (
    <EntitlementProvider>
      <ToolWorkbench />
      <AccountPanelPortal />
    </EntitlementProvider>
  );
}

// Portal component to render AccountPanel into the navigation slot
function AccountPanelPortal() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  const slot = document.getElementById('account-panel-slot');
  if (!slot) return null;
  
  return ReactDOM.createPortal(<AccountPanel />, slot);
}
