export type Rect = { x: number; y: number; width: number; height: number };

export function viewToPdfRect(
  rect: Rect,
  pageWidth: number,
  pageHeight: number,
  zoom: number
): Rect {
  const safeZoom = zoom > 0 ? zoom : 1;
  const scaledX = rect.x / safeZoom;
  const scaledY = rect.y / safeZoom;
  const scaledWidth = rect.width / safeZoom;
  const scaledHeight = rect.height / safeZoom;
  const pdfHeight = pageHeight / safeZoom;

  return {
    x: scaledX,
    y: pdfHeight - scaledY - scaledHeight,
    width: scaledWidth,
    height: scaledHeight
  };
}

export function pdfToViewRect(
  rect: Rect,
  pageWidth: number,
  pageHeight: number,
  zoom: number
): Rect {
  const safeZoom = zoom > 0 ? zoom : 1;
  const pdfHeight = pageHeight / safeZoom;
  return {
    x: rect.x * safeZoom,
    y: (pdfHeight - rect.y - rect.height) * safeZoom,
    width: rect.width * safeZoom,
    height: rect.height * safeZoom
  };
}
