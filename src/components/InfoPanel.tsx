import { Info } from "lucide-react";
import type { IplikInfo } from "../lib/types";
import { C } from "../theme";
import { Field } from "./Field";

interface InfoPanelProps {
  info: IplikInfo;
  onChange: (info: IplikInfo) => void;
  color: string;
}

export function InfoPanel({ info, onChange, color }: InfoPanelProps) {
  return (
    <div
      style={{
        background: C.bg,
        border: `1px solid ${color}33`,
        borderRadius: 10,
        padding: 12,
        marginTop: 6,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <Info size={14} color={color} />
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color,
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          İplik bilgisi
        </span>
        <span style={{ marginLeft: "auto", fontSize: 10, color: C.dim }}>
          sadece bilgi — maliyeti etkilemez
        </span>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Field
          label="İplik adı"
          value={info.iplikAdi}
          onChange={(v) => onChange({ ...info, iplikAdi: v })}
          placeholder="örn. pamuk 30/1"
        />
        <Field
          label="Firma adı"
          value={info.firmaAdi}
          onChange={(v) => onChange({ ...info, firmaAdi: v })}
        />
      </div>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginTop: 12,
          cursor: "pointer",
          fontSize: 13,
          color: C.text,
        }}
      >
        <input
          type="checkbox"
          checked={info.fason}
          onChange={(e) => onChange({ ...info, fason: e.target.checked })}
          style={{ width: 16, height: 16, accentColor: color, cursor: "pointer" }}
        />
        Fason işlem var
      </label>

      {info.fason && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
          <Field
            label="Fason firma"
            value={info.fasonFirma}
            onChange={(v) => onChange({ ...info, fasonFirma: v })}
          />
          <Field
            label="Fason işlem"
            value={info.fasonIslem}
            onChange={(v) => onChange({ ...info, fasonIslem: v })}
            placeholder="örn. büküm"
          />
          <Field
            label="Fason fiyat"
            value={info.fasonFiyat}
            onChange={(v) => onChange({ ...info, fasonFiyat: v })}
          />
        </div>
      )}
    </div>
  );
}
