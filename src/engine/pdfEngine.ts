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
  return input
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [start, end] = part.split("-").map((value) => parseInt(value.trim(), 10));
      if (!end) {
        return { start: start - 1, end: start - 1 };
      }
      return { start: start - 1, end: end - 1 };
    });
}

export async function splitPdf(file: File, ranges: PageRange[]) {
  const bytes = await file.arrayBuffer();
  const source = await PDFDocument.load(bytes);
  const outputs: Uint8Array[] = [];

  for (const range of ranges) {
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
