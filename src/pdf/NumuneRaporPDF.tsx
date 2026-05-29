import "./font";
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { AnalizState, CalcResult, Iplik } from "../lib/types";
import { num, parseIplikRaw, tukH, atkiGramaj, cekmeOran } from "../lib/calc";
import { fmt } from "../lib/format";

const P = {
  text: "#0f172a",
  muted: "#64748b",
  line: "#cbd5e1",
  lineDark: "#475569",
  bgMuted: "#eef2f7",
  bgRow: "#f8fafc",
  accent: "#3b6fd4",
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
    alignItems: "flex-end",
    borderBottomWidth: 2,
    borderBottomColor: P.accent,
    paddingBottom: 8,
    marginBottom: 12,
  },
  brand: { fontSize: 18, fontWeight: 700, color: P.accent, letterSpacing: 0.5 },
  brandSub: { fontSize: 9, color: P.muted, marginTop: 2 },
  metaRight: { textAlign: "right", fontSize: 9 },
  metaName: { fontSize: 12, fontWeight: 700 },
  metaLine: { color: P.muted, marginTop: 2 },

  // Sonuç şeridi
  statRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  stat: {
    flex: 1,
    borderWidth: 1,
    borderColor: P.line,
    borderRadius: 6,
    padding: 8,
    backgroundColor: P.bgRow,
  },
  statLabel: { fontSize: 8, color: P.muted, textTransform: "uppercase", letterSpacing: 0.4 },
  statValue: { fontSize: 18, fontWeight: 700, marginTop: 3 },
  statUnit: { fontSize: 8, color: P.muted, fontWeight: 400 },
  durumPill: {
    alignSelf: "flex-start",
    color: P.white,
    fontSize: 9,
    fontWeight: 700,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginTop: 4,
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

  // Tablo
  table: { borderWidth: 1, borderColor: P.line, borderRadius: 4, marginBottom: 6 },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: P.line },
  trLast: { borderBottomWidth: 0 },
  trHead: { backgroundColor: P.bgMuted },
  trTotal: { backgroundColor: P.bgRow },
  th: { fontSize: 8, fontWeight: 700, color: P.muted, padding: 4 },
  td: { fontSize: 9, padding: 4 },
  right: { textAlign: "right" },

  // İki kolon
  twoCol: { flexDirection: "row", gap: 10 },
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
  { key: "tip", label: "Tip", flex: 1.2 },
  { key: "no", label: "İplik (no × kat)", flex: 1.9 },
  { key: "sik", label: "Sıklık", flex: 1.1, right: true },
  { key: "fiyat", label: "Fiyat $/kg", flex: 1.2, right: true },
  { key: "gramaj", label: "Gramaj g/mt", flex: 1.3, right: true },
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
    return { row, denye, kat, g };
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
        {data.map(({ row, denye, kat, g }, i) => (
          <View key={row.id} style={[s.tr, i === data.length - 1 ? s.trLast : {}]}>
            <Text style={[s.td, { flex: COLS[0].flex }]}>{row.tip}</Text>
            <Text style={[s.td, { flex: COLS[1].flex }]}>
              {fmt(denye, 0)} × {kat}
            </Text>
            <Text style={[s.td, { flex: COLS[2].flex }, s.right]}>{fmt(num(row.sik), 1)}</Text>
            <Text style={[s.td, { flex: COLS[3].flex }, s.right]}>{fmt(num(row.fiyat), 2)}</Text>
            <Text style={[s.td, { flex: COLS[4].flex }, s.right]}>{fmt(g, 1)}</Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
        <Text style={{ fontSize: 9, fontWeight: 700 }}>
          Toplam {baslik.toLowerCase()} gramaj: {fmt(toplam, 1)} g/mt
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

export function NumuneRaporPDF({ state, r }: { state: AnalizState; r: CalcResult }) {
  const tarakEn = num(state.olcum.tarakEn);
  const kursumEk = num(state.params.kursum) + num(state.params.ekMal);

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
  const infoVar = tumIplikler.some((it) => it.info && (it.info.iplikAdi || it.info.firmaAdi || it.info.fason));

  const maliyetKalemleri: Array<[string, number]> = [
    ["İplik (çözgü + atkı)", r.topI],
    ["İşçilik (KDV dahil)", r.fasI],
    ["Terbiye", r.terbM],
    ["Fire", r.fireM],
    ["Kurşum + ek malzeme", kursumEk],
  ];

  const parametreler: Array<[string, string]> = [
    ["Tezgah devri", `${fmt(num(state.params.devir), 0)} rpm`],
    ["Randıman", `% ${fmt(num(state.params.randiman), 0)}`],
    ["Terbiye fiyat", `${fmt(num(state.params.terbiyeFiyat), 2)} $/kg`],
    ["Genel fire", `% ${fmt(num(state.params.genelFire), 1)}`],
    ["Kurşum + sabit", `${fmt(num(state.params.kursum), 2)} $/mt`],
    ["Ek malzeme", `${fmt(num(state.params.ekMal), 2)} $/mt`],
  ];

  return (
    <Document title={`Numune Raporu — ${state.meta.numuneAd || "Numune"}`}>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.brand}>TexAI</Text>
            <Text style={s.brandSub}>Numune Analiz & Maliyet Raporu</Text>
          </View>
          <View style={s.metaRight}>
            <Text style={s.metaName}>{state.meta.numuneAd || "—"}</Text>
            <Text style={s.metaLine}>Müşteri: {state.meta.musteri || "—"}</Text>
            <Text style={s.metaLine}>Tarih: {state.meta.tarih}</Text>
          </View>
        </View>

        {/* Sonuç şeridi */}
        <View style={s.statRow}>
          <Stat label="Toplam maliyet" value={fmt(r.total, 3)} unit="$/mt" color={P.accent} />
          <Stat label="Hesaplanan" value={fmt(r.hesapM2, 1)} unit="g/m²" />
          <Stat label="Ölçülen" value={r.olcumM2 > 0 ? fmt(r.olcumM2, 1) : "—"} unit="g/m²" />
          <View style={s.stat}>
            <Text style={s.statLabel}>Sapma</Text>
            <Text style={[s.statValue, { color: durum.c }]}>
              {r.sapma == null ? "—" : `${r.sapma > 0 ? "+" : ""}${fmt(r.sapma, 1)}`}
              <Text style={s.statUnit}> %</Text>
            </Text>
            <Text style={[s.durumPill, { backgroundColor: durum.c }]}>{durum.t}</Text>
          </View>
        </View>

        {/* Kompozisyon */}
        <View style={s.section}>
          <Text style={s.secTitle}>Kompozisyon</Text>
          <Text style={s.note}>
            Tarak eni {fmt(tarakEn, 0)} cm · Mamul eni {fmt(num(state.olcum.mamulEn), 0)} cm
          </Text>
          <View style={{ height: 4 }} />
          <IplikTablo rows={state.cozgu} baslik="Çözgü" renk={P.warp} atki={false} tarakEn={tarakEn} fak={r.cozguFak} />
          <IplikTablo rows={state.atki} baslik="Atkı" renk={P.weft} atki={true} tarakEn={tarakEn} fak={r.atkiFak} />
        </View>

        {/* Maliyet dökümü */}
        <View style={s.section}>
          <Text style={s.secTitle}>Maliyet Dökümü</Text>
          <View style={s.table}>
            {maliyetKalemleri.map(([label, val]) => (
              <View key={label} style={s.tr}>
                <Text style={[s.td, { flex: 4 }]}>{label}</Text>
                <Text style={[s.td, { flex: 1.4 }, s.right]}>{fmt(val, 3)} $</Text>
              </View>
            ))}
            <View style={[s.tr, s.trTotal, s.trLast]}>
              <Text style={[s.td, { flex: 4, fontWeight: 700 }]}>TOPLAM</Text>
              <Text style={[s.td, { flex: 1.4, fontWeight: 700, color: P.accent }, s.right]}>
                {fmt(r.total, 3)} $/mt
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={s.note}>
              Gramaj: {fmt(r.grmt, 1)} g/mt (çözgü {fmt(r.grmtCozgu, 1)} · atkı {fmt(r.grmtAtki, 1)})
            </Text>
            <Text style={s.note}>Kapasite: {fmt(r.uAy, 0)} mt/ay</Text>
          </View>
        </View>

        {/* Çekme + Parametreler (iki kolon) */}
        <View style={[s.section, s.twoCol]}>
          <View style={s.col}>
            <Text style={s.secTitle}>Çekme</Text>
            <View style={s.kv}>
              <Text style={s.kvLabel}>Çözgü çekmesi</Text>
              <Text style={s.kvVal}>
                % {fmt(cekmeOran(num(state.cekme.cozgu.lDuz), num(state.cekme.cozgu.lKumas)) * 100, 1)} (×
                {fmt(r.cozguFak, 3)})
              </Text>
            </View>
            <View style={s.kv}>
              <Text style={s.kvLabel}>Atkı çekmesi</Text>
              <Text style={s.kvVal}>
                % {fmt(cekmeOran(num(state.cekme.atki.lDuz), num(state.cekme.atki.lKumas)) * 100, 1)} (×
                {fmt(r.atkiFak, 3)})
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

        {/* İplik bilgileri (info / fason) */}
        {infoVar && (
          <View style={s.section}>
            <Text style={s.secTitle}>İplik Bilgileri (fason dahil — maliyete dahil değil)</Text>
            {tumIplikler
              .filter((it) => it.info && (it.info.iplikAdi || it.info.firmaAdi || it.info.fason))
              .map((it) => (
                <View key={it.id} style={{ marginBottom: 4 }}>
                  <Text style={{ fontWeight: 700 }}>
                    {it.info.iplikAdi || "(adsız iplik)"} {it.info.firmaAdi ? `· ${it.info.firmaAdi}` : ""}
                  </Text>
                  {it.info.fason && (
                    <Text style={s.note}>
                      Fason: {it.info.fasonFirma || "—"} · İşlem: {it.info.fasonIslem || "—"} · Fiyat:{" "}
                      {it.info.fasonFiyat || "—"}
                    </Text>
                  )}
                </View>
              ))}
          </View>
        )}

        {/* Fotoğraflar */}
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

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text>TexAI · Numune Analiz & Maliyet</Text>
          <Text
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
