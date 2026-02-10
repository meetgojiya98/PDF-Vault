"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import ReactDOM from "react-dom";
import { AppShell } from "../../../src/components/AppShell";
import { FileDropzone } from "../../../src/components/FileDropzone";
import { PdfPreview, type PagePreview } from "../../../src/components/PdfPreview";
import { SignaturePad } from "../../../src/components/SignaturePad";
import { RedactionCanvas } from "../../../src/components/RedactionCanvas";
import { SignaturePlacement } from "../../../src/components/SignaturePlacement";
import { ExportModal, type ExportFileInfo, type ExportInfo } from "../../../src/components/ExportModal";
import { PaywallModal } from "../../../src/components/PaywallModal";
import { AccountPanel } from "../../../src/components/AccountPanel";
import { EntitlementProvider, useEntitlement } from "../../../src/components/EntitlementProvider";
import { TOOL_BY_SLUG, WORKFLOW_TEMPLATES } from "../../../src/config/tools";
import type { Rect } from "../../../src/utils/coords";
import { viewToPdfRect } from "../../../src/utils/coords";
import {
  addRunHistory,
  loadWorkspacePreference,
  saveWorkspacePreference,
  touchRecentFiles,
  type ToolSlug
} from "../../../src/storage/indexedDb";
import { parsePageRanges, mergePdfs, splitPdf, stampSignature, redactPdf, compressPdf } from "../../../src/engine/pdfEngine";
import { loadSignature, saveSignature } from "../../../src/storage/indexedDb";

type SplitMode = "single-file" | "file-per-range";

