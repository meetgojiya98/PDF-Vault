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

export type PageNumberPosition =
  | "bottom-center"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "top-right"
  | "top-left";

export type PageNumberOptions = {
  startAt: number;
  prefix: string;
  suffix: string;
  position: PageNumberPosition;
  fontSize: number;
  opacity: number;
  ranges?: PageRange[];
};

export async function addPageNumbers(file: File, options: PageNumberOptions) {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const pageIndexes = resolvePageIndexes(pdf, options.ranges);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontSize = clamp(options.fontSize, 8, 60);
  const opacity = clamp(options.opacity, 0.08, 1);
  const startAt = Math.max(1, Math.floor(options.startAt || 1));
  const prefix = options.prefix ?? "";
  const suffix = options.suffix ?? "";
  const color = rgb(0.18, 0.21, 0.27);

  pageIndexes.forEach((pageIndex, idx) => {
    const page = pdf.getPage(pageIndex);
    const text = `${prefix}${startAt + idx}${suffix}`;
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = font.heightAtSize(fontSize);
    const margin = Math.max(12, Math.round(fontSize * 0.8));
    const { x, y } = computePosition(
      options.position,
      page.getWidth(),
      page.getHeight(),
      textWidth,
      textHeight,
      margin
    );
    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color,
      opacity
    });
  });

  return pdf.save();
}

export type MetadataOptions = {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
};

export async function updatePdfMetadata(file: File, options: MetadataOptions) {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);

  if (typeof options.title === "string") pdf.setTitle(options.title.trim());
  if (typeof options.author === "string") pdf.setAuthor(options.author.trim());
  if (typeof options.subject === "string") pdf.setSubject(options.subject.trim());
  if (typeof options.creator === "string") pdf.setCreator(options.creator.trim());
  if (typeof options.producer === "string") pdf.setProducer(options.producer.trim());
  if (typeof options.keywords === "string") {
    const words = options.keywords
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean);
    pdf.setKeywords(words);
  }
  pdf.setModificationDate(new Date());

  return pdf.save();
}

export type CropOptions = {
  top: number;
  right: number;
  bottom: number;
  left: number;
  ranges?: PageRange[];
};

export async function cropPdf(file: File, options: CropOptions) {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const pageIndexes = resolvePageIndexes(pdf, options.ranges);

  pageIndexes.forEach((pageIndex) => {
    const page = pdf.getPage(pageIndex);
    const media = page.getMediaBox();
    const baseX = media.x ?? 0;
    const baseY = media.y ?? 0;
    const width = media.width;
    const height = media.height;

    const left = clamp(options.left, 0, width * 0.45);
    const right = clamp(options.right, 0, width * 0.45);
    const top = clamp(options.top, 0, height * 0.45);
    const bottom = clamp(options.bottom, 0, height * 0.45);

    const croppedWidth = Math.max(20, width - left - right);
    const croppedHeight = Math.max(20, height - top - bottom);
    page.setCropBox(baseX + left, baseY + bottom, croppedWidth, croppedHeight);
  });

  return pdf.save();
}

export async function deletePagesPdf(
  file: File,
  options: { mode: "ranges" | "odd" | "even"; ranges?: PageRange[] }
) {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const pageCount = pdf.getPageCount();

  let deleteIndexes: number[] = [];
  if (options.mode === "odd") {
    deleteIndexes = Array.from({ length: pageCount }, (_, index) => index).filter((index) => index % 2 === 0);
  } else if (options.mode === "even") {
    deleteIndexes = Array.from({ length: pageCount }, (_, index) => index).filter((index) => index % 2 === 1);
  } else {
    if (!options.ranges?.length) {
      throw new Error("Provide at least one range to delete.");
    }
    deleteIndexes = resolvePageIndexes(pdf, options.ranges);
  }

  const keepCount = pageCount - deleteIndexes.length;
  if (keepCount < 1) {
    throw new Error("Cannot delete all pages. Keep at least one page.");
  }

  [...deleteIndexes]
    .sort((a, b) => b - a)
    .forEach((index) => pdf.removePage(index));

  return pdf.save();
}

