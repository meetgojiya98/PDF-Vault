"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Logo } from "./Logo";

const navItems = [
  { label: "Tools", href: "/app", icon: "🛠️" },
  { label: "Privacy", href: "/#privacy", icon: "🔐" }
];

export function AppShell({ children, showAccount = false }: { children: React.ReactNode; showAccount?: boolean }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      <header 
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled 
            ? 'border-slate-700/50 bg-slate-950/80 backdrop-blur-xl shadow-lg shadow-black/20' 
            : 'border-slate-800 bg-slate-950/50 backdrop-blur-sm'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="group">
            <Logo size="md" />
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                  pathname === item.href
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800/50'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
            {showAccount && (
              <div id="account-panel-slot"></div>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">
        {children}
      </main>
      <footer className="border-t border-slate-800 bg-slate-950/50 backdrop-blur-sm mt-20">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Logo size="sm" />
              <span className="text-sm text-slate-400">
                © 2026 PDF Vault. Your files, your device.
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-cyan-300 transition-colors duration-300">
                Terms
              </a>
              <a href="#" className="hover:text-cyan-300 transition-colors duration-300">
                Privacy
              </a>
              <a href="#" className="hover:text-cyan-300 transition-colors duration-300">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
