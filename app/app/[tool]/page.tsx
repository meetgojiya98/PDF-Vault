"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "../../../src/components/AppShell";
import { FileDropzone } from "../../../src/components/FileDropzone";
import { PdfPreview, type PagePreview } from "../../../src/components/PdfPreview";
import { SignaturePad } from "../../../src/components/SignaturePad";
import { RedactionCanvas } from "../../../src/components/RedactionCanvas";
import { SignaturePlacement } from "../../../src/components/SignaturePlacement";
import { ExportModal, type ExportInfo } from "../../../src/components/ExportModal";
import { PaywallModal } from "../../../src/components/PaywallModal";
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

const toolCopy: Record<string, { title: string; description: string }> = {
  merge: {
    title: "Merge PDFs",
    description: "Combine multiple PDFs in a custom order."
  },
  split: {
    title: "Split / Extract",
    description: "Extract specific page ranges into new PDFs."
  },
  sign: {
    title: "Sign",
    description: "Stamp a handwritten signature onto a page."
  },
  redact: {
    title: "Safe Redaction",
    description: "Flatten redaction zones to permanently remove content."
  },
  compress: {
    title: "Strong Compression",
    description: "Shrink files by rasterizing pages at lower DPI."
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
        setOutput({ name, size: data.length, url: URL.createObjectURL(new Blob([data])) });
      }
      if (tool === "split" && primaryFile) {
        const parsed = parsePageRanges(ranges);
        const outputs = await splitPdf(primaryFile, parsed);
        const data = outputs[0];
        const name = buildFileName("split");
        setOutput({ name, size: data.length, url: URL.createObjectURL(new Blob([data])) });
      }
      if (tool === "sign" && primaryFile && signature) {
        const page = previewPages.find((item) => item.index === selectedPage);
        if (!page) return;
        const pdfRect = viewToPdfRect(placement, page.width, page.height, page.scale);
        const data = await stampSignature(primaryFile, signature, selectedPage, pdfRect);
        const name = buildFileName("signed");
        setOutput({ name, size: data.length, url: URL.createObjectURL(new Blob([data])) });
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
        setOutput({ name, size: data.length, url: URL.createObjectURL(new Blob([data])) });
      }
      if (tool === "compress" && primaryFile) {
        const data = await compressPdf(primaryFile, dpi);
        const name = buildFileName("compressed");
        setOutput({ name, size: data.length, url: URL.createObjectURL(new Blob([data])) });
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
        <div className="card p-6">Unknown tool.</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="grid gap-6">
        <header>
          <h1 className="text-2xl font-semibold">{copy.title}</h1>
          <p className="mt-2 text-sm text-slate-400">{copy.description}</p>
        </header>
        <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4">
            <FileDropzone multiple={tool === "merge"} onFiles={handleFiles} />

            {tool === "merge" && files.length > 0 && (
              <div className="card p-4">
                <p className="text-sm text-slate-300">Reorder PDFs</p>
                <ul className="mt-3 space-y-2">
                  {files.map((file, index) => (
                    <li key={file.name} className="flex items-center justify-between rounded-lg border border-slate-700 px-3 py-2 text-sm">
                      <span>{file.name}</span>
                      <div className="flex gap-2">
                        <button
                          className="btn-secondary"
                          onClick={() => {
                            if (index === 0) return;
                            const next = [...files];
                            [next[index - 1], next[index]] = [next[index], next[index - 1]];
                            setFiles(next);
                          }}
                        >
                          ↑
                        </button>
                        <button
                          className="btn-secondary"
                          onClick={() => {
                            if (index === files.length - 1) return;
                            const next = [...files];
                            [next[index + 1], next[index]] = [next[index], next[index + 1]];
                            setFiles(next);
                          }}
                        >
                          ↓
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {tool === "split" && (
              <div className="card p-4">
                <label className="text-sm text-slate-300">Page ranges (e.g., 1-2, 5-7)</label>
                <input
                  value={ranges}
                  onChange={(event) => setRanges(event.target.value)}
                  className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm"
                />
              </div>
            )}

            {tool === "sign" && (
              <SignaturePad onSave={handleSignatureSave} />
            )}

            {(tool === "redact" || tool === "compress") && (
              <div className="card p-4">
                <label className="text-sm text-slate-300">Render DPI</label>
                <input
                  type="range"
                  min={96}
                  max={200}
                  value={dpi}
                  onChange={(event) => setDpi(Number(event.target.value))}
                  className="mt-3 w-full"
                />
                <p className="mt-2 text-xs text-slate-400">{dpi} DPI</p>
                {tool === "redact" && (
                  <p className="mt-2 text-xs text-amber-200">
                    Safe redaction flattens text and removes searchability on affected pages.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
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
        <section className="flex justify-end">
          <button
            className="btn-primary"
            onClick={handleProcess}
            disabled={processing || files.length === 0}
          >
            {processing ? "Processing..." : "Process & Export"}
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
    </EntitlementProvider>
  );
}
