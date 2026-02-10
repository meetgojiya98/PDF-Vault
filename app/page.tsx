"use client";

import Link from "next/link";
import { Logo } from "../src/components/Logo";
import { TOOL_DEFINITIONS, WORKFLOW_TEMPLATES } from "../src/config/tools";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_-5%,rgba(56,189,248,0.2),transparent_30%),radial-gradient(circle_at_95%_15%,rgba(34,197,94,0.16),transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] text-slate-100">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
        <Logo size="md" />
        <Link
          href="/app"
          className="rounded-full border border-cyan-300/50 bg-cyan-300/15 px-5 py-2 text-xs font-bold uppercase tracking-[0.14em] text-cyan-100 transition hover:bg-cyan-300/25"
        >
          Open Workspace
        </Link>
      </header>

      <main className="mx-auto max-w-7xl space-y-14 px-6 pb-16 pt-8">
        <section className="grid gap-10 rounded-3xl border border-white/15 bg-white/[0.04] p-8 backdrop-blur-xl lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-6">
            <p className="inline-flex rounded-full border border-emerald-300/45 bg-emerald-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-emerald-100">
              Offline-first PDF platform
            </p>
            <h1 className="text-5xl font-black leading-tight text-white md:text-6xl">
              Feature-rich PDF workflows
              <br />
              with zero uploads.
            </h1>
            <p className="max-w-2xl text-lg text-slate-200/85">
              Merge, split, rotate, watermark, sign, redact, and compress documents locally in your browser.
              Build faster handoffs with workflow templates, pinned tools, and local run history.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/app"
                className="rounded-2xl border border-cyan-300/50 bg-gradient-to-r from-cyan-500/75 to-blue-500/75 px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white"
              >
                Launch Free Workspace
              </Link>
              <a
                href="#tools"
                className="rounded-2xl border border-white/25 bg-white/[0.04] px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-slate-200"
              >
                Explore Tools
              </a>
            </div>
          </div>
          <div className="space-y-4 rounded-2xl border border-white/15 bg-slate-950/45 p-5">
            <h2 className="text-base font-bold uppercase tracking-[0.14em] text-slate-300">Why teams pick PDF Vault</h2>
            <FeatureRow title="Client-side processing" copy="Files never leave your device." />
            <FeatureRow title="Workflow templates" copy="Reusable multi-step PDF flows." />
            <FeatureRow title="Pinned favorites" copy="One-click access to your top tools." />
            <FeatureRow title="Run analytics" copy="Track file sizes and operation history locally." />
          </div>
        </section>

        <section id="tools" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white">Tool Catalog</h2>
            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">{TOOL_DEFINITIONS.length} tools available</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {TOOL_DEFINITIONS.map((tool) => (
              <Link
                key={tool.slug}
                href={`/app/${tool.slug}`}
                className="group rounded-2xl border border-white/15 bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:border-white/30"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${tool.borderColor} bg-slate-950/55 text-2xl`}>
                    {tool.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{tool.name}</h3>
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-400">{tool.category}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-200/85">{tool.shortDescription}</p>
                <p className="mt-3 text-xs text-cyan-200">Open tool -&gt;</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-white">Workflow Templates</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {WORKFLOW_TEMPLATES.map((workflow) => (
              <div key={workflow.id} className="rounded-2xl border border-white/15 bg-white/[0.03] p-5">
                <p className="inline-flex rounded-full border border-white/20 bg-white/[0.05] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300">
                  {workflow.badge}
                </p>
                <h3 className="mt-3 text-lg font-bold text-white">{workflow.name}</h3>
                <p className="mt-1 text-sm text-slate-300/85">{workflow.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {workflow.steps.map((step) => (
                    <span key={step} className="rounded-full border border-slate-700/70 bg-slate-900/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-300">
                      {step}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="privacy" className="rounded-3xl border border-emerald-300/35 bg-emerald-300/10 p-6">
          <h2 className="text-2xl font-black text-white">Privacy by architecture</h2>
          <p className="mt-2 max-w-3xl text-sm text-emerald-50/95">
            PDF Vault runs in your browser, stores settings locally, and performs no background file uploads.
            You control every document end-to-end.
          </p>
        </section>
      </main>
    </div>
  );
}

function FeatureRow({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-0.5 text-xs text-slate-300/80">{copy}</p>
    </div>
  );
}
