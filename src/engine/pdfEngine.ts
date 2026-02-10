import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
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
  const pageIndexes = resolvePageIndexes(source, ranges);
  const outputs: Uint8Array[] = [];

  if (mode === "single-file") {
    const doc = await PDFDocument.create();
    const pages = await doc.copyPages(source, pageIndexes);
    pages.forEach((page) => doc.addPage(page));
    outputs.push(await doc.save());
    return outputs;
  }

  const normalizedRanges = normalizeRanges(ranges, source.getPageCount());
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

export async function rotatePdf(file: File, degreesToRotate: 90 | 180 | 270, ranges?: PageRange[]) {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const pageIndexes = resolvePageIndexes(pdf, ranges);
  const pageSet = new Set(pageIndexes);

  pdf.getPages().forEach((page, index) => {
    if (!pageSet.has(index)) return;
    const current = page.getRotation().angle ?? 0;
    page.setRotation(degrees((current + degreesToRotate) % 360));
  });

  return pdf.save();
}

export type WatermarkOptions = {
  text: string;
  opacity: number;
  angle: number;
  fontSize: number;
  ranges?: PageRange[];
};

export async function watermarkPdf(file: File, options: WatermarkOptions) {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const pageIndexes = resolvePageIndexes(pdf, options.ranges);
  const pageSet = new Set(pageIndexes);
  const text = options.text.trim();
  if (!text) {
    throw new Error("Watermark text is required.");
  }

  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const opacity = Math.min(1, Math.max(0.05, options.opacity));
  const fontSize = Math.min(180, Math.max(10, options.fontSize));
  const angle = Math.min(89, Math.max(-89, options.angle));
  const textColor = rgb(0.35, 0.4, 0.5);

  pdf.getPages().forEach((page, index) => {
    if (!pageSet.has(index)) return;
    const width = page.getWidth();
    const height = page.getHeight();
    const textWidth = font.widthOfTextAtSize(text, fontSize);

    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: height / 2,
      size: fontSize,
      rotate: degrees(angle),
      font,
      color: textColor,
      opacity
    });
  });

  return pdf.save();
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

export function normalizeRanges(ranges: PageRange[], pageCount: number) {
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

export function resolvePageIndexes(source: PDFDocument, ranges?: PageRange[]) {
  if (!ranges?.length) {
    return source.getPageIndices();
  }
  const normalizedRanges = normalizeRanges(ranges, source.getPageCount());
  return normalizedRanges
    .flatMap((range) => source.getPageIndices().filter((index) => index >= range.start && index <= range.end))
    .filter((value, index, all) => all.indexOf(value) === index)
    .sort((a, b) => a - b);
}
