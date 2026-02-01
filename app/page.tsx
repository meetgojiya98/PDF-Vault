import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen gradient-hero">
      <header className="flex items-center justify-between px-8 py-6">
        <div className="text-xl font-semibold">PDF Toolbox</div>
        <Link className="btn-secondary" href="/app">
          Open App
        </Link>
      </header>
      <main className="mx-auto max-w-6xl px-8 pb-16 pt-12">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-cyan-200 text-sm uppercase tracking-[0.3em]">Private by default</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight md:text-6xl">
              Offline PDF tools. Private. Fast.
            </h1>
            <p className="mt-6 text-lg text-slate-300">
              Merge, split, sign, redact, and compress PDFs entirely in your browser. No uploads.
              No accounts. Pay only when you export.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/app" className="btn-primary">
                Open App
              </Link>
              <a href="#pricing" className="btn-secondary">
                See Pricing
              </a>
            </div>
            <div className="mt-10 grid gap-4 text-sm text-slate-400 sm:grid-cols-3">
              <div className="card p-4">Runs offline once loaded.</div>
              <div className="card p-4">Client-side PDF processing.</div>
              <div className="card p-4">Secure Stripe checkout.</div>
            </div>
          </div>
          <div className="card p-6">
            <h2 className="text-xl font-semibold">PDF Toolbox Pro</h2>
            <p className="mt-2 text-slate-300">
              Export unlimited PDFs and unlock every tool.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>✔ Unlimited exports</li>
              <li>✔ Priority processing</li>
              <li>✔ Early access to new tools</li>
            </ul>
            <div id="pricing" className="mt-6 rounded-xl border border-slate-700 p-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-sm text-slate-400">Pro Subscription</p>
                  <p className="text-3xl font-semibold">$0.99</p>
                </div>
                <span className="text-xs uppercase text-cyan-200">per month</span>
              </div>
              <p className="mt-3 text-sm text-slate-400">
                Or buy an Export Pack: $1.99 for 5 exports.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
