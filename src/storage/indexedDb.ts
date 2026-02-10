import { openDB } from "idb";

const DB_NAME = "pdf-toolbox";
const DB_VERSION = 2;
const STORE_SETTINGS = "settings";
const STORE_RECENTS = "recents";
const STORE_RUNS = "runs";

export type RecentFile = {
  id: string;
  name: string;
  size: number;
  lastOpened: number;
};

export type ToolSlug =
  | "merge"
  | "split"
  | "sign"
  | "redact"
  | "compress"
  | "rotate"
  | "watermark";

export type RunHistoryItem = {
  id: string;
  tool: ToolSlug;
  inputNames: string[];
  outputNames: string[];
  inputBytes: number;
  outputBytes: number;
  createdAt: number;
  durationMs: number;
};

export type WorkspacePreference = {
  defaultDpi: number;
  splitMode: "single-file" | "file-per-range";
  outputPrefix: string;
  keepRecentCount: number;
};

const DEFAULT_PREFERENCES: WorkspacePreference = {
  defaultDpi: 150,
  splitMode: "single-file",
  outputPrefix: "pdf-vault",
  keepRecentCount: 12
};

export async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS);
      }
      if (!db.objectStoreNames.contains(STORE_RECENTS)) {
        db.createObjectStore(STORE_RECENTS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_RUNS)) {
        const runs = db.createObjectStore(STORE_RUNS, { keyPath: "id" });
        runs.createIndex("createdAt", "createdAt");
      }
    }
  });
}

export async function saveSignature(dataUrl: string) {
  const db = await getDb();
  await db.put(STORE_SETTINGS, dataUrl, "signature");
}

export async function loadSignature() {
  const db = await getDb();
  return (await db.get(STORE_SETTINGS, "signature")) as string | undefined;
}

export async function saveRecents(recents: RecentFile[], maxEntries = DEFAULT_PREFERENCES.keepRecentCount) {
  const db = await getDb();
  const tx = db.transaction(STORE_RECENTS, "readwrite");
  const sorted = [...recents]
    .sort((a, b) => b.lastOpened - a.lastOpened)
    .slice(0, Math.max(1, maxEntries));
  await Promise.all(sorted.map((recent) => tx.store.put(recent)));
  await tx.done;
}

export async function loadRecents() {
  const db = await getDb();
  return (await db.getAll(STORE_RECENTS)) as RecentFile[];
}

export async function touchRecentFiles(files: File[]) {
  if (!files.length) return;
  const existing = await loadRecents();
  const map = new Map<string, RecentFile>(existing.map((item) => [item.id, item]));
  const now = Date.now();

  for (const file of files) {
    const id = `${file.name}-${file.size}`;
    map.set(id, {
      id,
      name: file.name,
      size: file.size,
      lastOpened: now
    });
  }

  await saveRecents(Array.from(map.values()));
}

export async function loadWorkspacePreference(): Promise<WorkspacePreference> {
  const db = await getDb();
  const stored = (await db.get(STORE_SETTINGS, "workspace-preferences")) as Partial<WorkspacePreference> | undefined;
  if (!stored) return DEFAULT_PREFERENCES;
  return {
    defaultDpi: clampPreferenceNumber(stored.defaultDpi, 96, 220, DEFAULT_PREFERENCES.defaultDpi),
    splitMode: stored.splitMode === "file-per-range" ? "file-per-range" : "single-file",
    outputPrefix: (stored.outputPrefix ?? DEFAULT_PREFERENCES.outputPrefix).trim() || DEFAULT_PREFERENCES.outputPrefix,
    keepRecentCount: clampPreferenceNumber(
      stored.keepRecentCount,
      5,
      40,
      DEFAULT_PREFERENCES.keepRecentCount
    )
  };
}

export async function saveWorkspacePreference(next: Partial<WorkspacePreference>) {
  const current = await loadWorkspacePreference();
  const merged: WorkspacePreference = {
    ...current,
    ...next
  };
  const db = await getDb();
  await db.put(STORE_SETTINGS, merged, "workspace-preferences");
}

export async function saveFavoriteTools(tools: ToolSlug[]) {
  const db = await getDb();
  await db.put(STORE_SETTINGS, dedupeTools(tools), "favorite-tools");
}

export async function loadFavoriteTools(): Promise<ToolSlug[]> {
  const db = await getDb();
  const tools = (await db.get(STORE_SETTINGS, "favorite-tools")) as ToolSlug[] | undefined;
  return dedupeTools(tools ?? []);
}

export async function addRunHistory(entry: RunHistoryItem) {
  const db = await getDb();
  const tx = db.transaction(STORE_RUNS, "readwrite");
  await tx.store.put(entry);
  const all = (await tx.store.getAll()) as RunHistoryItem[];
  const maxEntries = 60;
  if (all.length > maxEntries) {
    const oldest = [...all]
      .sort((a, b) => a.createdAt - b.createdAt)
      .slice(0, all.length - maxEntries);
    await Promise.all(oldest.map((item) => tx.store.delete(item.id)));
  }
  await tx.done;
}

export async function loadRunHistory(limit = 25) {
  const db = await getDb();
  const all = (await db.getAll(STORE_RUNS)) as RunHistoryItem[];
  return all.sort((a, b) => b.createdAt - a.createdAt).slice(0, Math.max(1, limit));
}

export async function clearRunHistory() {
  const db = await getDb();
  await db.clear(STORE_RUNS);
}

function clampPreferenceNumber(
  value: number | undefined,
  min: number,
  max: number,
  fallback: number
) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function dedupeTools(tools: ToolSlug[]) {
  const valid = new Set<ToolSlug>([
    "merge",
    "split",
    "sign",
    "redact",
    "compress",
    "rotate",
    "watermark"
  ]);
  const seen = new Set<ToolSlug>();
  const output: ToolSlug[] = [];
  for (const item of tools) {
    if (valid.has(item) && !seen.has(item)) {
      seen.add(item);
      output.push(item);
    }
  }
  return output;
}
