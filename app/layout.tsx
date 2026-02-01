import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "PDF Vault - Offline PDF Tools | Private & Secure",
  description: "Process PDFs entirely in your browser. Merge, split, sign, redact, and compress PDFs offline. No uploads, no tracking, 100% private.",
  keywords: ["PDF tools", "offline PDF", "PDF editor", "merge PDF", "split PDF", "sign PDF", "compress PDF", "private PDF tools"],
  authors: [{ name: "PDF Vault" }],
  openGraph: {
    title: "PDF Vault - Offline PDF Tools",
    description: "Professional PDF tools that work offline and keep your files private",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#22d3ee",
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
