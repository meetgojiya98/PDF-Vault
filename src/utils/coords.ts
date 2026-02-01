export type Rect = { x: number; y: number; width: number; height: number };

export function viewToPdfRect(
  rect: Rect,
  pageWidth: number,
  pageHeight: number,
  zoom: number
): Rect {
  const scaledX = rect.x / zoom;
  const scaledY = rect.y / zoom;
  const scaledWidth = rect.width / zoom;
  const scaledHeight = rect.height / zoom;

  return {
    x: scaledX,
    y: pageHeight - scaledY - scaledHeight,
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
  return {
    x: rect.x * zoom,
    y: (pageHeight - rect.y - rect.height) * zoom,
    width: rect.width * zoom,
    height: rect.height * zoom
  };
}
