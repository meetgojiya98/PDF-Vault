import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "PDF Vault - Browser PDF Workspace",
  description:
    "A feature-rich browser PDF workspace to merge, split, chunk-split, overlay, resize, insert blanks, add header/footer, reorder, duplicate, interleave, margin-adjust, grayscale, crop, delete, reverse, number, watermark, sign, redact, and compress files with local-only processing.",
  keywords: [
    "PDF tools",
    "offline PDF",
    "PDF workspace",
    "merge PDF",
    "split PDF",
    "reorder PDF pages",
    "duplicate PDF pages",
    "interleave PDF",
    "add PDF margins",
    "grayscale PDF",
    "resize PDF pages",
    "insert blank pages PDF",
    "add header footer PDF",
    "overlay PDFs",
    "split PDF by chunks",
    "crop PDF",
    "delete PDF pages",
    "reverse PDF",
    "page numbers PDF",
    "edit PDF metadata",
    "rotate PDF",
    "watermark PDF",
    "sign PDF",
    "compress PDF",
    "private PDF tools"
  ],
  authors: [{ name: "PDF Vault" }],
  openGraph: {
    title: "PDF Vault - Browser PDF Workspace",
    description: "Feature-rich PDF workflows with local-only processing and no uploads.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0b1220",
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
