import { getDocument } from "pdfjs-dist";

export type WorkerRect = { x: number; y: number; width: number; height: number };

export type RenderRequest = {
  type: "render";
  data: ArrayBuffer;
  dpi: number;
  redactions?: Record<number, WorkerRect[]>;
};

export type RenderResponse = {
  type: "rendered";
  pages: { index: number; width: number; height: number; image: ArrayBuffer }[];
};

self.onmessage = async (event: MessageEvent<RenderRequest>) => {
  if (event.data.type !== "render") return;
  const { data, dpi, redactions } = event.data;
  const doc = await getDocument({ data }).promise;
  const pages: RenderResponse["pages"] = [];

  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale: dpi / 72 });
    const unscaled = page.getViewport({ scale: 1 });
    const canvas = new OffscreenCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;

    await page.render({ canvasContext: ctx as any, viewport }).promise;

    const rects = redactions?.[i - 1] ?? [];
    if (rects.length) {
      ctx.fillStyle = "#000000";
      rects.forEach((rect) => {
        const x = rect.x * (dpi / 72);
        const y = (unscaled.height - rect.y - rect.height) * (dpi / 72);
        const width = rect.width * (dpi / 72);
        const height = rect.height * (dpi / 72);
        ctx.fillRect(x, y, width, height);
      });
    }

    const blob = await canvas.convertToBlob({ type: "image/png" });
    const buffer = await blob.arrayBuffer();
    pages.push({ index: i - 1, width: viewport.width, height: viewport.height, image: buffer });
  }

  const message: RenderResponse = { type: "rendered", pages };
  const transfers = pages.map((page) => page.image);
  self.postMessage(message, { transfer: transfers });
};