export async function reversePagesPdf(file: File) {
  const bytes = await file.arrayBuffer();
  const source = await PDFDocument.load(bytes);
  const output = await PDFDocument.create();
  const reversedIndexes = source.getPageIndices().reverse();
  const copied = await output.copyPages(source, reversedIndexes);
  copied.forEach((page) => output.addPage(page));
  return output.save();
}

export async function reorderPagesPdf(file: File, orderSpec: string) {
  const bytes = await file.arrayBuffer();
  const source = await PDFDocument.load(bytes);
  const orderedIndexes = parsePageOrder(orderSpec, source.getPageCount());
  const output = await PDFDocument.create();
  const copied = await output.copyPages(source, orderedIndexes);
  copied.forEach((page) => output.addPage(page));
  return output.save();
}

export async function duplicatePagesPdf(file: File, ranges: PageRange[], repeatCount: number) {
  const bytes = await file.arrayBuffer();
  const source = await PDFDocument.load(bytes);
  const repeats = clamp(Math.floor(repeatCount), 1, 10);
  const selected = new Set(resolvePageIndexes(source, ranges));
  const expandedOrder: number[] = [];

  source.getPageIndices().forEach((pageIndex) => {
    expandedOrder.push(pageIndex);
    if (!selected.has(pageIndex)) return;
    for (let count = 0; count < repeats; count += 1) {
      expandedOrder.push(pageIndex);
    }
  });

  const output = await PDFDocument.create();
  const copied = await output.copyPages(source, expandedOrder);
  copied.forEach((page) => output.addPage(page));
  return output.save();
}

export async function interleavePdfs(files: File[]) {
  if (files.length < 2) {
    throw new Error("Select at least two PDFs to interleave.");
  }
  const docs = await Promise.all(files.map(async (file) => PDFDocument.load(await file.arrayBuffer())));
  const output = await PDFDocument.create();
  const maxPages = Math.max(...docs.map((doc) => doc.getPageCount()));

  for (let pageIndex = 0; pageIndex < maxPages; pageIndex += 1) {
    for (const doc of docs) {
      if (pageIndex >= doc.getPageCount()) continue;
      const copied = await output.copyPages(doc, [pageIndex]);
      copied.forEach((page) => output.addPage(page));
    }
  }

  return output.save();
}

export type MarginOptions = {
  top: number;
  right: number;
  bottom: number;
  left: number;
  ranges?: PageRange[];
};

export async function addMarginsPdf(file: File, options: MarginOptions) {
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const pageIndexes = resolvePageIndexes(pdf, options.ranges);

  pageIndexes.forEach((pageIndex) => {
    const page = pdf.getPage(pageIndex);
    const media = page.getMediaBox();
    const width = media.width;
    const height = media.height;
    const left = clamp(options.left, 0, width * 0.5);
    const right = clamp(options.right, 0, width * 0.5);
    const top = clamp(options.top, 0, height * 0.5);
    const bottom = clamp(options.bottom, 0, height * 0.5);
    const newWidth = width + left + right;
    const newHeight = height + top + bottom;

    page.setMediaBox(0, 0, newWidth, newHeight);
    page.setCropBox(0, 0, newWidth, newHeight);

    const unsafePage = page as unknown as {
      translateContent?: (x: number, y: number) => void;
      translateAnnotations?: (x: number, y: number) => void;
    };
    unsafePage.translateContent?.(left, bottom);
    unsafePage.translateAnnotations?.(left, bottom);
  });

  return pdf.save();
}

