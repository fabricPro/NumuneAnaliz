import type { AnalizState } from "./types";

const KEY = "numune-analiz:kayitlar:v1";

export interface SavedRecord {
  id: string;
  ad: string;
  musteri: string;
  tarih: string;
  /** Kaydedilme zamani (ISO) */
  savedAt: string;
  /** Liste gosterimi icin onbellek: toplam $/mt */
  total: number;
  /** Tam analiz anlik goruntusu */
  state: AnalizState;
}

export interface SaveResult {
  ok: boolean;
  record?: SavedRecord;
  error?: string;
}

function read(): SavedRecord[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr: unknown = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as SavedRecord[]) : [];
  } catch {
    return [];
  }
}

function write(records: SavedRecord[]): void {
  localStorage.setItem(KEY, JSON.stringify(records));
}

/** Yeniden eskiye sirali kayit listesi. */
export function listRecords(): SavedRecord[] {
  return read().sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1));
}

/** Mevcut id varsa gunceller, yoksa yeni kayit olusturur. */
export function saveRecord(
  state: AnalizState,
  total: number,
  existingId: string | null,
): SaveResult {
  const records = read();
  const now = new Date().toISOString();
  const ad = state.meta.numuneAd.trim() || "İsimsiz numune";
  const base = { ad, musteri: state.meta.musteri, tarih: state.meta.tarih, savedAt: now, total, state };

  let record: SavedRecord;
  const idx = existingId ? records.findIndex((r) => r.id === existingId) : -1;
  if (idx >= 0) {
    record = { ...records[idx], ...base };
    records[idx] = record;
  } else {
    record = { id: crypto.randomUUID(), ...base };
    records.push(record);
  }

  try {
    write(records);
    return { ok: true, record };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export function deleteRecord(id: string): void {
  write(read().filter((r) => r.id !== id));
}
