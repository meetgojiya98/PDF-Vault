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

  // Check if payments are enabled
  const paymentsEnabled = process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true';
  const allowed = !paymentsEnabled || (typeof window !== "undefined" && canExport(license));

  const handleDownload = () => {
    if (!allowed) {
      onClose(); // Close export modal
      onPaywall(); // Open paywall modal
      return;
    }
    if (!license && paymentsEnabled) {
      markFreeExportUsed();
    }
    onDownload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div 
        className="card w-full max-w-lg p-8 animate-scale-in relative overflow-hidden"
        style={{ animationDelay: '100ms' }}
      >
        {/* Decorative gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"></div>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white">Export Ready</h3>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* File info */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-400 mb-1">Filename</p>
              <p className="text-white font-semibold truncate">{info.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-400 mb-1">File size</p>
              <p className="text-white font-semibold">{(info.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {allowed ? (
            <button 
              className="w-full btn-primary py-4 text-base font-semibold relative group"
              onClick={handleDownload}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </span>
            </button>
          ) : (
            <>
              <button 
                className="w-full btn-primary py-4 text-base font-semibold relative group"
                onClick={handleDownload}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Upgrade to Download
                </span>
              </button>
              <div className="flex items-center gap-2 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-amber-300 font-medium">
                  You've used your free export. Subscribe to PDF Vault Pro ($0.99/mo) for unlimited exports.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
