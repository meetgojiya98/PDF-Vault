import type { LicensePayload } from "../services/stripe/license";

export const FREE_EXPORTS_KEY = "pdf-toolbox-free-export";

// Check if payments are enabled via environment variable
const PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true';

export function canExport(token: LicensePayload | null) {
  // If payments are disabled, always allow export
  if (!PAYMENTS_ENABLED) {
    return true;
  }

  if (!token) {
    const usedFree = localStorage.getItem(FREE_EXPORTS_KEY) === "used";
    return !usedFree;
  }
  if (token.proActive) {
    return true;
  }
  return token.exportCredits > 0;
}

export function markFreeExportUsed() {
  // Only mark if payments are enabled
  if (PAYMENTS_ENABLED) {
    localStorage.setItem(FREE_EXPORTS_KEY, "used");
  }
}