export async function grayscalePdf(file: File, dpi: number, quality: number) {
  const data = await file.arrayBuffer();
  const rendered = await renderPdfPages(data, dpi, undefined, {
    imageFormat: "jpeg",
    imageQuality: clamp(quality, 0.35, 0.95),
    grayscale: true
  });
  return rebuildFromImages(rendered, "jpeg");
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

async function rebuildFromImages(
  pages: { image: ArrayBuffer; width: number; height: number }[],
  imageFormat: "png" | "jpeg" = "png"
) {
  const doc = await PDFDocument.create();
  for (const page of pages) {
    const image =
      imageFormat === "jpeg" ? await doc.embedJpg(page.image) : await doc.embedPng(page.image);
    const pdfPage = doc.addPage([page.width, page.height]);
    pdfPage.drawImage(image, {
      x: 0,
      y: 0,
      width: page.width,
      height: page.height
    });
  }
  return doc.save({ useObjectStreams: true, addDefaultPage: false });
}

export async function compressPdf(file: File, dpi: number) {
  const input = new Uint8Array(await file.arrayBuffer());
  const candidates: Uint8Array[] = [input];

  try {
    const optimized = await optimizePdfStructure(input);
    candidates.push(optimized);
  } catch (error) {
    console.warn("Structure optimization skipped:", error);
  }

  try {
    const jpegQuality = getJpegQualityForDpi(dpi);
    const rendered = await renderPdfPages(input.buffer.slice(0), dpi, undefined, {
      imageFormat: "jpeg",
      imageQuality: jpegQuality
    });
    const rasterized = await rebuildFromImages(rendered, "jpeg");
    candidates.push(rasterized);
  } catch (error) {
    console.warn("Raster compression skipped:", error);
  }

  return smallestBySize(candidates);
}

export async function redactPdf(
  file: File,
  redactions: Record<number, Rect[]>,
  dpi: number
) {
  const data = await file.arrayBuffer();
  const rendered = await renderPdfPages(data, dpi, redactions, { imageFormat: "png" });
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

export function parsePageOrder(input: string, pageCount: number) {
  const segments = input
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (!segments.length) {
    throw new Error("Enter at least one page in page order.");
  }

  const indexes: number[] = [];
  for (const segment of segments) {
    const parts = segment.split("-").map((part) => part.trim());
    if (parts.length > 2) {
      throw new Error(`Invalid page order segment "${segment}".`);
    }
    const start = Number.parseInt(parts[0], 10);
    if (!Number.isInteger(start) || start < 1 || start > pageCount) {
      throw new Error(`Page "${parts[0]}" is out of range (1-${pageCount}).`);
    }

    if (parts.length === 1 || !parts[1]) {
      indexes.push(start - 1);
      continue;
    }

    const end = Number.parseInt(parts[1], 10);
    if (!Number.isInteger(end) || end < 1 || end > pageCount) {
      throw new Error(`Page "${parts[1]}" is out of range (1-${pageCount}).`);
    }

    if (start <= end) {
      for (let current = start; current <= end; current += 1) {
        indexes.push(current - 1);
      }
    } else {
      for (let current = start; current >= end; current -= 1) {
        indexes.push(current - 1);
      }
    }
  }

  return indexes;
}

function smallestBySize(candidates: Uint8Array[]) {
  return candidates.reduce((best, next) => (next.length < best.length ? next : best));
}

async function optimizePdfStructure(data: Uint8Array) {
  const pdf = await PDFDocument.load(data);
  return pdf.save({ useObjectStreams: true, addDefaultPage: false });
}

function getJpegQualityForDpi(dpi: number) {
  const clamped = Math.min(220, Math.max(96, dpi));
  const ratio = (clamped - 96) / (220 - 96);
  return 0.45 + ratio * 0.35;
}

function computePosition(
  position: PageNumberPosition,
  pageWidth: number,
  pageHeight: number,
  textWidth: number,
  textHeight: number,
  margin: number
) {
  const horizontal = (() => {
    if (position.endsWith("right")) return pageWidth - margin - textWidth;
    if (position.endsWith("left")) return margin;
    return (pageWidth - textWidth) / 2;
  })();

  const vertical = (() => {
    if (position.startsWith("top")) return pageHeight - margin - textHeight;
    return margin;
  })();

  return { x: horizontal, y: vertical };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
