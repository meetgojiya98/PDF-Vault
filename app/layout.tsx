import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "PDF Vault - Browser PDF Workspace",
  description:
    "A feature-rich browser PDF workspace to merge, split, rotate, watermark, sign, redact, and compress files with local-only processing.",
  keywords: [
    "PDF tools",
    "offline PDF",
    "PDF workspace",
    "merge PDF",
    "split PDF",
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
