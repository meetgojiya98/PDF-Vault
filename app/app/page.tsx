"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ReactDOM from "react-dom";
import { AppShell } from "../../src/components/AppShell";
import { ToolGrid } from "../../src/components/ToolGrid";
import { AccountPanel } from "../../src/components/AccountPanel";
import { EntitlementProvider } from "../../src/components/EntitlementProvider";
import {
  loadFavoriteTools,
  loadRecents,
  loadRunHistory,
  loadWorkspacePreference,
  saveFavoriteTools,
  saveWorkspacePreference,
  type RecentFile,
  type RunHistoryItem,
  type ToolSlug,
  type WorkspacePreference
} from "../../src/storage/indexedDb";
import { TOOL_CATEGORY_LABELS, TOOL_DEFINITIONS, WORKFLOW_TEMPLATES, type ToolCategory } from "../../src/config/tools";

type FilterCategory = "all" | ToolCategory;

function AppHomeContent() {
  const [recents, setRecents] = useState<RecentFile[]>([]);
  const [runs, setRuns] = useState<RunHistoryItem[]>([]);
  const [favorites, setFavorites] = useState<ToolSlug[]>([]);
  const [prefs, setPrefs] = useState<WorkspacePreference | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<FilterCategory>("all");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
    Promise.all([loadRecents(), loadRunHistory(12), loadFavoriteTools(), loadWorkspacePreference()]).then(
      ([loadedRecents, loadedRuns, loadedFavorites, loadedPrefs]) => {
        setRecents(loadedRecents.sort((a, b) => b.lastOpened - a.lastOpened));
        setRuns(loadedRuns);
        setFavorites(loadedFavorites);
        setPrefs(loadedPrefs);
      }
    );
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
      if (!email) return;
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
  }, [searchParams]);

  const filteredTools = useMemo(() => {
    const q = search.trim().toLowerCase();
    const favoriteSet = new Set(favorites);
    return TOOL_DEFINITIONS.filter((tool) => {
      if (category !== "all" && tool.category !== category) return false;
      if (onlyFavorites && !favoriteSet.has(tool.slug)) return false;
      if (!q) return true;
      const haystack = [
        tool.name,
        tool.shortDescription,
        tool.longDescription,
        ...tool.keywords,
        ...tool.idealFor
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [search, category, favorites, onlyFavorites]);

  const toggleFavorite = async (slug: ToolSlug) => {
    const has = favorites.includes(slug);
    const next = has ? favorites.filter((item) => item !== slug) : [...favorites, slug];
    setFavorites(next);
    await saveFavoriteTools(next);
  };

  const onPreferenceUpdate = async (next: Partial<WorkspacePreference>) => {
    if (!prefs) return;
    const merged = { ...prefs, ...next };
    setPrefs(merged);
    await saveWorkspacePreference(next);
  };

  const totalInput = runs.reduce((sum, run) => sum + run.inputBytes, 0);
  const totalOutput = runs.reduce((sum, run) => sum + run.outputBytes, 0);
  const savedBytes = Math.max(0, totalInput - totalOutput);
  const completionRate = runs.length
    ? Math.round((runs.filter((run) => run.outputBytes > 0).length / runs.length) * 100)
    : 0;

  return (
    <AppShell showAccount>
      <div className="space-y-8">
        <section className={`rounded-3xl border border-white/20 bg-white/[0.05] p-6 shadow-2xl shadow-slate-950/60 backdrop-blur-xl ${mounted ? "animate-fade-in" : "opacity-0"}`}>
          <div className="grid gap-8 xl:grid-cols-[1.4fr_0.8fr]">
            <div className="space-y-5">
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-100">
                Workspace
              </p>
              <div className="space-y-3">
                <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
                  Build polished PDFs faster.
                </h1>
                <p className="max-w-2xl text-base text-slate-200/85">
                  Search tools, pin your favorites, and run templates for common workflows.
                  Every operation stays local in your browser.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Tools" value={`${TOOL_DEFINITIONS.length}`} hint="Ready now" />
                <StatCard label="Recent Runs" value={`${runs.length}`} hint={`Completion ${completionRate}%`} />
                <StatCard label="Estimated Saved" value={formatBytes(savedBytes)} hint="From optimization" />
              </div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-slate-950/30 p-5">
              <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-300">Preferences</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.12em] text-slate-400">
                    <span>Default DPI</span>
                    <span>{prefs?.defaultDpi ?? 150}</span>
                  </div>
                  <input
                    type="range"
                    min={96}
                    max={220}
                    value={prefs?.defaultDpi ?? 150}
                    onChange={(event) => onPreferenceUpdate({ defaultDpi: Number(event.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Split Mode</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => onPreferenceUpdate({ splitMode: "single-file" })}
                      className={`rounded-xl border px-3 py-2 font-semibold uppercase tracking-[0.1em] ${
                        prefs?.splitMode === "single-file"
                          ? "border-cyan-300/60 bg-cyan-400/15 text-cyan-100"
                          : "border-white/20 bg-white/[0.03] text-slate-300"
                      }`}
                    >
                      Single file
                    </button>
                    <button
                      type="button"
                      onClick={() => onPreferenceUpdate({ splitMode: "file-per-range" })}
                      className={`rounded-xl border px-3 py-2 font-semibold uppercase tracking-[0.1em] ${
                        prefs?.splitMode === "file-per-range"
                          ? "border-cyan-300/60 bg-cyan-400/15 text-cyan-100"
                          : "border-white/20 bg-white/[0.03] text-slate-300"
                      }`}
                    >
                      Per range
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Output Prefix
                  </label>
                  <input
                    value={prefs?.outputPrefix ?? "pdf-vault"}
                    onChange={(event) => onPreferenceUpdate({ outputPrefix: event.target.value })}
                    className="w-full rounded-xl border border-white/20 bg-slate-900/55 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300/60"
                    placeholder="pdf-vault"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.55fr_0.85fr]">
          <div className="space-y-5">
            <div className="rounded-3xl border border-white/15 bg-white/[0.04] p-5 backdrop-blur-md">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-xl">
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search tools, use-cases, or keywords..."
                    className="w-full rounded-2xl border border-white/20 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-300/60"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setOnlyFavorites((value) => !value)}
                  className={`rounded-2xl border px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] transition ${
                    onlyFavorites
                      ? "border-amber-300/60 bg-amber-300/10 text-amber-100"
                      : "border-white/20 bg-white/[0.03] text-slate-200 hover:border-white/35"
                  }`}
                >
                  {onlyFavorites ? "Showing pinned" : "Show pinned"}
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(["all", "organize", "review", "delivery"] as FilterCategory[]).map((option) => {
                  const active = option === category;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setCategory(option)}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.1em] transition ${
                        active
                          ? "border-cyan-300/60 bg-cyan-300/15 text-cyan-100"
                          : "border-white/20 bg-white/[0.03] text-slate-300 hover:border-white/35"
                      }`}
                    >
                      {option === "all" ? "All tools" : TOOL_CATEGORY_LABELS[option]}
                    </button>
                  );
                })}
              </div>
            </div>

            {filteredTools.length ? (
              <ToolGrid tools={filteredTools} favorites={favorites} onToggleFavorite={toggleFavorite} />
            ) : (
              <div className="rounded-3xl border border-white/15 bg-white/[0.04] p-8 text-center text-slate-300">
                No tools match the current filters. Try clearing search or pinned-only mode.
              </div>
            )}

            <div className="rounded-3xl border border-white/15 bg-white/[0.04] p-5 backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Workflow Templates</h2>
                <span className="text-xs uppercase tracking-[0.14em] text-slate-400">Guided</span>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {WORKFLOW_TEMPLATES.map((workflow) => (
                  <div key={workflow.id} className="rounded-2xl border border-white/15 bg-slate-950/35 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="rounded-full border border-white/20 bg-white/[0.05] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">
                        {workflow.badge}
                      </span>
                      <span className="text-xs text-slate-400">{workflow.steps.length} steps</span>
                    </div>
                    <h3 className="text-base font-bold text-white">{workflow.name}</h3>
                    <p className="mt-1 text-sm text-slate-300/80">{workflow.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {workflow.steps.map((step) => (
                        <span
                          key={step}
                          className="rounded-full border border-slate-700/70 bg-slate-900/55 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300"
                        >
                          {step}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/app/${workflow.steps[0]}?workflow=${workflow.id}`}
                      className="mt-4 inline-block text-xs font-bold uppercase tracking-[0.12em] text-cyan-200 hover:text-cyan-100"
                    >
                      Start workflow -&gt;
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <aside className="rounded-3xl border border-white/15 bg-white/[0.04] p-5 backdrop-blur-md">
              <h2 className="text-lg font-bold text-white">Recent Files</h2>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400">Local device only</p>
              <div className="mt-4 space-y-2">
                {recents.length ? (
                  recents.slice(0, 8).map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-white/10 bg-slate-950/35 p-3"
                    >
                      <p className="truncate text-sm font-semibold text-white">{item.name}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {formatBytes(item.size)} · {new Date(item.lastOpened).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl border border-dashed border-white/20 p-4 text-sm text-slate-400">
                    No recent files yet. Open any tool to begin.
                  </p>
                )}
              </div>
            </aside>

            <aside className="rounded-3xl border border-white/15 bg-white/[0.04] p-5 backdrop-blur-md">
              <h2 className="text-lg font-bold text-white">Run History</h2>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-400">Last operations</p>
              <div className="mt-4 space-y-2">
                {runs.length ? (
                  runs.map((run) => (
                    <div
                      key={run.id}
                      className="rounded-xl border border-white/10 bg-slate-950/35 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-cyan-100">
                          {run.tool}
                        </p>
                        <p className="text-xs text-slate-400">{Math.max(1, Math.round(run.durationMs / 1000))}s</p>
                      </div>
                      <p className="mt-1 text-xs text-slate-300/90">
                        {run.inputNames.length} file(s) -&gt; {run.outputNames.length} output(s)
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {formatBytes(run.inputBytes)} -&gt; {formatBytes(run.outputBytes)} · {new Date(run.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl border border-dashed border-white/20 p-4 text-sm text-slate-400">
                    Run any tool to populate your activity timeline.
                  </p>
                )}
              </div>
            </aside>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-slate-950/40 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
      <p className="mt-0.5 text-xs text-slate-400">{hint}</p>
    </div>
  );
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unit]}`;
}

export default function AppHome() {
  return (
    <EntitlementProvider>
      <Suspense
        fallback={
          <AppShell showAccount>
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
            </div>
          </AppShell>
        }
      >
        <AppHomeContent />
      </Suspense>
      <AccountPanelPortal />
    </EntitlementProvider>
  );
}

function AccountPanelPortal() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  const slot = document.getElementById("account-panel-slot");
  if (!slot) return null;
  return ReactDOM.createPortal(<AccountPanel />, slot);
}
