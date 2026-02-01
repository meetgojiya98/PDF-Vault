"use client";

import React, { useState } from "react";

type Props = {
  multiple?: boolean;
  onFiles: (files: File[]) => void;
};

export function FileDropzone({ multiple = false, onFiles }: Props) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const files = Array.from(event.dataTransfer.files).filter((file) => file.type === "application/pdf");
    if (files.length) {
      onFiles(files);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length) {
      onFiles(files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`card relative flex flex-col items-center justify-center gap-6 border-2 border-dashed p-12 text-center transition-all duration-300 ${
        isDragging 
          ? 'dropzone-active border-cyan-400 bg-cyan-500/10 scale-105' 
          : 'border-slate-600/50 hover:border-slate-500/70 hover:bg-slate-800/30'
      }`}
    >
      {/* Animated upload icon */}
      <div className={`relative transition-all duration-300 ${isDragging ? 'scale-110' : ''}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-xl opacity-20"></div>
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
          <svg 
            className={`w-10 h-10 text-cyan-400 transition-transform duration-300 ${isDragging ? '-translate-y-1' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
            />
          </svg>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-lg font-semibold text-white">
          {isDragging ? 'Drop your PDFs here' : 'Drag & drop PDF files'}
        </p>
        <p className="text-sm text-slate-400">
          or click below to browse
        </p>
      </div>

      <label className="btn-primary cursor-pointer group relative overflow-hidden">
        <span className="relative z-10 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Browse Files
        </span>
        <input
          type="file"
          accept="application/pdf"
          multiple={multiple}
          className="hidden"
          onChange={handleChange}
        />
      </label>

      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30">
        <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span className="text-xs font-medium text-emerald-400">100% Private - Files stay on your device</span>
      </div>
    </div>
  );
}
