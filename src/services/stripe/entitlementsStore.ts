export type EntitlementRecord = {
  email: string;
  proActive: boolean;
  exportCredits: number;
  expiresAt: number | null;
};

declare global {
  // eslint-disable-next-line no-var
  var entitlementStore: Map<string, EntitlementRecord> | undefined;
}

const store = global.entitlementStore ?? new Map<string, EntitlementRecord>();
if (!global.entitlementStore) {
  global.entitlementStore = store;
}

export function getEntitlement(email: string) {
  return store.get(email.toLowerCase()) ?? null;
}

export function setEntitlement(record: EntitlementRecord) {
  store.set(record.email.toLowerCase(), record);
}
