"use client";

import { useEffect, useState } from "react";
import { useEntitlement } from "./EntitlementProvider";

type SubscriptionState = {
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
};

export function AccountPanel() {
  const { license } = useEntitlement();
  const [isOpen, setIsOpen] = useState(false);
  const [details, setDetails] = useState<SubscriptionState | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !license?.email) return;
    let cancelled = false;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/stripe/subscription?email=${encodeURIComponent(license.email)}`);
        const data = await response.json();
        if (!cancelled) {
          setDetails(data);
        }
      } catch (error) {
        console.error("Failed to load subscription details", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchDetails();
    return () => {
      cancelled = true;
    };
  }, [isOpen, license?.email]);

  if (!license) return null;

  const openCustomerPortal = async () => {
    if (!license.email) return;
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: license.email })
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Failed to open Stripe customer portal", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-full border border-white/20 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-200 transition hover:border-white/35"
      >
        {license.proActive ? "Pro Active" : `${license.exportCredits} credits`}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-3xl border border-white/15 bg-slate-950/95 p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-2xl font-black text-white">Account</h3>
                <p className="mt-1 text-sm text-slate-300">{license.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-white/20 px-2 py-1 text-xs text-slate-300 transition hover:border-white/35 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 rounded-2xl border border-white/15 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Plan</span>
                <span className="font-bold text-white">{license.proActive ? "PDF Vault Pro" : "Free"}</span>
              </div>
              {!license.proActive && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Credits remaining</span>
                  <span className="font-bold text-white">{license.exportCredits}</span>
                </div>
              )}
              {details?.currentPeriodEnd && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{details.cancelAtPeriodEnd ? "Ends on" : "Renews on"}</span>
                  <span className="font-bold text-white">
                    {new Date(details.currentPeriodEnd).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-5 space-y-2">
              {license.proActive ? (
                <button
                  type="button"
                  onClick={openCustomerPortal}
                  disabled={loading}
                  className="w-full rounded-2xl border border-cyan-300/45 bg-cyan-300/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-cyan-100 disabled:opacity-60"
                >
                  {loading ? "Loading..." : "Manage subscription"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    window.dispatchEvent(new CustomEvent("openPaywall"));
                  }}
                  className="w-full rounded-2xl border border-emerald-300/45 bg-emerald-300/15 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-emerald-100"
                >
                  Upgrade to Pro
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
