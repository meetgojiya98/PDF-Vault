"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "../../src/components/AppShell";
import { ToolGrid } from "../../src/components/ToolGrid";
import { loadRecents, type RecentFile } from "../../src/storage/indexedDb";

function AppHomeContent() {
  const [recents, setRecents] = useState<RecentFile[]>([]);
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
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

  return (
    <AppShell>
      {/* Dynamic Particle Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 space-y-16">
        {/* Hero Section */}
        <section className={`text-center max-w-4xl mx-auto ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 backdrop-blur-sm mb-8">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
            </div>
            <span className="text-sm font-bold text-cyan-300 uppercase tracking-wider">
              All tools ready • 100% Private
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl font-black leading-tight mb-6">
            <span className="bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
              Choose Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse-glow">
              PDF Tool
            </span>
          </h1>

          <p className="text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto mb-8">
            Select a tool below to start processing your PDFs. Everything happens{" "}
            <span className="text-cyan-300 font-semibold">offline in your browser</span> – 
            no uploads, no accounts, completely private.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            {[
              { icon: "⚡", value: "< 1s", label: "Processing" },
              { icon: "🔒", value: "0 bytes", label: "Uploaded" },
              { icon: "📊", value: recents.length, label: "Files Used" }
            ].map((stat, i) => (
              <div 
                key={i}
                className="relative group"
                style={{ animationDelay: `${200 + i * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative card-hover p-6">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-black bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tools Grid */}
        <section className={`${mounted ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '400ms' }}>
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-black text-white mb-3">Available Tools</h2>
            <p className="text-slate-400">Click any tool to upload your PDF and get started</p>
          </div>
          <ToolGrid />
        </section>

        {/* Recent Files Sidebar */}
        {recents.length > 0 && (
          <section className={`max-w-3xl mx-auto ${mounted ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '600ms' }}>
            <div className="card-hover p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Recently Processed</h2>
                  <p className="text-sm text-slate-500">Files you've worked with recently</p>
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-3">
                {recents.slice(0, 6).map((item, index) => (
                  <div 
                    key={item.id}
                    className="group flex items-center gap-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all duration-300 hover:scale-105"
                  >
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate group-hover:text-cyan-300 transition-colors">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(item.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-700/50">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>All files stored locally in your browser for privacy</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Bottom CTA */}
        <section className={`text-center max-w-2xl mx-auto ${mounted ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '800ms' }}>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative card-hover p-10">
              <h3 className="text-3xl font-black text-white mb-4">
                Everything is Free!
              </h3>
              <p className="text-slate-300 mb-6">
                All tools are completely <span className="text-emerald-300 font-bold text-xl">free to use</span>. 
                No limits on exports, no subscriptions required, no hidden fees.
              </p>
              <div className="flex flex-wrap gap-4 justify-center items-center text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Unlimited exports</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>100% private</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>No signup needed</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default function AppHome() {
  return (
    <Suspense fallback={
      <AppShell>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
        </div>
      </AppShell>
    }>
      <AppHomeContent />
    </Suspense>
  );
}
