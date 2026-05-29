import { useMemo, useState } from "react";
import { Ruler, Calculator, type LucideIcon } from "lucide-react";
import { calcAll } from "./lib/calc";
import { yeniIplik } from "./lib/factory";
import type { AnalizState } from "./lib/types";
import { C } from "./theme";
import { AnalizTab } from "./components/AnalizTab";
import { MaliyetTab } from "./components/MaliyetTab";

type Tab = "analiz" | "maliyet";

const initialState: AnalizState = {
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
};

const TABS: { k: Tab; l: string; I: LucideIcon }[] = [
  { k: "analiz", l: "1 · Analiz", I: Ruler },
  { k: "maliyet", l: "2 · Maliyet & Doğrulama", I: Calculator },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("analiz");
  const [state, setState] = useState<AnalizState>(initialState);

  const set = (patch: Partial<AnalizState>) => setState((s) => ({ ...s, ...patch }));
  const r = useMemo(() => calcAll(state), [state]);

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
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            gap: 14,
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
              marginLeft: "auto",
              display: "flex",
              background: C.panel,
              border: `1px solid ${C.line}`,
              borderRadius: 10,
              padding: 3,
            }}
          >
            {TABS.map(({ k, l, I }) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 7,
                  border: "none",
                  cursor: "pointer",
                  background: tab === k ? C.accent : "transparent",
                  color: tab === k ? "#fff" : C.dim,
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                <I size={15} /> {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "20px",
          display: "grid",
          gap: 16,
        }}
      >
        {tab === "analiz" && (
          <AnalizTab
            state={state}
            set={set}
            setState={setState}
            onNext={() => setTab("maliyet")}
          />
        )}
        {tab === "maliyet" && <MaliyetTab state={state} set={set} r={r} />}
      </div>
    </div>
  );
}
