import { PDFDocument } from "pdf-lib";
import { renderPdfPages } from "./worker/workerClient";
import type { Rect } from "../utils/coords";

export async function mergePdfs(files: File[]) {
  const merged = await PDFDocument.create();
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }
  return merged.save();
}

export type PageRange = { start: number; end: number };

export function parsePageRanges(input: string): PageRange[] {
  const segments = input
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (!segments.length) {
    throw new Error("Enter at least one page range.");
  }

  return segments.map((segment) => {
    const parts = segment.split("-").map((value) => value.trim());
    if (parts.length > 2) {
      throw new Error(`Invalid range "${segment}". Use numbers like 1 or 2-5.`);
    }
    const [startRaw, endRaw] = parts;
    const start = Number.parseInt(startRaw, 10);
    const hasEnd = typeof endRaw === "string" && endRaw.length > 0;
    const end = hasEnd ? Number.parseInt(endRaw, 10) : start;

    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < 1) {
      throw new Error(`Invalid range "${segment}". Use numbers like 1 or 2-5.`);
    }
    if (end < start) {
      throw new Error(`Invalid range "${segment}". End page must be greater than start page.`);
    }

    return { start: start - 1, end: end - 1 };
  });
}

export async function splitPdf(
  file: File,
  ranges: PageRange[],
  mode: "single-file" | "file-per-range" = "single-file"
) {
  const bytes = await file.arrayBuffer();
  const source = await PDFDocument.load(bytes);
  const pageCount = source.getPageCount();
  const normalizedRanges = normalizeRanges(ranges, pageCount);
  const outputs: Uint8Array[] = [];

  if (mode === "single-file") {
    const doc = await PDFDocument.create();
    const pageIndexes = normalizedRanges.flatMap((range) =>
      source.getPageIndices().filter((index) => index >= range.start && index <= range.end)
    );
    const pages = await doc.copyPages(source, pageIndexes);
    pages.forEach((page) => doc.addPage(page));
    outputs.push(await doc.save());
    return outputs;
  }

  for (const range of normalizedRanges) {
    const doc = await PDFDocument.create();
    const pages = await doc.copyPages(
      source,
      source.getPageIndices().filter((index) => index >= range.start && index <= range.end)
    );
    pages.forEach((page) => doc.addPage(page));
    outputs.push(await doc.save());
  }

  return outputs;
}

export async function stampSignature(
  file: File,
  signatureDataUrl: string,
  pageIndex: number,
  placement: Rect
) {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const signatureImage = await pdf.embedPng(signatureDataUrl);
  const page = pdf.getPages()[pageIndex];
  page.drawImage(signatureImage, {
    x: placement.x,
    y: placement.y,
    width: placement.width,
    height: placement.height
  });
  return pdf.save();
}

async function rebuildFromImages(pages: { image: ArrayBuffer; width: number; height: number }[]) {
  const doc = await PDFDocument.create();
  for (const page of pages) {
    const png = await doc.embedPng(page.image);
    const pdfPage = doc.addPage([page.width, page.height]);
    pdfPage.drawImage(png, {
      x: 0,
      y: 0,
      width: page.width,
      height: page.height
    });
  }
  return doc.save();
}

export async function compressPdf(file: File, dpi: number) {
  const data = await file.arrayBuffer();
  const rendered = await renderPdfPages(data, dpi);
  return rebuildFromImages(rendered);
}

export async function redactPdf(
  file: File,
  redactions: Record<number, Rect[]>,
  dpi: number
) {
  const data = await file.arrayBuffer();
  const rendered = await renderPdfPages(data, dpi, redactions);
  return rebuildFromImages(rendered);
}

function normalizeRanges(ranges: PageRange[], pageCount: number) {
  if (!ranges.length) {
    throw new Error("At least one range is required.");
  }

  const output: PageRange[] = [];
  for (const range of ranges) {
    const start = Math.max(0, range.start);
    const end = Math.min(pageCount - 1, range.end);
    if (start > end || start >= pageCount) {
      continue;
    }
    output.push({ start, end });
  }

  if (!output.length) {
    throw new Error("The selected ranges are outside the available pages.");
  }
  return output;
}