function ToolWorkbench() {
  const params = useParams();
  const searchParams = useSearchParams();
  const tool = params?.tool as ToolSlug;
  const definition = TOOL_BY_SLUG[tool];
  const workflowId = searchParams.get("workflow");
  const workflow = WORKFLOW_TEMPLATES.find((item) => item.id === workflowId);

  const [files, setFiles] = useState<File[]>([]);
  const [previewPages, setPreviewPages] = useState<PagePreview[]>([]);
  const [selectedPage, setSelectedPage] = useState(0);
  const [ranges, setRanges] = useState("1-3");
  const [signature, setSignature] = useState<string | null>(null);
  const [placement, setPlacement] = useState<Rect>({ x: 70, y: 90, width: 170, height: 80 });
  const [redactions, setRedactions] = useState<Record<number, Rect[]>>({});
  const [dpi, setDpi] = useState(150);
  const [splitMode, setSplitMode] = useState<SplitMode>("single-file");
  const [outputPrefix, setOutputPrefix] = useState("pdf-vault");
  const [output, setOutput] = useState<ExportInfo | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [creditConsumedForExport, setCreditConsumedForExport] = useState(false);
  const { consumeCredit, license } = useEntitlement();
  const outputRef = useRef<ExportInfo | null>(null);

  const clearOutput = () => {
    const existing = outputRef.current;
    if (existing?.files.length) {
      existing.files.forEach((file) => URL.revokeObjectURL(file.url));
    }
    outputRef.current = null;
    setOutput(null);
  };

  const primaryFile = files[0] ?? null;
  const previewImage = useMemo(
    () => previewPages.find((page) => page.index === selectedPage)?.dataUrl ?? null,
    [previewPages, selectedPage]
  );

  useEffect(() => {
    loadWorkspacePreference().then((prefs) => {
      setDpi(prefs.defaultDpi);
      setSplitMode(prefs.splitMode);
      setOutputPrefix(prefs.outputPrefix);
    });
  }, []);

  useEffect(() => {
    if (tool !== "sign") return;
    loadSignature().then((stored) => {
      if (stored) setSignature(stored);
    });
  }, [tool]);

  useEffect(() => {
    const openPaywall = () => setPaywallOpen(true);
    window.addEventListener("openPaywall", openPaywall);
    return () => window.removeEventListener("openPaywall", openPaywall);
  }, []);

  useEffect(() => {
    outputRef.current = output;
  }, [output]);

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "enter") {
        event.preventDefault();
        if (!processing) {
          void handleProcess();
        }
      }
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  });

  useEffect(() => {
    return () => {
      const existing = outputRef.current;
      if (existing?.files.length) {
        existing.files.forEach((file) => URL.revokeObjectURL(file.url));
      }
    };
  }, []);

  const handleFiles = (incoming: File[]) => {
    setFiles(incoming);
    setSelectedPage(0);
    setRedactions({});
    clearOutput();
    setError(null);
    void touchRecentFiles(incoming);
  };

  const handleSignatureSave = async (dataUrl: string) => {
    setSignature(dataUrl);
    await saveSignature(dataUrl);
  };

  const moveFile = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= files.length) return;
    const next = [...files];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setFiles(next);
  };

  const handleProcess = async () => {
    if (!definition || processing) return;
    setError(null);
    setProcessing(true);
    const start = performance.now();
    try {
      const built = await buildOutputs();
      if (!built.length) {
        throw new Error("No output generated. Please check your inputs.");
      }

      const durationMs = Math.round(performance.now() - start);
      const outputInfo: ExportInfo = {
        files: built,
        summaryLabel: definition.name,
        inputCount: files.length,
        durationMs
      };
      setOutput((previous) => {
        if (previous?.files.length) {
          previous.files.forEach((file) => URL.revokeObjectURL(file.url));
        }
        return outputInfo;
      });
      setCreditConsumedForExport(false);

      const inputBytes = files.reduce((sum, file) => sum + file.size, 0);
      const outputBytes = built.reduce((sum, file) => sum + file.size, 0);
      await addRunHistory({
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
        tool,
        inputNames: files.map((file) => file.name),
        outputNames: built.map((file) => file.name),
        inputBytes,
        outputBytes,
        createdAt: Date.now(),
        durationMs
      });
    } catch (issue) {
      const message = issue instanceof Error ? issue.message : "Failed to process the file.";
      setError(message);
    } finally {
      setProcessing(false);
    }
  };

  const buildOutputs = async (): Promise<ExportFileInfo[]> => {
    if (!files.length) {
      throw new Error("Add at least one PDF file to continue.");
    }

    if (tool === "merge") {
      if (files.length < 2) {
        throw new Error("Merge needs at least two files.");
      }
      const data = await mergePdfs(files);
      return [toOutputFile(data, buildName("merged"))];
    }

    if (tool === "split") {
      if (!primaryFile) throw new Error("Upload a PDF to split.");
      const parsed = parsePageRanges(ranges);
      const outputs = await splitPdf(primaryFile, parsed, splitMode);
      return outputs.map((data, index) =>
        toOutputFile(data, splitMode === "file-per-range" ? buildName(`split-part-${index + 1}`) : buildName("split"))
      );
    }

    if (tool === "sign") {
      if (!primaryFile) throw new Error("Upload a PDF to sign.");
      if (!signature) throw new Error("Draw and save a signature first.");
      const page = previewPages.find((item) => item.index === selectedPage);
      if (!page) throw new Error("Select a page before stamping signature.");
      const pdfRect = viewToPdfRect(placement, page.width, page.height, page.scale);
      const data = await stampSignature(primaryFile, signature, selectedPage, pdfRect);
      return [toOutputFile(data, buildName("signed"))];
    }

    if (tool === "redact") {
      if (!primaryFile) throw new Error("Upload a PDF to redact.");
      const redactionCount = Object.values(redactions).reduce((sum, rects) => sum + rects.length, 0);
      if (!redactionCount) {
        throw new Error("Add at least one redaction zone.");
      }
      const converted: Record<number, Rect[]> = {};
      previewPages.forEach((page) => {
        const rects = redactions[page.index] ?? [];
        converted[page.index] = rects.map((rect) => viewToPdfRect(rect, page.width, page.height, page.scale));
      });
      const data = await redactPdf(primaryFile, converted, dpi);
      return [toOutputFile(data, buildName("redacted"))];
    }

    if (tool === "compress") {
      if (!primaryFile) throw new Error("Upload a PDF to compress.");
      const data = await compressPdf(primaryFile, dpi);
      return [toOutputFile(data, buildName("compressed"))];
    }

    throw new Error("Unsupported tool");
  };

  const buildName = (suffix: string) => {
    const normalizedPrefix = outputPrefix.trim() || "pdf-vault";
    return `${normalizedPrefix}-${suffix}-${new Date().toISOString().slice(0, 10)}.pdf`;
  };

  const toOutputFile = (data: Uint8Array, name: string): ExportFileInfo => {
    const stableBytes = new Uint8Array(data.length);
    stableBytes.set(data);
    const blob = new Blob([stableBytes], { type: "application/pdf" });
    return {
      name,
      size: data.length,
      url: URL.createObjectURL(blob)
    };
  };

  const trackCredit = () => {
    if (creditConsumedForExport) return;
    if (license && !license.proActive) {
      consumeCredit();
    }
    setCreditConsumedForExport(true);
  };

  const downloadFile = (file: ExportFileInfo) => {
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name;
    link.click();
    trackCredit();
  };

  const downloadAll = () => {
    if (!output?.files.length) return;
    output.files.forEach((file, index) => {
      window.setTimeout(() => downloadFile(file), index * 160);
    });
  };

  const updatePreference = async (next: { defaultDpi?: number; splitMode?: SplitMode; outputPrefix?: string }) => {
    await saveWorkspacePreference(next);
  };

  if (!definition) {
    return (
      <AppShell>
        <div className="rounded-3xl border border-white/15 bg-white/[0.03] p-10 text-center">
          <h1 className="text-2xl font-black text-white">Tool not found</h1>
          <p className="mt-2 text-slate-300">Return to the workspace and choose a valid tool.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell showAccount>
      <div className="space-y-6">
        <header className="rounded-3xl border border-white/20 bg-white/[0.05] p-6 backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">{definition.category}</p>
              <h1 className={`text-4xl font-black bg-gradient-to-r ${definition.gradient} bg-clip-text text-transparent`}>
                {definition.icon} {definition.name}
              </h1>
              <p className="max-w-3xl text-sm text-slate-200/85">{definition.longDescription}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-slate-950/40 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Shortcut</p>
              <p className="text-sm font-bold text-cyan-100">Ctrl/Cmd + Enter to process</p>
            </div>
          </div>
          {workflow && (
            <div className="mt-4 rounded-2xl border border-cyan-300/35 bg-cyan-300/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cyan-100">Workflow: {workflow.name}</p>
              <p className="mt-1 text-sm text-cyan-50/90">{workflow.description}</p>
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-2xl border border-red-300/45 bg-red-400/10 p-3 text-sm text-red-100">{error}</div>
          )}
        </header>

        <section className="grid gap-5 xl:grid-cols-[1fr_1.35fr]">
          <div className="space-y-5">
            <FileDropzone multiple={tool === "merge"} onFiles={handleFiles} />

            <section className="rounded-3xl border border-white/15 bg-white/[0.03] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Processing Options</h2>
                <span className="text-xs uppercase tracking-[0.12em] text-slate-400">{files.length} file(s)</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Output Prefix
                  </label>
                  <input
                    value={outputPrefix}
                    onChange={(event) => {
                      const value = event.target.value;
                      setOutputPrefix(value);
                      void updatePreference({ outputPrefix: value });
                    }}
                    className="w-full rounded-xl border border-white/20 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/60"
                  />
                </div>

                {(tool === "compress" || tool === "redact") && (
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                      <span>Render DPI</span>
                      <span>{dpi}</span>
                    </div>
                    <input
                      type="range"
                      min={96}
                      max={220}
                      value={dpi}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        setDpi(value);
                        void updatePreference({ defaultDpi: value });
                      }}
                      className="w-full"
                    />
                    <p className="mt-1 text-xs text-slate-400">
                      Lower DPI shrinks size more. Higher DPI keeps detail.
                    </p>
                  </div>
                )}

                {tool === "split" && (
                  <>
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                        Page Ranges
                      </label>
                      <input
                        value={ranges}
                        onChange={(event) => setRanges(event.target.value)}
                        className="w-full rounded-xl border border-white/20 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/60"
                        placeholder="1-3,5,8-10"
                      />
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                        Split Output Mode
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSplitMode("single-file");
                            void updatePreference({ splitMode: "single-file" });
                          }}
                          className={`rounded-xl border px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] ${
                            splitMode === "single-file"
                              ? "border-cyan-300/60 bg-cyan-300/15 text-cyan-100"
                              : "border-white/20 bg-white/[0.02] text-slate-300"
                          }`}
                        >
                          One output
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSplitMode("file-per-range");
                            void updatePreference({ splitMode: "file-per-range" });
                          }}
                          className={`rounded-xl border px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] ${
                            splitMode === "file-per-range"
                              ? "border-cyan-300/60 bg-cyan-300/15 text-cyan-100"
                              : "border-white/20 bg-white/[0.02] text-slate-300"
                          }`}
                        >
                          Per range
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>

            {tool === "merge" && files.length > 0 && (
              <section className="rounded-3xl border border-white/15 bg-white/[0.03] p-5">
                <h2 className="mb-3 text-lg font-bold text-white">File Order</h2>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/35 px-3 py-2">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {index + 1}. {file.name}
                        </p>
                        <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => moveFile(index, -1)}
                          disabled={index === 0}
                          className="rounded-lg border border-white/20 px-2 py-1 text-xs text-slate-200 disabled:opacity-40"
                        >
                          Up
                        </button>
                        <button
                          type="button"
                          onClick={() => moveFile(index, 1)}
                          disabled={index === files.length - 1}
                          className="rounded-lg border border-white/20 px-2 py-1 text-xs text-slate-200 disabled:opacity-40"
                        >
                          Down
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {tool === "sign" && <SignaturePad onSave={handleSignatureSave} />}
          </div>

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
                onChange={(rects) => setRedactions((prev) => ({ ...prev, [selectedPage]: rects }))}
              />
            )}
          </div>
        </section>

        <section className="flex justify-end">
          <button
            type="button"
            onClick={() => void handleProcess()}
            disabled={processing || files.length === 0}
            className="rounded-2xl border border-cyan-300/45 bg-gradient-to-r from-cyan-500/80 to-blue-500/80 px-7 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-lg shadow-cyan-900/35 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing ? "Processing..." : "Process & Export"}
          </button>
        </section>
      </div>

      <ExportModal
        open={Boolean(output)}
        onClose={clearOutput}
        info={output}
        onDownloadFile={downloadFile}
        onDownloadAll={downloadAll}
        onPaywall={() => setPaywallOpen(true)}
      />
      <PaywallModal open={paywallOpen} onClose={() => setPaywallOpen(false)} />
    </AppShell>
  );
}

function AccountPanelPortal() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  const slot = document.getElementById("account-panel-slot");
  if (!slot) return null;
  return ReactDOM.createPortal(<AccountPanel />, slot);
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unit]}`;
}

export default function ToolPage() {
  return (
    <EntitlementProvider>
      <ToolWorkbench />
      <AccountPanelPortal />
    </EntitlementProvider>
  );
}
