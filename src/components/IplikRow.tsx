import { Trash2, Scale, ChevronUp, ChevronDown } from "lucide-react";
import { parseIplikRaw, num } from "../lib/calc";
import { fmt } from "../lib/format";
import { TIPLER, type IplikTip } from "../lib/fpd";
import type { Iplik } from "../lib/types";
import { C } from "../theme";
import { Field } from "./Field";
import { OlcumPanel } from "./OlcumPanel";

interface IplikRowProps {
  row: Iplik;
  onChange: (row: Iplik) => void;
  onDelete: () => void;
  sikLabel: string;
  color: string;
}

export function IplikRow({ row, onChange, onDelete, sikLabel, color }: IplikRowProps) {
  const { denye, kat } = parseIplikRaw(row.raw);
  const olcumDolu = num(row.olcum.agirlik) > 0 && num(row.olcum.uzunluk) > 0;

  const applyOlcum = (sistem: IplikTip, val: number) => {
    const cKat = parseIplikRaw(row.raw).kat;
    const rounded =
      sistem === "DENYE" || sistem === "DTEX"
        ? Math.round(val * 10) / 10
        : Math.round(val * 100) / 100;
    const newRaw = cKat > 1 ? `${rounded}*${cKat}` : `${rounded}`;
    onChange({ ...row, tip: sistem, raw: newRaw });
  };

  return (
    <div style={{ padding: "10px 0", borderBottom: `1px solid ${C.line}` }}>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        <div
          style={{
            width: 4,
            alignSelf: "stretch",
            background: color,
            borderRadius: 2,
          }}
        />
        <label style={{ display: "flex", flexDirection: "column", gap: 4, width: 88 }}>
          <span style={{ fontSize: 11, color: C.dim }}>Tip</span>
          <select
            value={row.tip}
            onChange={(e) => onChange({ ...row, tip: e.target.value as IplikTip })}
            style={{
              background: C.bg,
              border: `1px solid ${C.line}`,
              borderRadius: 8,
              color: C.text,
              padding: "9px 6px",
              fontSize: 13,
            }}
          >
            {TIPLER.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <div style={{ flex: 1.2 }}>
          <Field
            label="İplik (örn 300*2)"
            value={row.raw}
            onChange={(v) => onChange({ ...row, raw: v })}
            placeholder="kalınlık*kat"
          />
          <span style={{ display: "block", marginTop: 4, fontSize: 10, color: C.dim }}>
            → no {fmt(denye, 0)} · {kat} kat
          </span>
        </div>
        <Field
          label={sikLabel}
          value={row.sik}
          onChange={(v) => onChange({ ...row, sik: v })}
          w={92}
          suffix="ad/cm"
        />
        <Field
          label="Fiyat"
          value={row.fiyat}
          onChange={(v) => onChange({ ...row, fiyat: v })}
          w={88}
          suffix="$/kg"
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span aria-hidden style={{ fontSize: 11, visibility: "hidden", userSelect: "none" }}>
            ·
          </span>
          <button
            onClick={() => onChange({ ...row, olcum: { ...row.olcum, acik: !row.olcum.acik } })}
            title="İplik ölçüm hesaplayıcı"
            style={{
              height: 38,
              background: row.olcum.acik
                ? `${color}25`
                : olcumDolu
                  ? `${color}12`
                  : "transparent",
              border: `1px solid ${olcumDolu ? color + "66" : C.line}`,
              borderRadius: 8,
              color: olcumDolu ? color : C.dim,
              padding: "0 8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            <Scale size={14} />{" "}
            {row.olcum.acik ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span aria-hidden style={{ fontSize: 11, visibility: "hidden", userSelect: "none" }}>
            ·
          </span>
          <button
            onClick={onDelete}
            title="Sil"
            style={{
              height: 38,
              width: 38,
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
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      {row.olcum.acik && (
        <OlcumPanel
          olcum={row.olcum}
          color={color}
          onChange={(o) => onChange({ ...row, olcum: { ...o, acik: true } })}
          onApply={applyOlcum}
        />
      )}
    </div>
  );
}
