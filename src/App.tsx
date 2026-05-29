import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  Ruler,
  Calculator,
  FolderOpen,
  Save,
  FilePlus,
  FileText,
  Grid3x3,
  CheckCircle2,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { calcAll } from "./lib/calc";
import { yeniIplik, DEFAULT_INFO } from "./lib/factory";
import { defaultDesen } from "./lib/desen";
import type { AnalizState, Iplik } from "./lib/types";
import { listRecords, saveRecord, deleteRecord, type SavedRecord } from "./lib/storage";
import { C } from "./theme";
import { useIsMobile } from "./lib/useIsMobile";
import { AnalizTab } from "./components/AnalizTab";
import { MaliyetTab } from "./components/MaliyetTab";
import { KayitlarTab } from "./components/KayitlarTab";
import { DesenTab } from "./components/DesenTab";

type Tab = "analiz" | "maliyet" | "desen" | "kayitlar";

function createInitialState(): AnalizState {
  return {
    meta: { numuneAd: "", musteri: "", tarih: new Date().toISOString().slice(0, 10) },
    photos: [],
    olcum: { gramajM2: "", tarakEn: "320", mamulEn: "300" },
    cozgu: [yeniIplik({ tip: "DENYE", raw: "75", sik: "40", fiyat: "4" })],
    atki: [yeniIplik({ tip: "DENYE", raw: "150", sik: "22", fiyat: "3" })],
    cekme: { cozgu: { lDuz: "", lKumas: "" }, atki: { lDuz: "", lKumas: "" } },
    params: {
      devir: "280",
      randiman: "85",
      terbiyeFiyat: "1",
      genelFire: "5",
      kursum: "0.2",
      ekMal: "0",
    },
    desen: defaultDesen(),
  };
}

const TABS: { k: Tab; l: string; short: string; I: LucideIcon }[] = [
  { k: "analiz", l: "1 · Analiz", short: "Analiz", I: Ruler },
  { k: "maliyet", l: "2 · Maliyet", short: "Maliyet", I: Calculator },
  { k: "desen", l: "3 · Desen", short: "Desen", I: Grid3x3 },
  { k: "kayitlar", l: "Kayıtlar", short: "Kayıtlar", I: FolderOpen },
];

