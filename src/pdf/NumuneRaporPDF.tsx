import "./font";
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { AnalizState, CalcResult, Iplik } from "../lib/types";
import { num, parseIplikRaw, tukH, atkiGramaj, cekmeOran } from "../lib/calc";
import { nf } from "../lib/format";
import { computeDesen, IRO_COLORS } from "../lib/desen";

const P = {
  text: "#0f172a",
  muted: "#64748b",
  line: "#cbd5e1",
  bgMuted: "#eef2f7",
  bgRow: "#f8fafc",
  accent: "#3b6fd4",
  accentDark: "#27468f",
  headerBg: "#eef3fc",
  warp: "#b9791a",
  weft: "#2e8a7f",
  ok: "#16a34a",
  warn: "#d97706",
  bad: "#dc2626",
  white: "#ffffff",
};

const s = StyleSheet.create({
  page: { padding: 26, fontFamily: "Geist", fontSize: 9, color: P.text, lineHeight: 1.35 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: P.headerBg,
    borderLeftWidth: 4,
    borderLeftColor: P.accent,
    borderRadius: 6,
    padding: 12,
    marginBottom: 14,
  },
  brand: { fontSize: 20, fontWeight: 700, color: P.accentDark, letterSpacing: 0.5 },
  brandSub: { fontSize: 9, color: P.muted, marginTop: 8 },
  metaRight: { textAlign: "right" },
  metaName: { fontSize: 12, fontWeight: 700, color: P.text },
  metaLine: { fontSize: 9, color: P.muted, marginTop: 2 },

  statRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  stat: { flex: 1, borderWidth: 1, borderColor: P.line, borderRadius: 6, paddingTop: 8, paddingBottom: 12, paddingHorizontal: 8, backgroundColor: P.bgRow },
  statLabel: { fontSize: 8, color: P.muted, textTransform: "uppercase", letterSpacing: 0.4 },
  statValue: { fontSize: 17, fontWeight: 700, marginTop: 3 },
  statUnit: { fontSize: 8, color: P.muted, fontWeight: 400 },
  durumPill: {
    alignSelf: "flex-start",
    color: P.white,
    fontSize: 8,
    fontWeight: 700,
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 9,
    marginTop: 7,
    marginBottom: 2,
  },

  section: { marginBottom: 12 },
  secTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: P.text,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: P.line,
    paddingBottom: 3,
    marginBottom: 6,
  },
  gridTitle: { fontSize: 9, fontWeight: 700, color: P.text, marginTop: 8, marginBottom: 4 },

  table: { borderWidth: 1, borderColor: P.line, borderRadius: 4, marginBottom: 4 },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: P.line },
  trLast: { borderBottomWidth: 0 },
  trHead: { backgroundColor: P.bgMuted },
  trTotal: { backgroundColor: P.bgRow },
  th: { fontSize: 8, fontWeight: 700, color: P.muted, padding: 4 },
  td: { fontSize: 9, padding: 4 },
  sub: { fontSize: 7.5, marginTop: 1 },
  right: { textAlign: "right" },

  twoCol: { flexDirection: "row", gap: 12 },
  col: { flex: 1 },
  kv: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  kvLabel: { color: P.muted },
  kvVal: { fontWeight: 700 },
  note: { fontSize: 8, color: P.muted, marginTop: 2 },

  photoWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  photo: { width: 120, height: 120, objectFit: "cover", borderWidth: 1, borderColor: P.line, borderRadius: 4 },

  footer: {
    position: "absolute",
    bottom: 14,
    left: 26,
    right: 26,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: P.muted,
    borderTopWidth: 1,
    borderTopColor: P.line,
    paddingTop: 4,
  },
});

const COLS = [
  { key: "tip", label: "Tip", flex: 1.1 },
  { key: "no", label: "İplik (no × kat)", flex: 2.2 },
  { key: "sik", label: "Sıklık", flex: 1.0, right: true },
  { key: "fiyat", label: "Fiyat $/kg", flex: 1.1, right: true },
  { key: "gramaj", label: "Gramaj g/mt", flex: 1.2, right: true },
];

