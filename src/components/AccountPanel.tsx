"use client";

import React, { useState, useEffect } from "react";
import { useEntitlement } from "./EntitlementProvider";

export function AccountPanel() {
  const { license } = useEntitlement();
  const [isOpen, setIsOpen] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Don't render if no license
  if (!license) return null;

  useEffect(() => {
    if (isOpen && license?.email) {
      fetchSubscriptionData();
    }
  }, [isOpen, license?.email]);

  // Don't render if no entitlement context
  if (!license) return null;

  const fetchSubscriptionData = async () => {
    if (!license?.email) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/stripe/subscription?email=${encodeURIComponent(license.email)}`);
      const data = await response.json();
      setSubscriptionData(data);
    } catch (error) {
      console.error("Failed to fetch subscription data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Move useEffect after early return check
  useEffect(() => {
    if (isOpen && license?.email) {
      fetchSubscriptionData();
    }
  }, [isOpen, license?.email]);

  const manageSubscription = async () => {
    if (!license?.email) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: license.email })
      });
      
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Failed to open customer portal:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!license) return null;

  return (
    <>
      {/* Account Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 group"
      >
        <div className={`w-2 h-2 rounded-full ${license.proActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></div>
        <span className="text-sm font-medium text-slate-300 group-hover:text-cyan-300 transition-colors">
          {license.proActive ? 'Pro' : license.exportCredits > 0 ? `${license.exportCredits} credits` : 'Free'}
        </span>
      </button>

      {/* Account Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setIsOpen(false)}>
          <div 
            className="card w-full max-w-2xl p-8 animate-scale-in relative overflow-hidden"
            style={{ animationDelay: '100ms' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative gradient */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${license.proActive ? 'from-emerald-500 via-teal-500 to-cyan-500' : 'from-slate-600 via-slate-500 to-slate-600'}`}></div>
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${license.proActive ? 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30' : 'from-slate-500/20 to-slate-600/20 border-slate-500/30'} border-2 flex items-center justify-center`}>
                  <svg className={`w-8 h-8 ${license.proActive ? 'text-emerald-400' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white">Your Account</h3>
                  <p className="text-slate-400 mt-1">{license.email}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Status Card */}
            <div className={`p-6 rounded-2xl bg-gradient-to-br ${license.proActive ? 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30' : 'from-slate-500/10 to-slate-600/10 border-slate-500/30'} border-2 mb-6`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Current Plan</p>
                  <h4 className="text-2xl font-black text-white">
                    {license.proActive ? 'PDF Vault Pro' : 'Free Plan'}
                  </h4>
                </div>
                {license.proActive && (
                  <div className="px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/40">
                    <span className="text-sm font-bold text-emerald-400">Active</span>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent"></div>
                </div>
              ) : subscriptionData ? (
                <div className="space-y-3">
                  {license.proActive && subscriptionData.currentPeriodEnd && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Renews on</span>
                      <span className="text-white font-semibold">
                        {new Date(subscriptionData.currentPeriodEnd).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {!license.proActive && license.exportCredits > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Export credits</span>
                      <span className="text-white font-semibold">{license.exportCredits} remaining</span>
                    </div>
                  )}
                  {subscriptionData.cancelAtPeriodEnd && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                      <p className="text-sm text-amber-300">
                        Subscription will cancel on {new Date(subscriptionData.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Features */}
            <div className="space-y-4 mb-6">
              <p className="text-sm font-semibold text-slate-300">
                {license.proActive ? 'Your Pro benefits:' : 'Upgrade to Pro for:'}
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { icon: "🚀", text: "Unlimited exports", active: license.proActive },
                  { icon: "⚡", text: "Priority processing", active: license.proActive },
                  { icon: "🎯", text: "Advanced compression", active: license.proActive },
                  { icon: "📦", text: "Batch operations", active: license.proActive },
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30">
                    <span className="text-2xl">{feature.icon}</span>
                    <span className={`text-sm font-medium ${feature.active ? 'text-white' : 'text-slate-400'}`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {license.proActive ? (
                <button
                  onClick={manageSubscription}
                  disabled={loading}
                  className="w-full btn-secondary py-4 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Manage Subscription</span>
                    </div>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // Trigger paywall - you can emit an event or use a prop
                    const event = new CustomEvent('openPaywall');
                    window.dispatchEvent(event);
                  }}
                  className="w-full btn-primary py-4 text-base font-semibold"
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Upgrade to Pro - $0.99/month</span>
                  </div>
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-slate-700/50">
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
      )}
    </>
  );
}
