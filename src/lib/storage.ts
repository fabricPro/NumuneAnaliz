import type { AnalizState } from "./types";

// IndexedDB — localStorage'tan cok daha buyuk kota (yuzlerce MB+), tam
// cozunurluklu fotograflar (base64) rahat sigar.
const DB_NAME = "numune-analiz";
const STORE = "kayitlar";
const OLD_KEY = "numune-analiz:kayitlar:v1"; // eski localStorage anahtari

export interface SavedRecord {
  id: string;
  ad: string;
  musteri: string;
  tarih: string;
  /** Kaydedilme zamani (ISO) */
  savedAt: string;
  /** Liste gosterimi icin onbellek: toplam $/mt */
  total: number;
  /** Tam analiz anlik goruntusu (fotograflar dahil) */
  state: AnalizState;
}

export interface SaveResult {
  ok: boolean;
  record?: SavedRecord;
  error?: string;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function run<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = fn(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        t.oncomplete = () => db.close();
      }),
  );
}

// Eski localStorage kayitlarini (varsa) bir kez IndexedDB'ye tasi.
let migration: Promise<void> | null = null;
function migrate(): Promise<void> {
  migration ??= (async () => {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(OLD_KEY);
    } catch {
      return;
    }
    if (!raw) return;
    try {
      const arr = JSON.parse(raw) as SavedRecord[];
      if (Array.isArray(arr)) {
        for (const rec of arr) {
          if (rec && rec.id) await run("readwrite", (s) => s.put(rec));
        }
      }
      localStorage.removeItem(OLD_KEY);
    } catch {
      // bozuk veri -> atla
    }
  })();
  return migration;
}

/** Yeniden eskiye sirali kayit listesi. */
export async function listRecords(): Promise<SavedRecord[]> {
  try {
    await migrate();
    const all = await run<SavedRecord[]>(
      "readonly",
      (s) => s.getAll() as IDBRequest<SavedRecord[]>,
    );
    return all.sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1));
  } catch {
    return [];
  }
}

/** Mevcut id varsa gunceller, yoksa yeni kayit olusturur. */
export async function saveRecord(
  state: AnalizState,
  total: number,
  existingId: string | null,
): Promise<SaveResult> {
  const record: SavedRecord = {
    id: existingId ?? crypto.randomUUID(),
    ad: state.meta.numuneAd.trim() || "İsimsiz numune",
    musteri: state.meta.musteri,
    tarih: state.meta.tarih,
    savedAt: new Date().toISOString(),
    total,
    state,
  };
  try {
    await run("readwrite", (s) => s.put(record));
    return { ok: true, record };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function deleteRecord(id: string): Promise<void> {
  try {
    await run("readwrite", (s) => s.delete(id));
  } catch {
    // yoksay
  }
}
