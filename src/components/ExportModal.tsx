"use client";

import React from "react";
import { useEntitlement } from "./EntitlementProvider";
import { canExport, markFreeExportUsed } from "../utils/entitlement";

export type ExportInfo = {
  name: string;
  size: number;
  url: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  info: ExportInfo | null;
  onDownload: () => void;
  onPaywall: () => void;
};

export function ExportModal({ open, onClose, info, onDownload, onPaywall }: Props) {
  const { license } = useEntitlement();

  if (!open || !info) return null;

  const allowed = typeof window !== "undefined" && canExport(license);

  const handleDownload = () => {
    if (!allowed) {
      onPaywall();
      return;
    }
    if (!license) {
      markFreeExportUsed();
    }
    onDownload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="card w-full max-w-md p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Export Ready</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        <div className="mt-4 space-y-2 text-sm text-slate-300">
          <p>File: {info.name}</p>
          <p>Size: {(info.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <button className="btn-primary" onClick={handleDownload}>
            Download PDF
          </button>
          {!allowed && (
            <p className="text-xs text-slate-400">
              Exporting requires Pro or export credits.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