export default function App() {
  const isMobile = useIsMobile();
  const [tab, setTab] = useState<Tab>("analiz");
  const [state, setState] = useState<AnalizState>(createInitialState);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [records, setRecords] = useState<SavedRecord[]>([]);
  const [flash, setFlash] = useState<{ text: string; ok: boolean } | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState("rapor.pdf");
  const flashTimer = useRef<number | undefined>(undefined);

  const set = (patch: Partial<AnalizState>) => setState((s) => ({ ...s, ...patch }));
  const r = useMemo(() => calcAll(state), [state]);

  const refresh = () => void listRecords().then(setRecords);
  useEffect(() => {
    refresh();
  }, []);

  const showFlash = (text: string, ok = true) => {
    setFlash({ text, ok });
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(null), 2800);
  };

  const handleSave = async () => {
    const res = await saveRecord(state, r.total, currentId);
    if (res.ok && res.record) {
      setCurrentId(res.record.id);
      refresh();
      showFlash(`Kaydedildi: ${res.record.ad}`);
    } else {
      showFlash("Kaydedilemedi: " + (res.error ?? "bilinmeyen hata"), false);
    }
  };

  const handlePdf = async () => {
    showFlash("PDF hazırlanıyor…");
    try {
      const { buildReportBlob, reportFilename } = await import("./pdf/generateReport");
      const blob = await buildReportBlob(state, r);
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfUrl(URL.createObjectURL(blob));
      setPdfName(reportFilename(state));
      setFlash(null);
    } catch (e) {
      showFlash("PDF oluşturulamadı: " + (e instanceof Error ? e.message : String(e)), false);
    }
  };

  const closePdf = () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
  };

  const downloadPdf = () => {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = pdfName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleNew = () => {
    setState(createInitialState());
    setCurrentId(null);
    setTab("analiz");
    showFlash("Yeni numune başlatıldı");
  };

  const handleLoad = (rec: SavedRecord) => {
    // Eski kayitlarda info / contents / desen olmayabilir -> normalize et
    const normalize = (arr: Iplik[]) =>
      arr.map((it) => ({
        ...it,
        info: it.info ?? { ...DEFAULT_INFO },
        contents: it.contents ?? [],
      }));
    setState({
      ...rec.state,
      cozgu: normalize(rec.state.cozgu),
      atki: normalize(rec.state.atki),
      desen: rec.state.desen ?? defaultDesen(),
    });
    setCurrentId(rec.id);
    setTab("analiz");
    showFlash(`Yüklendi: ${rec.ad}`);
  };

  const handleDelete = async (id: string) => {
    await deleteRecord(id);
    if (currentId === id) setCurrentId(null);
    refresh();
  };

  const currentName = records.find((x) => x.id === currentId)?.ad;

  const ghostBtn: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    background: "transparent",
    border: `1px solid ${C.line}`,
    color: C.text,
    borderRadius: 9,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
  };
  const primaryBtn: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    background: C.accent,
    border: `1px solid ${C.accent}`,
    color: "#fff",
    borderRadius: 9,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 13,
  };

  return (
    <div
      style={{
        background: C.bg,
        color: C.text,
        minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "0 0 40px",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(15,17,21,0.92)",
          backdropFilter: "blur(8px)",
          borderBottom: `1px solid ${C.line}`,
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: isMobile ? "10px 12px" : "14px 20px",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "stretch" : "center",
            gap: isMobile ? 10 : 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: `linear-gradient(135deg, ${C.accent}, ${C.weft})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 13,
              }}
            >
              Tx
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1 }}>
                Numune Analiz & Maliyet
              </div>
              <div style={{ fontSize: 10, color: C.dim, letterSpacing: 1 }}>
                TexAI · TASLAK v0.2
              </div>
            </div>
          </div>
          <div
            style={{
              marginLeft: isMobile ? 0 : "auto",
              display: "flex",
              background: C.panel,
              border: `1px solid ${C.line}`,
              borderRadius: 10,
              padding: 3,
            }}
          >
            {TABS.map(({ k, l, short, I }) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                style={{
                  flex: isMobile ? 1 : undefined,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 7,
                  border: "none",
                  cursor: "pointer",
                  background: tab === k ? C.accent : "transparent",
                  color: tab === k ? "#fff" : C.dim,
                  fontWeight: 600,
                  fontSize: 13,
                  whiteSpace: "nowrap",
                }}
              >
                <I size={15} /> {isMobile ? short : l}
                {k === "kayitlar" && records.length > 0 ? ` (${records.length})` : ""}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: isMobile ? "12px" : "20px",
          display: "grid",
          gap: isMobile ? 12 : 16,
        }}
      >
        {tab !== "kayitlar" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 6,
                minWidth: 0,
                color: flash ? (flash.ok ? C.ok : C.bad) : C.dim,
              }}
            >
              {flash ? (
                <>
                  {flash.ok ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                  {flash.text}
                </>
              ) : currentId ? (
                <>
                  Kayıt: <b style={{ color: C.text }}>{currentName}</b>
                </>
              ) : (
                "Kaydedilmemiş numune"
              )}
            </span>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button onClick={handleNew} style={ghostBtn}>
                <FilePlus size={15} /> Yeni
              </button>
              <button onClick={handlePdf} style={ghostBtn}>
                <FileText size={15} /> PDF
              </button>
              <button onClick={handleSave} style={primaryBtn}>
                <Save size={15} /> Kaydet
              </button>
            </div>
          </div>
        )}

        {tab === "analiz" && (
          <AnalizTab
            state={state}
            set={set}
            setState={setState}
            onNext={() => setTab("maliyet")}
          />
        )}
        {tab === "maliyet" && <MaliyetTab state={state} set={set} r={r} />}
        {tab === "desen" && (
          <DesenTab desen={state.desen} onChange={(dd) => set({ desen: dd })} />
        )}
        {tab === "kayitlar" && (
          <KayitlarTab
            records={records}
            currentId={currentId}
            onLoad={handleLoad}
            onDelete={handleDelete}
          />
        )}
      </div>

      {pdfUrl && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(0,0,0,0.72)",
            display: "flex",
            flexDirection: "column",
            padding: isMobile ? 8 : 20,
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>PDF Önizleme</span>
            <span style={{ fontSize: 11, color: "#cbd5e1" }}>{pdfName}</span>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button onClick={downloadPdf} style={primaryBtn}>
                <FileText size={15} /> İndir
              </button>
              <button
                onClick={closePdf}
                style={{ ...ghostBtn, color: "#fff", borderColor: "#ffffff55" }}
              >
                Kapat
              </button>
            </div>
          </div>
          <iframe
            title="PDF önizleme"
            src={pdfUrl}
            style={{ flex: 1, width: "100%", border: "none", borderRadius: 8, background: "#fff" }}
          />
        </div>
      )}
    </div>
  );
}
