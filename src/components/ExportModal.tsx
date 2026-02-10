"use client";

import React from "react";
import { useEntitlement } from "./EntitlementProvider";
import { canExport, markFreeExportUsed } from "../utils/entitlement";

export type ExportFileInfo = {
  name: string;
  size: number;
  url: string;
};

export type ExportInfo = {
  files: ExportFileInfo[];
  summaryLabel: string;
  inputCount: number;
  durationMs: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  info: ExportInfo | null;
  onDownloadFile: (file: ExportFileInfo) => void;
  onDownloadAll: () => void;
  onPaywall: () => void;
};

export function ExportModal({
  open,
  onClose,
  info,
  onDownloadFile,
  onDownloadAll,
  onPaywall
}: Props) {
  const { license } = useEntitlement();

  if (!open || !info) return null;

  const paymentsEnabled = process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === "true";
  const allowed = !paymentsEnabled || (typeof window !== "undefined" && canExport(license));
  const totalBytes = info.files.reduce((sum, file) => sum + file.size, 0);

  const guarded = (fn: () => void) => {
    if (!allowed) {
      onClose();
      onPaywall();
      return;
    }
    if (!license && paymentsEnabled) {
      markFreeExportUsed();
    }
    fn();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-white/15 bg-slate-950/90 p-6 shadow-2xl shadow-black/50">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">Ready</p>
            <h3 className="text-2xl font-black text-white">Export Completed</h3>
            <p className="mt-1 text-sm text-slate-300">
              {info.summaryLabel} · {info.inputCount} input file(s) · {Math.max(1, Math.round(info.durationMs / 1000))}s
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-white/20 px-2.5 py-1.5 text-sm text-slate-300 transition hover:border-white/40 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="space-y-2">
          {info.files.map((file) => (
            <div key={file.url} className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/[0.03] px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{file.name}</p>
                <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => guarded(() => onDownloadFile(file))}
                className="rounded-xl border border-cyan-300/45 bg-cyan-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-cyan-100 transition hover:bg-cyan-300/20"
              >
                Download
              </button>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-300">Total output size: {formatBytes(totalBytes)}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => guarded(onDownloadAll)}
              className="rounded-xl border border-emerald-300/45 bg-emerald-300/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-emerald-100 transition hover:bg-emerald-300/25"
            >
              Download All
            </button>
            {!allowed && (
              <button
                type="button"
                onClick={() => guarded(() => {})}
                className="rounded-xl border border-amber-300/45 bg-amber-300/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-amber-100 transition hover:bg-amber-300/25"
              >
                Upgrade
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let idx = 0;
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024;
    idx += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[idx]}`;
}
