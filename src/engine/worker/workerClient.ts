import type { RenderRequest, RenderResponse } from "./pdfWorker";

let worker: Worker | null = null;

function getWorker() {
  if (worker) return worker;
  worker = new Worker(new URL("./pdfWorker.ts", import.meta.url));
  return worker;
}

export async function renderPdfPages(
  data: ArrayBuffer,
  dpi: number,
  redactions?: Record<number, { x: number; y: number; width: number; height: number }[]>
): Promise<RenderResponse["pages"]> {
  if (typeof OffscreenCanvas === "undefined") {
    return renderInMainThread(data, dpi, redactions);
  }

  const instance = getWorker();
  const request: RenderRequest = { type: "render", data, dpi, redactions };

  return new Promise((resolve) => {
    const handle = (event: MessageEvent<RenderResponse>) => {
      if (event.data.type === "rendered") {
        instance.removeEventListener("message", handle);
        resolve(event.data.pages);
      }
    };
    instance.addEventListener("message", handle);
    instance.postMessage(request, [data]);
  });
}

async function renderInMainThread(
  data: ArrayBuffer,
  dpi: number,
  redactions?: Record<number, { x: number; y: number; width: number; height: number }[]>
) {
  const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist/legacy/build/pdf");
  GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const doc = await getDocument({ data }).promise;
  const pages: RenderResponse["pages"] = [];

  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: dpi / 72 });
    const unscaled = page.getViewport({ scale: 1 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;
    await page.render({ canvasContext: ctx, viewport }).promise;

    const rects = redactions?.[i - 1] ?? [];
    if (rects.length) {
      ctx.fillStyle = "#000000";
      rects.forEach((rect) => {
        const scale = dpi / 72;
        const x = rect.x * scale;
        const y = (unscaled.height - rect.y - rect.height) * scale;
        const width = rect.width * scale;
        const height = rect.height * scale;
        ctx.fillRect(x, y, width, height);
      });
    }

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((result) => resolve(result), "image/png")
    );
    if (!blob) continue;
    const buffer = await blob.arrayBuffer();
    pages.push({ index: i - 1, width: viewport.width, height: viewport.height, image: buffer });
  }

  return pages;
}
