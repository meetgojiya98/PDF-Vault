import { openDB } from "idb";

const DB_NAME = "pdf-toolbox";
const DB_VERSION = 1;
const STORE_SETTINGS = "settings";
const STORE_RECENTS = "recents";

export type RecentFile = {
  id: string;
  name: string;
  size: number;
  lastOpened: number;
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

export async function saveRecents(recents: RecentFile[]) {
  const db = await getDb();
  const tx = db.transaction(STORE_RECENTS, "readwrite");
  await Promise.all(recents.map((recent) => tx.store.put(recent)));
  await tx.done;
}

export async function loadRecents() {
  const db = await getDb();
  return (await db.getAll(STORE_RECENTS)) as RecentFile[];
}
