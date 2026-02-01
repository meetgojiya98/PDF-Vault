"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "../src/components/Logo";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  return (
    <div className="min-h-screen gradient-hero relative overflow-hidden">
      {/* Enhanced Animated background with mouse tracking */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl animate-float"
          style={mounted && typeof window !== 'undefined' ? {
            top: `${20 + (mousePosition.y / window.innerHeight) * 10}%`,
            left: `${-10 + (mousePosition.x / window.innerWidth) * 5}%`,
            transition: 'all 0.3s ease-out'
          } : {}}
        ></div>
        <div 
          className="absolute w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-float" 
          style={mounted && typeof window !== 'undefined' ? { 
            animationDelay: '2s',
            top: `${30 + (mousePosition.y / window.innerHeight) * -5}%`,
            right: `${-10 + (mousePosition.x / window.innerWidth) * -5}%`,
            transition: 'all 0.3s ease-out'
          } : { animationDelay: '2s' }}
        ></div>
        <div 
          className="absolute w-[550px] h-[550px] bg-purple-500/10 rounded-full blur-3xl animate-float" 
          style={mounted && typeof window !== 'undefined' ? { 
            animationDelay: '4s',
            bottom: `${20 + (mousePosition.y / window.innerHeight) * 5}%`,
            left: `${30 + (mousePosition.x / window.innerWidth) * 3}%`,
            transition: 'all 0.3s ease-out'
          } : { animationDelay: '4s' }}
        ></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${10 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6 backdrop-blur-sm">
        <Logo size="md" />
        <Link className="btn-secondary group relative overflow-hidden" href="/app">
          <span className="relative z-10">Open App</span>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </Link>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto max-w-7xl px-8 pb-20 pt-12">
        <div className="grid gap-16 lg:grid-cols-[1.4fr_0.6fr] items-start">
          {/* Left Column */}
          <div className={`space-y-10 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
            {/* Badge with enhanced animation */}
            <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
              </div>
              <span className="text-sm font-bold text-cyan-300 uppercase tracking-wider">
                100% Private • Zero Server Uploads
              </span>
            </div>

            {/* Headline with enhanced gradients */}
            <div>
              <h1 className="text-6xl md:text-8xl font-black leading-[1.1] mb-8">
                <span className="bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent inline-block">
                  Professional
                </span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse-glow inline-block">
                  PDF Tools
                </span>
              </h1>
              <p className="text-2xl text-slate-300 leading-relaxed max-w-2xl">
                Merge, split, sign, redact, and compress PDFs <span className="text-cyan-300 font-bold">entirely in your browser</span>. 
                No uploads. No accounts. Complete privacy.
              </p>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-wrap gap-5">
              <Link href="/app" className="btn-primary text-xl px-10 py-5 group relative overflow-hidden shadow-2xl shadow-cyan-500/30">
                <span className="relative z-10 flex items-center gap-3">
                  <svg className="w-7 h-7 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Launch App Free
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </Link>
            </div>

            {/* Enhanced Feature Pills */}
            <div className={`grid gap-5 sm:grid-cols-3 ${mounted ? 'animate-slide-up' : 'opacity-0'}`} style={{ animationDelay: '200ms' }}>
              {[
                { icon: "⚡", text: "Lightning Fast", desc: "< 1 second processing", color: "from-amber-500/20 to-yellow-500/20", border: "border-amber-500/30" },
                { icon: "🔒", text: "100% Private", desc: "Zero server uploads", color: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/30" },
                { icon: "💎", text: "Free Forever", desc: "No limits, no fees", color: "from-purple-500/20 to-pink-500/20", border: "border-purple-500/30" }
              ].map((feature, i) => (
                <div 
                  key={i} 
                  className="card-hover p-6 group relative overflow-hidden"
                  style={{ animationDelay: `${300 + i * 100}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  <div className="relative z-10">
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} border ${feature.border} text-3xl mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      {feature.icon}
                    </div>
                    <div className="font-bold text-lg text-white mb-1">{feature.text}</div>
                    <div className="text-sm text-slate-400">{feature.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-6">
              <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-sm font-semibold text-slate-300">100% Secure</span>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm font-semibold text-slate-300">Instant Processing</span>
              </div>
              <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm font-semibold text-slate-300">No Registration</span>
              </div>
            </div>
          </div>

          {/* Right Column - Features Highlight (was pricing card) */}
          <div className={`card-hover p-8 sticky top-24 ${mounted ? 'animate-scale-in' : 'opacity-0'}`} style={{ animationDelay: '400ms' }}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-t-2xl"></div>
            
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 mb-4">
                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">100% Free</span>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">Everything Included</h2>
              <p className="text-slate-300 leading-relaxed">
                All PDF tools completely free, forever. No limits, no subscriptions, no hidden fees.
              </p>
            </div>

            <ul className="space-y-3 mb-6">
              {[
                "Unlimited PDF exports",
                "All tools unlocked",
                "100% client-side processing",
                "No file uploads to servers",
                "Works completely offline",
                "No tracking or analytics"
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <Link href="/app" className="w-full btn-primary py-4 text-base font-semibold block text-center">
              <svg className="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="ml-2">Start Using for Free</span>
            </Link>

            <p className="text-xs text-center text-slate-500 mt-4">
              No signup required • No credit card needed • No time limits
            </p>
          </div>
        </div>

        {/* Features Section */}
        <section className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Everything you need for PDFs
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Professional-grade tools that work offline and keep your files secure
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: "📄", title: "Merge PDFs", desc: "Combine multiple documents into one seamless file", color: "from-cyan-500/20 to-blue-500/20" },
              { icon: "✂️", title: "Split & Extract", desc: "Extract specific pages or split into multiple files", color: "from-purple-500/20 to-pink-500/20" },
              { icon: "✍️", title: "Digital Signature", desc: "Sign documents with your handwritten signature", color: "from-emerald-500/20 to-teal-500/20" },
              { icon: "🔒", title: "Safe Redaction", desc: "Permanently remove sensitive information", color: "from-orange-500/20 to-red-500/20" },
              { icon: "📦", title: "Compression", desc: "Reduce file size without quality loss", color: "from-blue-500/20 to-indigo-500/20" },
              { icon: "⚡", title: "Batch Processing", desc: "Process multiple files simultaneously", color: "from-amber-500/20 to-yellow-500/20" }
            ].map((feature, i) => (
              <div key={i} className="card-hover p-6 group">
                <div className={`inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} border border-white/10 items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Privacy Section */}
        <section id="privacy" className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Your Privacy is Our Priority
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Process your PDFs with complete confidence. Your files never leave your device.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
            <div className="card-hover p-8 group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">
                🔒
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                100% Client-Side Processing
              </h3>
              <p className="text-slate-400 leading-relaxed">
                All PDF operations happen directly in your browser. Your files are never uploaded to any server, 
                ensuring complete privacy and security. What happens on your device, stays on your device.
              </p>
            </div>

            <div className="card-hover p-8 group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">
                🚫
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                Zero Data Collection
              </h3>
              <p className="text-slate-400 leading-relaxed">
                We don't track, store, or analyze your PDFs or usage patterns. No analytics, no cookies, 
                no fingerprinting. Your work is private, and we respect that.
              </p>
            </div>

            <div className="card-hover p-8 group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">
                ⚡
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                Offline Capable
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Works without an internet connection. Once loaded, you can disconnect and continue working. 
                Perfect for sensitive documents that should never touch the internet.
              </p>
            </div>

            <div className="card-hover p-8 group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">
                🛡️
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                Open Source Ready
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Built with transparency in mind. You can verify that we do what we say. No hidden processes, 
                no backdoors, just pure client-side PDF processing.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <p className="text-emerald-300 font-semibold">
                Your files are processed locally on your device. They never leave your browser.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
