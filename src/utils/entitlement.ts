export type LicenseToken = {
  proActive: boolean;
  exportCredits: number;
  expiresAt: number | null;
};

export const FREE_EXPORTS_KEY = "pdf-toolbox-free-export";

export function canExport(token: LicenseToken | null) {
  if (!token) {
    const usedFree = localStorage.getItem(FREE_EXPORTS_KEY) === "used";
    return !usedFree;
  }
  if (token.proActive && (!token.expiresAt || token.expiresAt > Date.now())) {
    return true;
  }
  return token.exportCredits > 0;
}

export function markFreeExportUsed() {
  localStorage.setItem(FREE_EXPORTS_KEY, "used");
}
