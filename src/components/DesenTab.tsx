import type { ReactNode } from "react";
import { Grid3x3, Wand2, Eraser, Minus, Plus } from "lucide-react";
import type { DesenState } from "../lib/types";
import {
  computeDesen,
  buildDuzTahar,
  buildEmptyArmur,
  setDimension,
  IRO_COLORS,
  MIN_WARP,
  MAX_WARP,
  MIN_WEFT,
  MAX_WEFT,
  MIN_FRAME,
  MAX_FRAME,
  MIN_IRO,
  MAX_IRO,
} from "../lib/desen";
import { C, btnAdd } from "../theme";
import { Card } from "./Card";

const CELL = 22;
const PREV = 14;

interface DesenTabProps {
  desen: DesenState;
  onChange: (d: DesenState) => void;
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const btn = (txt: ReactNode, dv: number, disabled: boolean) => (
    <button
      onClick={() => onChange(value + dv)}
      disabled={disabled}
      style={{
        width: 26,
        height: 26,
        borderRadius: 6,
        border: `1px solid ${C.line}`,
        background: C.bg,
        color: disabled ? C.line : C.text,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {txt}
    </button>
  );
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 11, color: C.dim }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {btn(<Minus size={14} />, -1, value <= min)}
        <span style={{ width: 28, textAlign: "center", fontFamily: "ui-monospace, monospace", fontSize: 14, fontWeight: 700 }}>
          {value}
        </span>
        {btn(<Plus size={14} />, +1, value >= max)}
      </div>
    </label>
  );
}

function colHeader(count: number, renk: (i: number) => string, prefix: string) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      <span style={{ width: 28 }} />
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={{ width: CELL, fontSize: 8, color: renk(i), textAlign: "center", fontWeight: 700 }}>
          {prefix}
          {i + 1}
        </span>
      ))}
    </div>
  );
}

const rowLabel = (n: number) => (
  <span style={{ width: 28, fontSize: 10, color: C.dim, textAlign: "right", paddingRight: 4 }}>{n}</span>
);

const cell = (key: number, filled: boolean, bg: string, onClick?: () => void) => (
  <div
    key={key}
    onClick={onClick}
    style={{
      width: CELL,
      height: CELL,
      borderRadius: 3,
      border: `1px solid ${C.line}`,
      background: filled ? bg : C.bg,
      cursor: onClick ? "pointer" : "default",
    }}
  />
);

function TaharGrid({ desen: d, onChange }: DesenTabProps) {
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "inline-flex", flexDirection: "column", gap: 2 }}>
        {Array.from({ length: d.frameCount }).map((_, top) => {
          const f = d.frameCount - 1 - top;
          return (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <span style={{ width: 28, fontSize: 10, color: C.dim, textAlign: "right", paddingRight: 4 }}>
                F{f + 1}
              </span>
              {Array.from({ length: d.warpCount }).map((__, w) =>
                cell(w, d.tahar[w] === f, C.accent, () =>
                  onChange({ ...d, tahar: d.tahar.map((t, i) => (i === w ? f : t)) }),
                ),
              )}
            </div>
          );
        })}
        {colHeader(d.warpCount, () => C.dim, "")}
      </div>
    </div>
  );
}

