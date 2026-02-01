import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Toolbox",
  description: "Offline PDF tools that keep your files private."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
