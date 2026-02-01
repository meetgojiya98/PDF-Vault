"use client";

import React, { useState } from "react";

const CHECKOUT_URL = "/api/stripe/create-checkout-session";

export function PaywallModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState<string | null>(null);

  if (!open) return null;

  const startCheckout = async (mode: "subscription" | "payment") => {
    setLoading(mode);
    const response = await fetch(CHECKOUT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode })
    });
    const data = await response.json();
    if (data?.url) {
      window.location.href = data.url;
    }
    setLoading(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="card w-full max-w-md p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Unlock Export</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        <p className="mt-3 text-sm text-slate-300">
          Edit & preview for free. Exporting requires Pro or export credits.
        </p>
        <div className="mt-5 space-y-3">
          <button
            className="btn-primary w-full"
            onClick={() => startCheckout("subscription")}
            disabled={loading !== null}
          >
            {loading === "subscription" ? "Loading..." : "$0.99/month Pro"}
          </button>
          <button
            className="btn-secondary w-full"
            onClick={() => startCheckout("payment")}
            disabled={loading !== null}
          >
            {loading === "payment" ? "Loading..." : "$1.99 Export Pack (5 exports)"}
          </button>
        </div>
        <a
          href="/app?restore=1"
          className="mt-4 block text-center text-sm text-cyan-200 hover:text-cyan-100"
        >
          Restore purchase
        </a>
      </div>
    </div>
  );
}
