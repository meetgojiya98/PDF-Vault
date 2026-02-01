"use client";

import React, { useState } from "react";

const CHECKOUT_URL = "/api/stripe/create-checkout-session";

export function PaywallModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  if (!open) return null;

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const startCheckout = async () => {
    // Validate email
    if (!email || !validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setEmailError("");
    
    try {
      const response = await fetch(CHECKOUT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "subscription", email })
      });
      
      const data = await response.json();
      
      if (data.error) {
        setEmailError(data.error);
        setLoading(false);
        return;
      }
      
      if (data?.url) {
        // Store email in localStorage for after payment
        localStorage.setItem("pdf-vault-checkout-email", email);
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setEmailError("Failed to start checkout. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div 
        className="card w-full max-w-2xl p-8 animate-scale-in relative overflow-y-auto"
        style={{ animationDelay: '100ms', maxHeight: 'calc(100vh - 2rem)' }}
      >
        {/* Decorative gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500"></div>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white">Unlock Unlimited Exports</h3>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-300 flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Info */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30">
          <p className="text-slate-300 leading-relaxed">
            <span className="font-semibold text-white">Edit & preview for free!</span> Upgrade to Pro for unlimited exports and premium features. Cancel anytime.
          </p>
        </div>

        {/* Email Input */}
        <div className="mb-6">
          <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-2">
            Your Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError("");
            }}
            placeholder="you@example.com"
            className={`w-full px-4 py-3 rounded-xl bg-slate-900/50 border-2 ${
              emailError ? 'border-red-500/50' : 'border-slate-700/50'
            } text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300`}
            disabled={loading}
          />
          {emailError && (
            <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {emailError}
            </p>
          )}
          <p className="mt-2 text-xs text-slate-500">
            We'll use this to manage your subscription and send receipts
          </p>
        </div>

        {/* Pro Subscription Card */}
        <button
          className="w-full group relative overflow-hidden rounded-2xl border-2 border-cyan-500/50 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-8 text-left transition-all duration-300 hover:border-cyan-400 hover:shadow-2xl hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={startCheckout}
          disabled={loading}
        >
          <div className="absolute top-3 right-3">
            <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Best Value</span>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border-2 border-cyan-500/50 flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="text-3xl font-black text-white mb-1">Pro Subscription</h4>
                <p className="text-slate-400">Everything you need for PDF processing</p>
              </div>
            </div>
            
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-6xl font-black bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                $0.99
              </span>
              <div className="text-slate-400 font-medium">
                <div className="text-lg">/month</div>
                <div className="text-sm">Billed monthly</div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {[
              { icon: "🚀", title: "Unlimited Exports", desc: "Export as many PDFs as you need" },
              { icon: "⚡", title: "Priority Processing", desc: "Faster processing speeds" },
              { icon: "🎯", title: "Advanced Compression", desc: "Better quality & smaller files" },
              { icon: "📦", title: "Batch Operations", desc: "Process multiple files at once" },
              { icon: "🔧", title: "All Tools", desc: "Access to every PDF tool" },
              { icon: "💎", title: "Early Access", desc: "Get new features first" }
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/30">
                <div className="text-2xl flex-shrink-0">{feature.icon}</div>
                <div>
                  <div className="font-semibold text-white text-sm">{feature.title}</div>
                  <div className="text-xs text-slate-400">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg group-hover:scale-105 transition-transform duration-300">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                <span>Loading...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Upgrade to Pro Now</span>
              </>
            )}
          </div>
          
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm rounded-2xl">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent mx-auto mb-3"></div>
                <p className="text-sm text-slate-300">Redirecting to checkout...</p>
              </div>
            </div>
          )}
        </button>

        {/* Footer */}
        <div className="mt-8 space-y-4 text-center">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
          
          <a
            href="/app?restore=1"
            className="inline-block text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Already subscribed? Restore your license →
          </a>
          
          <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Secure via Stripe</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
