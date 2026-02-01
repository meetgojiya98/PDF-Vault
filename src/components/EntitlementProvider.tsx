"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { verifyLicense } from "../services/stripe/license";
import type { LicensePayload } from "../services/stripe/license";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_LICENSE_PUBLIC_KEY ?? "";

type EntitlementContextValue = {
  license: LicensePayload | null;
  loading: boolean;
  refresh: () => Promise<void>;
  consumeCredit: () => void;
};

const EntitlementContext = createContext<EntitlementContextValue | null>(null);

export function useEntitlement() {
  const ctx = useContext(EntitlementContext);
  if (!ctx) {
    throw new Error("useEntitlement must be used within EntitlementProvider");
  }
  return ctx;
}

export function EntitlementProvider({ children }: { children: React.ReactNode }) {
  const [license, setLicense] = useState<LicensePayload | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const stored = localStorage.getItem("pdf-toolbox-license");
    if (!stored) {
      setLicense(null);
      setLoading(false);
      return;
    }
    try {
      const payload = await verifyLicense(stored, PUBLIC_KEY);
      setLicense(payload);
    } catch (error) {
      console.error("Failed to verify license", error);
      setLicense(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const consumeCredit = () => {
    setLicense((prev) => {
      if (!prev) return prev;
      if (prev.proActive) return prev;
      return {
        ...prev,
        exportCredits: Math.max(0, prev.exportCredits - 1)
      };
    });
  };

  const value = useMemo(
    () => ({
      license,
      loading,
      refresh,
      consumeCredit
    }),
    [license, loading]
  );

  return (
    <EntitlementContext.Provider value={value}>
      {children}
    </EntitlementContext.Provider>
  );
}