function IplikTablo({
  rows,
  baslik,
  renk,
  atki,
  tarakEn,
  fak,
}: {
  rows: Iplik[];
  baslik: string;
  renk: string;
  atki: boolean;
  tarakEn: number;
  fak: number;
}) {
  let toplam = 0;
  const data = rows.map((row) => {
    const { denye, kat } = parseIplikRaw(row.raw);
    const tel = atki ? num(row.sik) * 100 : num(row.sik) * tarakEn;
    const g = atki
      ? atkiGramaj(row.tip, denye, kat, tel, tarakEn, fak)
      : tukH(row.tip, denye, kat, tel, fak);
    toplam += g;
    const adFirma = [row.info?.iplikAdi, row.info?.firmaAdi].filter(Boolean).join(" · ");
    const uz = num(row.olcum?.uzunluk);
    const ag = num(row.olcum?.agirlik);
    const olculdu = uz > 0 && ag > 0;
    return { row, denye, kat, g, adFirma, uz, ag, olculdu };
  });

  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={{ fontSize: 9, fontWeight: 700, color: renk, marginBottom: 3 }}>{baslik}</Text>
      <View style={s.table}>
        <View style={[s.tr, s.trHead]}>
          {COLS.map((c) => (
            <Text key={c.key} style={[s.th, { flex: c.flex }, c.right ? s.right : {}]}>
              {c.label}
            </Text>
          ))}
        </View>
        {data.map(({ row, denye, kat, g, adFirma, uz, ag, olculdu }, i) => (
          <View key={row.id} style={[s.tr, i === data.length - 1 ? s.trLast : {}]}>
            <Text style={[s.td, { flex: COLS[0].flex }]}>{row.tip}</Text>
            <View style={{ flex: COLS[1].flex, padding: 4 }}>
              <Text style={{ fontSize: 9 }}>
                {nf(denye, 0)} × {kat}
              </Text>
              {adFirma ? <Text style={[s.sub, { color: P.muted }]}>{adFirma}</Text> : null}
              {olculdu ? (
                <Text style={[s.sub, { color: P.accent }]}>
                  ölçüm: {nf(uz, 0)} cm × {nf(num(row.olcum.adet), 0)} / {nf(ag, 1)} mg
                </Text>
              ) : null}
            </View>
            <Text style={[s.td, { flex: COLS[2].flex }, s.right]}>{nf(num(row.sik), 1)}</Text>
            <Text style={[s.td, { flex: COLS[3].flex }, s.right]}>{nf(num(row.fiyat), 2)}</Text>
            <Text style={[s.td, { flex: COLS[4].flex }, s.right]}>{nf(g, 1)}</Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
        <Text style={{ fontSize: 9, fontWeight: 700 }}>
          Toplam {baslik.toLowerCase()} gramaj: {nf(toplam, 1)} g/mt
        </Text>
      </View>
    </View>
  );
}

function Stat({ label, value, unit, color }: { label: string; value: string; unit?: string; color?: string }) {
  return (
    <View style={s.stat}>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={[s.statValue, color ? { color } : {}]}>
        {value}
        {unit ? <Text style={s.statUnit}> {unit}</Text> : null}
      </Text>
    </View>
  );
}

function fitSize(cols: number, maxPt = 8): number {
  return Math.max(2, Math.min(maxPt, Math.floor(520 / Math.max(1, cols))));
}

function MatrixGrid({
  rows,
  cols,
  isOn,
  fill,
  size,
}: {
  rows: number;
  cols: number;
  isOn: (r: number, c: number) => boolean;
  fill: (r: number, c: number) => string;
  size: number;
}) {
  return (
    <View style={{ flexDirection: "column", borderTopWidth: 0.5, borderLeftWidth: 0.5, borderColor: "#999" }}>
      {Array.from({ length: rows }).map((_, rr) => (
        <View key={rr} style={{ flexDirection: "row" }}>
          {Array.from({ length: cols }).map((__, cc) => (
            <View
              key={cc}
              style={{
                width: size,
                height: size,
                borderRightWidth: 0.5,
                borderBottomWidth: 0.5,
                borderColor: "#999",
                backgroundColor: isOn(rr, cc) ? fill(rr, cc) : "#ffffff",
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const AXIS_W = 12;
const AXIS_FS = 6;
const AXIS_COLOR = "#666";

function LabeledMatrixGrid({
  rows,
  cols,
  isOn,
  fill,
  size,
  leftLabels,
  bottomLabels,
}: {
  rows: number;
  cols: number;
  isOn: (r: number, c: number) => boolean;
  fill: (r: number, c: number) => string;
  size: number;
  /** length = rows; rendered top-to-bottom (index 0 = top row) */
  leftLabels?: (string | number)[];
  /** length = cols; rendered left-to-right (index 0 = left column) */
  bottomLabels?: (string | number)[];
}) {
  return (
    <View>
      <View style={{ flexDirection: "row" }}>
        {leftLabels && (
          <View style={{ flexDirection: "column", marginRight: 2 }}>
            {leftLabels.map((label, i) => (
              <View
                key={i}
                style={{
                  width: AXIS_W,
                  height: size,
                  alignItems: "flex-end",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: AXIS_FS, color: AXIS_COLOR }}>{String(label)}</Text>
              </View>
            ))}
          </View>
        )}
        <MatrixGrid rows={rows} cols={cols} isOn={isOn} fill={fill} size={size} />
      </View>
      {bottomLabels && (
        <View style={{ flexDirection: "row", marginTop: 1 }}>
          {leftLabels && <View style={{ width: AXIS_W + 2 }} />}
          {bottomLabels.map((label, i) => (
            <View
              key={i}
              style={{
                width: size,
                height: AXIS_FS + 4,
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <Text style={{ fontSize: AXIS_FS, color: AXIS_COLOR }}>{String(label)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export function NumuneRaporPDF({ state, r }: { state: AnalizState; r: CalcResult }) {
  const tarakEn = num(state.olcum.tarakEn);
  const kursumEk = num(state.params.kursum) + num(state.params.ekMal);

  const dd = state.desen;
  const desenDolu = dd.armur.some((row) => row.some(Boolean));
  const desenMat = computeDesen(dd.tahar, dd.armur, dd.weftCount);

  const sapmaAbs = r.sapma == null ? null : Math.abs(r.sapma);
  const durum =
    sapmaAbs == null
      ? { t: "Ölçüm girilmedi", c: P.muted }
      : sapmaAbs <= 5
        ? { t: "Tutarlı — analiz doğru", c: P.ok }
        : sapmaAbs <= 10
          ? { t: "Sınırda — kontrol et", c: P.warn }
          : { t: "Tutmuyor — gözden geçir", c: P.bad };

  const tumIplikler = [...state.cozgu, ...state.atki];
  const fasonlu = tumIplikler.filter((it) => it.info?.fason);

  const maliyetKalemleri: Array<[string, number]> = [
    ["İplik (çözgü + atkı)", r.topI],
    ["İşçilik (KDV dahil)", r.fasI],
    ["Terbiye", r.terbM],
    ["Fire", r.fireM],
    ["Kurşum + ek malzeme", kursumEk],
  ];

  const parametreler: Array<[string, string]> = [
    ["Tezgah devri", `${nf(num(state.params.devir), 0)} rpm`],
    ["Randıman", `% ${nf(num(state.params.randiman), 1)}`],
    ["Terbiye fiyat", `${nf(num(state.params.terbiyeFiyat), 2)} $/kg`],
    ["Genel fire", `% ${nf(num(state.params.genelFire), 1)}`],
    ["Kurşum + sabit", `${nf(num(state.params.kursum), 2)} $/mt`],
    ["Ek malzeme", `${nf(num(state.params.ekMal), 2)} $/mt`],
  ];

  return (
    <Document title={`Numune Raporu — ${state.meta.numuneAd || "Numune"}`}>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.brand}>Numune Analiz & Maliyet</Text>
            <Text style={s.brandSub}>Rapor</Text>
          </View>
          <View style={s.metaRight}>
            <Text style={s.metaName}>{state.meta.numuneAd || "—"}</Text>
            <Text style={s.metaLine}>Müşteri: {state.meta.musteri || "—"}</Text>
            <Text style={s.metaLine}>Tarih: {state.meta.tarih}</Text>
          </View>
        </View>

        <View style={s.statRow}>
          <Stat label="Toplam maliyet" value={nf(r.total, 3)} unit="$/mt" color={P.accentDark} />
          <Stat label="Hesaplanan" value={nf(r.hesapM2, 1)} unit="g/m²" />
          <Stat label="Ölçülen" value={r.olcumM2 > 0 ? nf(r.olcumM2, 1) : "—"} unit="g/m²" />
          <View style={s.stat}>
            <Text style={s.statLabel}>Sapma</Text>
            <Text style={[s.statValue, { color: durum.c }]}>
              {r.sapma == null ? "—" : `${r.sapma > 0 ? "+" : ""}${nf(r.sapma, 1)}`}
              <Text style={s.statUnit}> %</Text>
            </Text>
            <Text style={[s.durumPill, { backgroundColor: durum.c }]}>{durum.t}</Text>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.secTitle}>Kompozisyon</Text>
          <Text style={s.note}>
            Tarak eni {nf(tarakEn, 0)} cm · Mamul eni {nf(num(state.olcum.mamulEn), 0)} cm
          </Text>
          <View style={{ height: 4 }} />
          <IplikTablo rows={state.cozgu} baslik="Çözgü" renk={P.warp} atki={false} tarakEn={tarakEn} fak={r.cozguFak} />
          <IplikTablo rows={state.atki} baslik="Atkı" renk={P.weft} atki={true} tarakEn={tarakEn} fak={r.atkiFak} />
        </View>

        <View style={s.section}>
          <Text style={s.secTitle}>Maliyet Dökümü</Text>
          <View style={s.table}>
            {maliyetKalemleri.map(([label, val]) => (
              <View key={label} style={s.tr}>
                <Text style={[s.td, { flex: 4 }]}>{label}</Text>
                <Text style={[s.td, { flex: 1.4 }, s.right]}>{nf(val, 3)} $</Text>
              </View>
            ))}
            <View style={[s.tr, s.trTotal, s.trLast]}>
              <Text style={[s.td, { flex: 4, fontWeight: 700 }]}>TOPLAM</Text>
              <Text style={[s.td, { flex: 1.4, fontWeight: 700, color: P.accentDark }, s.right]}>
                {nf(r.total, 3)} $/mt
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={s.note}>
              Gramaj: {nf(r.grmt, 1)} g/mt (çözgü {nf(r.grmtCozgu, 1)} · atkı {nf(r.grmtAtki, 1)})
            </Text>
            <Text style={s.note}>Kapasite: {nf(r.uAy, 0)} mt/ay</Text>
          </View>
        </View>

        <View style={[s.section, s.twoCol]}>
          <View style={s.col}>
            <Text style={s.secTitle}>Çekme</Text>
            <View style={s.kv}>
              <Text style={s.kvLabel}>Çözgü çekmesi</Text>
              <Text style={s.kvVal}>
                % {nf(cekmeOran(num(state.cekme.cozgu.lDuz), num(state.cekme.cozgu.lKumas)) * 100, 1)} (×
                {nf(r.cozguFak, 3)})
              </Text>
            </View>
            <View style={s.kv}>
              <Text style={s.kvLabel}>Atkı çekmesi</Text>
              <Text style={s.kvVal}>
                % {nf(cekmeOran(num(state.cekme.atki.lDuz), num(state.cekme.atki.lKumas)) * 100, 1)} (×
                {nf(r.atkiFak, 3)})
              </Text>
            </View>
          </View>
          <View style={s.col}>
            <Text style={s.secTitle}>Üretim & Finisaj</Text>
            {parametreler.map(([k, v]) => (
              <View key={k} style={s.kv}>
                <Text style={s.kvLabel}>{k}</Text>
                <Text style={s.kvVal}>{v}</Text>
              </View>
            ))}
          </View>
        </View>

        {fasonlu.length > 0 && (
          <View style={s.section}>
            <Text style={s.secTitle}>Fason İşlemler (bilgi — maliyete dahil değil)</Text>
            {fasonlu.map((it) => (
              <View key={it.id} style={s.kv}>
                <Text style={s.kvLabel}>{it.info.iplikAdi || it.info.firmaAdi || "İplik"}</Text>
                <Text style={s.kvVal}>
                  {it.info.fasonFirma || "—"} · {it.info.fasonIslem || "—"}
                  {it.info.fasonFiyat ? ` · ${it.info.fasonFiyat}` : ""}
                </Text>
              </View>
            ))}
          </View>
        )}

        {state.photos.length > 0 && (
          <View style={s.section} wrap={false}>
            <Text style={s.secTitle}>Fotoğraflar</Text>
            <View style={s.photoWrap}>
              {state.photos.map((p) => (
                <Image key={p.id} src={p.url} style={s.photo} />
              ))}
            </View>
          </View>
        )}

        <View style={s.footer} fixed>
          <Text>Numune Analiz & Maliyet</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>

      {desenDolu && (
        <Page size="A4" style={s.page}>
          <Text style={s.secTitle}>Desen — Tahar · Armür · Desen · Atkı Raporu</Text>
          <Text style={s.note}>
            Çözgü {dd.warpCount} · Atkı {dd.weftCount} · Çerçeve {dd.frameCount} · İro {dd.iroCount}
            {dd.raporX > 1 || dd.raporY > 1 ? ` · Rapor ${dd.raporX}×${dd.raporY}` : ""}
          </Text>

          <Text style={s.gridTitle}>Tahar (çözgü → çerçeve)</Text>
          <MatrixGrid
            rows={dd.frameCount}
            cols={dd.warpCount}
            size={fitSize(dd.warpCount)}
            isOn={(rr, cc) => dd.tahar[cc] === dd.frameCount - 1 - rr}
            fill={() => P.accent}
          />

          <View style={{ flexDirection: "row", gap: 18, marginTop: 6 }}>
            <View>
              <Text style={s.gridTitle}>Armür (çerçeve × atkı)</Text>
              <LabeledMatrixGrid
                rows={dd.weftCount}
                cols={dd.frameCount}
                size={fitSize(dd.frameCount)}
                isOn={(rr, cc) => Boolean(dd.armur[cc]?.[dd.weftCount - 1 - rr])}
                fill={() => P.accent}
                leftLabels={Array.from({ length: dd.weftCount }, (_, i) => dd.weftCount - i)}
                bottomLabels={Array.from({ length: dd.frameCount }, (_, i) => i + 1)}
              />
            </View>
            <View>
              <Text style={s.gridTitle}>Atkı Raporu (iro / renk)</Text>
              <LabeledMatrixGrid
                rows={dd.weftCount}
                cols={dd.iroCount}
                size={fitSize(dd.iroCount)}
                isOn={(rr, cc) => dd.iroData[dd.weftCount - 1 - rr] === cc + 1}
                fill={(_rr, cc) => IRO_COLORS[cc % IRO_COLORS.length]}
                bottomLabels={Array.from({ length: dd.iroCount }, (_, i) => i + 1)}
              />
            </View>
          </View>

          <Text style={s.gridTitle}>Desen (otomatik)</Text>
          <MatrixGrid
            rows={dd.weftCount * dd.raporY}
            cols={dd.warpCount * dd.raporX}
            size={fitSize(dd.warpCount * dd.raporX, 6)}
            isOn={(rr, cc) =>
              Boolean(
                desenMat[cc % dd.warpCount]?.[(dd.weftCount * dd.raporY - 1 - rr) % dd.weftCount],
              )
            }
            fill={() => "#111111"}
          />

          <View style={s.footer} fixed>
            <Text>Numune Analiz & Maliyet</Text>
            <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
          </View>
        </Page>
      )}
    </Document>
  );
}
