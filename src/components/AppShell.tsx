"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

const navItems = [
  { label: "Workspace", href: "/app" },
  { label: "Landing", href: "/" }
];

export function AppShell({
  children,
  showAccount = false
}: {
  children: React.ReactNode;
  showAccount?: boolean;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_0%_0%,rgba(34,211,238,0.18),transparent_42%),radial-gradient(circle_at_100%_10%,rgba(14,165,233,0.16),transparent_38%),linear-gradient(180deg,#020617_0%,#0b1220_100%)] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:48px_48px] opacity-35" />
      <header
        className={`sticky top-0 z-40 border-b transition-all duration-300 ${
          scrolled
            ? "border-white/20 bg-slate-950/80 shadow-lg shadow-black/30 backdrop-blur-xl"
            : "border-white/10 bg-slate-950/50 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="transition hover:opacity-90">
            <Logo size="md" />
          </Link>
          <nav className="flex items-center gap-2">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] transition ${
                    active
                      ? "border border-cyan-300/50 bg-cyan-300/15 text-cyan-100"
                      : "border border-transparent text-slate-300 hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            {showAccount && <div id="account-panel-slot" />}
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-5 py-8">{children}</main>

      <footer className="relative z-10 mt-16 border-t border-white/10 bg-slate-950/50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 md:flex-row">
          <p className="text-sm text-slate-400">PDF Vault · Browser-only PDF processing</p>
          <div className="flex items-center gap-5 text-xs uppercase tracking-[0.12em] text-slate-400">
            <a href="#privacy" className="transition hover:text-slate-200">
              Privacy
            </a>
            <a href="#tools" className="transition hover:text-slate-200">
              Tools
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
