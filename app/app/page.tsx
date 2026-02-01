"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "../../src/components/AppShell";
import { FileDropzone } from "../../src/components/FileDropzone";
import { ToolGrid } from "../../src/components/ToolGrid";
import { loadRecents, saveRecents, type RecentFile } from "../../src/storage/indexedDb";

export default function AppHome() {
  const [recents, setRecents] = useState<RecentFile[]>([]);
  const searchParams = useSearchParams();

  useEffect(() => {
    loadRecents().then((data) => {
      setRecents(data.sort((a, b) => b.lastOpened - a.lastOpened));
    });
  }, []);

  useEffect(() => {
    const success = searchParams.get("success");
    const sessionId = searchParams.get("session_id");
    const restore = searchParams.get("restore");

    if (success && sessionId) {
      fetch("/api/entitlement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.token) {
            localStorage.setItem("pdf-toolbox-license", data.token);
          }
        });
    }

    if (restore) {
      const email = window.prompt("Enter the email used for Stripe checkout");
      if (email) {
        fetch("/api/entitlement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.token) {
              localStorage.setItem("pdf-toolbox-license", data.token);
            }
          });
      }
    }
  }, [searchParams]);

  const handleFiles = async (files: File[]) => {
    const next = files.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}`,
      name: file.name,
      size: file.size,
      lastOpened: Date.now()
    }));
    const merged = [...next, ...recents].slice(0, 8);
    setRecents(merged);
    await saveRecents(merged);
  };

  return (
    <AppShell>
      <div className="grid gap-6">
        <section className="grid gap-4 md:grid-cols-[1fr_0.8fr]">
          <div>
            <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
            <p className="mt-2 text-sm text-slate-400">
              Drop PDFs to start. Everything stays offline in your browser.
            </p>
            <div className="mt-4">
              <FileDropzone multiple onFiles={handleFiles} />
            </div>
          </div>
          <div className="card p-5">
            <h2 className="text-lg font-semibold">Recent files</h2>
            {recents.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No recent files yet.</p>
            ) : (
              <ul className="mt-3 space-y-3 text-sm text-slate-300">
                {recents.map((item) => (
                  <li key={item.id} className="flex items-center justify-between">
                    <span>{item.name}</span>
                    <span className="text-xs text-slate-500">
                      {(item.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-xs text-slate-500">
              Recents are stored locally in your browser.
            </p>
          </div>
        </section>
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Tools</h2>
            <Link href="/" className="text-sm text-cyan-200 hover:text-cyan-100">
              Back to landing
            </Link>
          </div>
          <div className="mt-4">
            <ToolGrid />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
