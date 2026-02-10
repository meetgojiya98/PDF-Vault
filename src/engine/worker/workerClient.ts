import type { RenderImageFormat, RenderRequest, RenderResponse } from "./pdfWorker";

let worker: Worker | null = null;
type RenderedPages = Extract<RenderResponse, { type: "rendered" }>["pages"];

function getWorker() {
  if (worker) return worker;
  worker = new Worker(new URL("./pdfWorker.ts", import.meta.url), { type: "module" });
  return worker;
}

function resetWorker() {
  if (worker) {
    worker.terminate();
    worker = null;
  }
}

export async function renderPdfPages(
  data: ArrayBuffer,
  dpi: number,
  redactions?: Record<number, { x: number; y: number; width: number; height: number }[]>,
  options?: {
    imageFormat?: RenderImageFormat;
    imageQuality?: number;
  }
): Promise<RenderedPages> {
  const canUseWorker = typeof Worker !== "undefined" && typeof OffscreenCanvas !== "undefined";
  if (canUseWorker) {
    try {
      return await renderInWorker(data.slice(0), dpi, redactions, options);
    } catch (error) {
      console.warn("Worker rendering failed, falling back to main thread:", error);
      resetWorker();
    }
  }

  return renderInMainThread(data, dpi, redactions, options);
}

async function renderInWorker(
  data: ArrayBuffer,
  dpi: number,
  redactions?: Record<number, { x: number; y: number; width: number; height: number }[]>,
  options?: {
    imageFormat?: RenderImageFormat;
    imageQuality?: number;
  }
) {
  const instance = getWorker();
  const request: RenderRequest = {
    type: "render",
    data,
    dpi,
    redactions,
    imageFormat: options?.imageFormat,
    imageQuality: options?.imageQuality
  };

  return new Promise<RenderedPages>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Worker render timed out"));
    }, 60_000);

    const cleanup = () => {
      window.clearTimeout(timeout);
      instance.removeEventListener("message", onMessage);
      instance.removeEventListener("error", onError);
    };

    const onMessage = (event: MessageEvent<RenderResponse>) => {
      if (event.data.type === "rendered") {
        cleanup();
        resolve(event.data.pages);
        return;
      }
      if (event.data.type === "error") {
        cleanup();
        reject(new Error(event.data.message));
      }
    };

    const onError = (event: ErrorEvent) => {
      cleanup();
      reject(new Error(event.message || "Worker crashed"));
    };

    instance.addEventListener("message", onMessage);
    instance.addEventListener("error", onError);
    instance.postMessage(request, [data]);
  });
}

async function renderInMainThread(
  data: ArrayBuffer,
  dpi: number,
  redactions?: Record<number, { x: number; y: number; width: number; height: number }[]>,
  options?: {
    imageFormat?: RenderImageFormat;
    imageQuality?: number;
  }
) {
  const { getDocument } = await import("pdfjs-dist");
  const doc = await getDocument({ data, disableWorker: true } as any).promise;
  const pages: RenderedPages = [];
  const imageFormat = options?.imageFormat ?? "png";
  const imageQuality = options?.imageQuality ?? 0.72;

  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: dpi / 72 });
    const unscaled = page.getViewport({ scale: 1 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
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

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (result) => resolve(result),
        imageFormat === "jpeg" ? "image/jpeg" : "image/png",
        imageFormat === "jpeg" ? imageQuality : undefined
      );
    });
    if (!blob) continue;
    const buffer = await blob.arrayBuffer();
    pages.push({ index: i - 1, width: viewport.width, height: viewport.height, image: buffer });
  }

  return pages;
}