function ArmurGrid({ desen: d, onChange }: DesenTabProps) {
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "inline-flex", flexDirection: "column", gap: 2 }}>
        {colHeader(d.frameCount, () => C.dim, "F")}
        {Array.from({ length: d.weftCount }).map((_, top) => {
          const p = d.weftCount - 1 - top;
          return (
            <div key={p} style={{ display: "flex", alignItems: "center", gap: 2 }}>
              {rowLabel(p + 1)}
              {Array.from({ length: d.frameCount }).map((__, f) =>
                cell(f, !!d.armur[f]?.[p], C.accent, () =>
                  onChange({
                    ...d,
                    armur: d.armur.map((row, fi) =>
                      fi === f ? row.map((c, pi) => (pi === p ? !c : c)) : row,
                    ),
                  }),
                ),
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AtkiRaporGrid({ desen: d, onChange }: DesenTabProps) {
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "inline-flex", flexDirection: "column", gap: 2 }}>
        {colHeader(d.iroCount, (i) => IRO_COLORS[i % IRO_COLORS.length], "i")}
        {Array.from({ length: d.weftCount }).map((_, top) => {
          const p = d.weftCount - 1 - top;
          return (
            <div key={p} style={{ display: "flex", alignItems: "center", gap: 2 }}>
              {rowLabel(p + 1)}
              {Array.from({ length: d.iroCount }).map((__, i) =>
                cell(i, d.iroData[p] === i + 1, IRO_COLORS[i % IRO_COLORS.length], () =>
                  onChange({ ...d, iroData: d.iroData.map((v, pi) => (pi === p ? i + 1 : v)) }),
                ),
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DesenPreview({ d }: { d: DesenState }) {
  const desen = computeDesen(d.tahar, d.armur, d.weftCount);
  const cols = d.warpCount * Math.max(1, d.raporX);
  const rows = d.weftCount * Math.max(1, d.raporY);
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "inline-flex", flexDirection: "column", border: `1px solid ${C.line}` }}>
        {Array.from({ length: rows }).map((_, top) => {
          const p = (rows - 1 - top) % d.weftCount;
          return (
            <div key={top} style={{ display: "flex" }}>
              {Array.from({ length: cols }).map((__, col) => {
                const w = col % d.warpCount;
                const filled = !!desen[w]?.[p];
                return (
                  <div
                    key={col}
                    style={{
                      width: PREV,
                      height: PREV,
                      background: filled ? C.text : "transparent",
                      borderRight: `0.5px solid ${C.line}`,
                      borderBottom: `0.5px solid ${C.line}`,
                    }}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DesenTab({ desen: d, onChange }: DesenTabProps) {
  const dimStep = (
    dim: "warpCount" | "weftCount" | "frameCount" | "iroCount",
  ): ((v: number) => void) => (v) => onChange(setDimension(d, dim, v));
  const rapor = (key: "raporX" | "raporY"): ((v: number) => void) => (v) =>
    onChange({ ...d, [key]: Math.max(1, Math.min(8, v)) });

  return (
    <>
      <Card title="Desen Boyutları" icon={<Grid3x3 size={16} color={C.accent} />}>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          <Stepper label="Çözgü (warp)" value={d.warpCount} min={MIN_WARP} max={MAX_WARP} onChange={dimStep("warpCount")} />
          <Stepper label="Atkı (weft)" value={d.weftCount} min={MIN_WEFT} max={MAX_WEFT} onChange={dimStep("weftCount")} />
          <Stepper label="Çerçeve" value={d.frameCount} min={MIN_FRAME} max={MAX_FRAME} onChange={dimStep("frameCount")} />
          <Stepper label="İro (renk)" value={d.iroCount} min={MIN_IRO} max={MAX_IRO} onChange={dimStep("iroCount")} />
          <Stepper label="Rapor X" value={d.raporX} min={1} max={8} onChange={rapor("raporX")} />
          <Stepper label="Rapor Y" value={d.raporY} min={1} max={8} onChange={rapor("raporY")} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          <button
            onClick={() => onChange({ ...d, tahar: buildDuzTahar(d.warpCount, d.frameCount) })}
            style={{ ...btnAdd(C.accent), width: "auto", marginTop: 0 }}
          >
            <Wand2 size={14} /> Düz tahar
          </button>
          <button
            onClick={() => onChange({ ...d, armur: buildEmptyArmur(d.frameCount, d.weftCount) })}
            style={{ ...btnAdd(C.dim), width: "auto", marginTop: 0 }}
          >
            <Eraser size={14} /> Armür temizle
          </button>
        </div>
      </Card>

      <Card title="Tahar — çözgü hangi çerçeveden" icon={<Grid3x3 size={16} color={C.warp} />} accent={C.warp}>
        <TaharGrid desen={d} onChange={onChange} />
      </Card>

      <Card title="Armür — kaldırma planı (çerçeve × atkı)" icon={<Grid3x3 size={16} color={C.accent} />} accent={C.accent}>
        <ArmurGrid desen={d} onChange={onChange} />
      </Card>

      <Card title="Desen — otomatik (tahar + armür)" icon={<Grid3x3 size={16} color={C.text} />}>
        <DesenPreview d={d} />
      </Card>

      <Card title="Atkı Raporu — iro / renk sırası" icon={<Grid3x3 size={16} color={C.weft} />} accent={C.weft}>
        <AtkiRaporGrid desen={d} onChange={onChange} />
      </Card>
    </>
  );
}
