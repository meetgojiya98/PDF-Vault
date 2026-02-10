"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
  compressPdf,
  mergePdfs,
  parsePageRanges,
  redactPdf,
  rotatePdf,
  splitPdf,
  stampSignature,
  watermarkPdf,
  type PageRange
} from "../../../src/engine/pdfEngine";
import { loadSignature, saveSignature } from "../../../src/storage/indexedDb";

type SplitMode = "single-file" | "file-per-range";
type WatermarkScope = "all" | "first" | "last" | "range";

const DEFAULT_SIGNATURE_PLACEMENT: Rect = {
  x: 0.12,
  y: 0.16,
  width: 0.28,
  height: 0.12
};

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
  const [splitMode, setSplitMode] = useState<SplitMode>("single-file");
  const [rotateDegrees, setRotateDegrees] = useState<90 | 180 | 270>(90);
  const [rotateRanges, setRotateRanges] = useState("");

  const [signature, setSignature] = useState<string | null>(null);
  const [placement, setPlacement] = useState<Rect>(DEFAULT_SIGNATURE_PLACEMENT);
  const [redactions, setRedactions] = useState<Record<number, Rect[]>>({});
  const [dpi, setDpi] = useState(150);

  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.16);
  const [watermarkAngle, setWatermarkAngle] = useState(-35);
  const [watermarkSize, setWatermarkSize] = useState(52);
  const [watermarkScope, setWatermarkScope] = useState<WatermarkScope>("all");
  const [watermarkRange, setWatermarkRange] = useState("");

  const [outputPrefix, setOutputPrefix] = useState("pdf-vault");
  const [output, setOutput] = useState<ExportInfo | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const { consumeCredit, license } = useEntitlement();
  const outputRef = useRef<ExportInfo | null>(null);
  const creditConsumedRef = useRef(false);

  const primaryFile = files[0] ?? null;
  const previewImage = useMemo(
    () => previewPages.find((page) => page.index === selectedPage)?.dataUrl ?? null,
    [previewPages, selectedPage]
  );

  const clearOutput = useCallback(() => {
    const existing = outputRef.current;
    if (existing?.files.length) {
      existing.files.forEach((file) => URL.revokeObjectURL(file.url));
    }
    outputRef.current = null;
    setOutput(null);
  }, []);

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
    outputRef.current = output;
  }, [output]);

  useEffect(() => {
    const openPaywall = () => setPaywallOpen(true);
    window.addEventListener("openPaywall", openPaywall);
    return () => window.removeEventListener("openPaywall", openPaywall);
  }, []);

  useEffect(() => {
    return () => {
      const existing = outputRef.current;
      if (existing?.files.length) {
        existing.files.forEach((file) => URL.revokeObjectURL(file.url));
      }
    };
  }, []);

  const updatePreference = useCallback(
    async (next: { defaultDpi?: number; splitMode?: SplitMode; outputPrefix?: string }) => {
      await saveWorkspacePreference(next);
    },
    []
  );

  const handleFiles = (incoming: File[]) => {
    setFiles(incoming);
    setSelectedPage(0);
    setPlacement(DEFAULT_SIGNATURE_PLACEMENT);
    setRedactions({});
    clearOutput();
    setError(null);
    void touchRecentFiles(incoming);
  };

  const moveFile = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= files.length) return;
    const next = [...files];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setFiles(next);
  };

  const handleSignatureSave = async (dataUrl: string) => {
    setSignature(dataUrl);
    await saveSignature(dataUrl);
  };

  const buildName = useCallback(
    (suffix: string) => {
      const normalizedPrefix = outputPrefix.trim() || "pdf-vault";
      return `${normalizedPrefix}-${suffix}-${new Date().toISOString().slice(0, 10)}.pdf`;
    },
    [outputPrefix]
  );

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

  const normalizedToViewRect = (rect: Rect, page: PagePreview): Rect => ({
    x: rect.x * page.width,
    y: rect.y * page.height,
    width: rect.width * page.width,
    height: rect.height * page.height
  });

  const getWatermarkRanges = (): PageRange[] | undefined => {
    if (watermarkScope === "all") return undefined;
    if (watermarkScope === "range") {
      if (!watermarkRange.trim()) {
        throw new Error("Enter page ranges for watermark scope.");
      }
      return parsePageRanges(watermarkRange);
    }
    if (!previewPages.length) {
      throw new Error("Wait for page previews to load before using first/last page scope.");
    }
    if (watermarkScope === "first") {
      return [{ start: 0, end: 0 }];
    }
    return [{ start: previewPages.length - 1, end: previewPages.length - 1 }];
  };

  const buildOutputs = useCallback(async (): Promise<ExportFileInfo[]> => {
    if (!files.length) {
      throw new Error("Add at least one PDF file to continue.");
    }

    if (tool === "merge") {
      if (files.length < 2) {
        throw new Error("Merge requires at least two PDFs.");
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

    if (tool === "rotate") {
      if (!primaryFile) throw new Error("Upload a PDF to rotate.");
      const rotateParsed = rotateRanges.trim() ? parsePageRanges(rotateRanges) : undefined;
      const data = await rotatePdf(primaryFile, rotateDegrees, rotateParsed);
      return [toOutputFile(data, buildName("rotated"))];
    }

    if (tool === "sign") {
      if (!primaryFile) throw new Error("Upload a PDF to sign.");
      if (!signature) throw new Error("Draw and save a signature first.");
      const page = previewPages.find((item) => item.index === selectedPage);
      if (!page) throw new Error("Select a page to place signature.");
      const viewRect = normalizedToViewRect(placement, page);
      const pdfRect = viewToPdfRect(viewRect, page.width, page.height, page.scale);
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
        const pageRects = redactions[page.index] ?? [];
        converted[page.index] = pageRects.map((rect) =>
          viewToPdfRect(normalizedToViewRect(rect, page), page.width, page.height, page.scale)
        );
      });
      const data = await redactPdf(primaryFile, converted, dpi);
      return [toOutputFile(data, buildName("redacted"))];
    }

    if (tool === "compress") {
      if (!primaryFile) throw new Error("Upload a PDF to compress.");
      const data = await compressPdf(primaryFile, dpi);
      return [toOutputFile(data, buildName("compressed"))];
    }

    if (tool === "watermark") {
      if (!primaryFile) throw new Error("Upload a PDF to watermark.");
      if (!watermarkText.trim()) throw new Error("Watermark text cannot be empty.");
      const data = await watermarkPdf(primaryFile, {
        text: watermarkText,
        opacity: watermarkOpacity,
        angle: watermarkAngle,
        fontSize: watermarkSize,
        ranges: getWatermarkRanges()
      });
      return [toOutputFile(data, buildName("watermarked"))];
    }

    throw new Error("Unsupported tool");
  }, [
    buildName,
    files,
    placement,
    previewPages,
    primaryFile,
    ranges,
    rotateDegrees,
    rotateRanges,
    selectedPage,
    signature,
    splitMode,
    tool,
    redactions,
    dpi,
    watermarkText,
    watermarkOpacity,
    watermarkAngle,
    watermarkSize,
    watermarkScope,
    watermarkRange
  ]);

  const handleProcess = useCallback(async () => {
    if (!definition || processing) return;
    setError(null);
    setProcessing(true);
    const start = performance.now();

    try {
      const built = await buildOutputs();
      if (!built.length) throw new Error("No output generated.");

      clearOutput();
      const durationMs = Math.round(performance.now() - start);
      const outputInfo: ExportInfo = {
        files: built,
        summaryLabel: definition.name,
        inputCount: files.length,
        durationMs
      };
      outputRef.current = outputInfo;
      setOutput(outputInfo);
      creditConsumedRef.current = false;

      await addRunHistory({
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
        tool,
        inputNames: files.map((file) => file.name),
        outputNames: built.map((file) => file.name),
        inputBytes: files.reduce((sum, file) => sum + file.size, 0),
        outputBytes: built.reduce((sum, file) => sum + file.size, 0),
        createdAt: Date.now(),
        durationMs
      });
    } catch (issue) {
      const message = issue instanceof Error ? issue.message : "Failed to process the file.";
      setError(message);
    } finally {
      setProcessing(false);
    }
  }, [buildOutputs, clearOutput, definition, files, processing, tool]);

  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "enter") {
        event.preventDefault();
        void handleProcess();
      }
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, [handleProcess]);

  const trackCredit = () => {
    if (creditConsumedRef.current) return;
    if (license && !license.proActive) {
      consumeCredit();
    }
    creditConsumedRef.current = true;
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

  if (!definition) {
    return (
      <AppShell>
        <div className="rounded-3xl border border-white/15 bg-white/[0.03] p-10 text-center">
          <h1 className="text-2xl font-black text-white">Tool not found</h1>
          <p className="mt-2 text-slate-300">Return to the workspace and select a supported tool.</p>
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
            <div className="mt-4 rounded-2xl border border-red-300/45 bg-red-400/10 p-3 text-sm text-red-100">
              {error}
            </div>
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
                    placeholder="pdf-vault"
                  />
                </div>

                {tool === "split" && (
                  <>
                    <OptionInput
                      label="Page Ranges"
                      value={ranges}
                      onChange={setRanges}
                      placeholder="1-3,5,8-10"
                      hint="Comma-separated pages/ranges."
                    />
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Split Mode</p>
                      <div className="grid grid-cols-2 gap-2">
                        <ToggleChip
                          active={splitMode === "single-file"}
                          onClick={() => {
                            setSplitMode("single-file");
                            void updatePreference({ splitMode: "single-file" });
                          }}
                          label="One output"
                        />
                        <ToggleChip
                          active={splitMode === "file-per-range"}
                          onClick={() => {
                            setSplitMode("file-per-range");
                            void updatePreference({ splitMode: "file-per-range" });
                          }}
                          label="Per range"
                        />
                      </div>
                    </div>
                  </>
                )}

                {tool === "rotate" && (
                  <>
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Rotate Degrees</p>
                      <div className="grid grid-cols-3 gap-2">
                        {[90, 180, 270].map((value) => (
                          <ToggleChip
                            key={value}
                            active={rotateDegrees === value}
                            onClick={() => setRotateDegrees(value as 90 | 180 | 270)}
                            label={`${value}°`}
                          />
                        ))}
                      </div>
                    </div>
                    <OptionInput
                      label="Rotate only ranges (optional)"
                      value={rotateRanges}
                      onChange={setRotateRanges}
                      placeholder="Leave empty for all pages"
                      hint="Example: 2-4, 8"
                    />
                  </>
                )}

                {(tool === "redact" || tool === "compress") && (
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
                      Lower values reduce size more; higher values preserve more detail.
                    </p>
                  </div>
                )}

                {tool === "watermark" && (
                  <>
                    <OptionInput
                      label="Watermark Text"
                      value={watermarkText}
                      onChange={setWatermarkText}
                      placeholder="CONFIDENTIAL"
                    />
                    <div className="grid gap-3 sm:grid-cols-3">
                      <RangeControl
                        label={`Opacity ${(watermarkOpacity * 100).toFixed(0)}%`}
                        min={8}
                        max={75}
                        value={Math.round(watermarkOpacity * 100)}
                        onChange={(value) => setWatermarkOpacity(value / 100)}
                      />
                      <RangeControl
                        label={`Angle ${watermarkAngle}°`}
                        min={-80}
                        max={80}
                        value={watermarkAngle}
                        onChange={setWatermarkAngle}
                      />
                      <RangeControl
                        label={`Size ${watermarkSize}`}
                        min={18}
                        max={120}
                        value={watermarkSize}
                        onChange={setWatermarkSize}
                      />
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Scope</p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {(["all", "first", "last", "range"] as WatermarkScope[]).map((scope) => (
                          <ToggleChip
                            key={scope}
                            active={watermarkScope === scope}
                            onClick={() => setWatermarkScope(scope)}
                            label={scope}
                          />
                        ))}
                      </div>
                    </div>
                    {watermarkScope === "range" && (
                      <OptionInput
                        label="Watermark Ranges"
                        value={watermarkRange}
                        onChange={setWatermarkRange}
                        placeholder="1,3-5"
                      />
                    )}
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

        <section className="flex justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setFiles([]);
              setPreviewPages([]);
              setSelectedPage(0);
              setRedactions({});
              setPlacement(DEFAULT_SIGNATURE_PLACEMENT);
              clearOutput();
              setError(null);
            }}
            className="rounded-2xl border border-white/20 bg-white/[0.04] px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-200 transition hover:border-white/35"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => void handleProcess()}
            disabled={processing || files.length === 0}
            className="rounded-2xl border border-cyan-300/45 bg-gradient-to-r from-cyan-500/80 to-blue-500/80 px-7 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-lg shadow-cyan-900/35 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
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

function ToggleChip({
  active,
  onClick,
  label
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] ${
        active
          ? "border-cyan-300/60 bg-cyan-300/15 text-cyan-100"
          : "border-white/20 bg-white/[0.02] text-slate-300 hover:border-white/35"
      }`}
    >
      {label}
    </button>
  );
}

function OptionInput({
  label,
  value,
  onChange,
  placeholder,
  hint
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-white/20 bg-slate-900/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/60"
        placeholder={placeholder}
      />
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function RangeControl({
  label,
  min,
  max,
  value,
  onChange
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full"
      />
    </div>
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
