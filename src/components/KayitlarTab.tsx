import { Trash2, FolderOpen } from "lucide-react";
import type { SavedRecord } from "../lib/storage";
import { fmt } from "../lib/format";
import { C } from "../theme";
import { Card } from "./Card";

interface KayitlarTabProps {
  records: SavedRecord[];
  currentId: string | null;
  onLoad: (r: SavedRecord) => void;
  onDelete: (id: string) => void;
}

export function KayitlarTab({ records, currentId, onLoad, onDelete }: KayitlarTabProps) {
  return (
    <Card
      title={`Kayıtlı Numuneler (${records.length})`}
      icon={<FolderOpen size={16} color={C.accent} />}
    >
      {records.length === 0 ? (
        <div style={{ padding: "24px 8px", textAlign: "center", color: C.dim, fontSize: 13 }}>
          Henüz kayıt yok. Bir analiz yapıp üstteki{" "}
          <b style={{ color: C.text }}>Kaydet</b> butonuna bas.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {records.map((r) => {
            const active = r.id === currentId;
            return (
              <div
                key={r.id}
                onClick={() => onLoad(r)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 10,
                  cursor: "pointer",
                  background: active ? `${C.accent}14` : C.bg,
                  border: `1px solid ${active ? C.accent + "66" : C.line}`,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "ui-monospace, monospace",
                      fontWeight: 700,
                      fontSize: 14,
                      color: active ? C.accent : C.text,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {r.ad}
                  </div>
                  <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>
                    {r.musteri || "—"} · {r.tarih} ·{" "}
                    {new Date(r.savedAt).toLocaleString("tr-TR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "ui-monospace, monospace",
                    fontSize: 14,
                    color: C.text,
                    whiteSpace: "nowrap",
                  }}
                >
                  {fmt(r.total, 3)} <span style={{ fontSize: 10, color: C.dim }}>$/mt</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`"${r.ad}" kaydını sil?`)) onDelete(r.id);
                  }}
                  title="Sil"
                  style={{
                    width: 34,
                    height: 34,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "transparent",
                    border: `1px solid ${C.line}`,
                    borderRadius: 8,
                    color: C.bad,
                    cursor: "pointer",
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
