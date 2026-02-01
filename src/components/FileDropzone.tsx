"use client";

import React from "react";

type Props = {
  multiple?: boolean;
  onFiles: (files: File[]) => void;
};

export function FileDropzone({ multiple = false, onFiles }: Props) {
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files).filter((file) => file.type === "application/pdf");
    if (files.length) {
      onFiles(files);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length) {
      onFiles(files);
    }
  };

  return (
    <div
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
      className="card flex flex-col items-center justify-center gap-3 border-dashed border-slate-600 p-6 text-center"
    >
      <p className="text-sm text-slate-300">Drag & drop PDF files here</p>
      <label className="btn-secondary cursor-pointer">
        Browse Files
        <input
          type="file"
          accept="application/pdf"
          multiple={multiple}
          className="hidden"
          onChange={handleChange}
        />
      </label>
      <p className="text-xs text-slate-500">Files stay on your device.</p>
    </div>
  );
}
